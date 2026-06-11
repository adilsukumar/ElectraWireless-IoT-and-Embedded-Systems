import { toast } from "sonner";

// Standard UUIDs for the HM-10 and its many clones
const UART_SERVICES = [
  0xFFE0, // Standard HM-10, CC41-A, MLT-BT05, AT-09
  0xFFF0, // Common clone alternative
  0xFF00  // Common clone alternative
];

// In-memory registry of connected GATT characteristics keyed by device ID
const connectedCharacteristics = new Map<string, BluetoothRemoteGATTCharacteristic>();

export interface BluetoothPairResult {
  id: string;
  name: string;
}

/**
 * Triggers the browser's native Bluetooth pairing dialog.
 * Must be called in response to a user gesture (e.g., button click).
 */
export async function pairBluetoothDevice(existingId?: string): Promise<BluetoothPairResult | null> {
  try {
    if (!navigator.bluetooth) {
      throw new Error("Web Bluetooth API is not available in this browser. Ensure you are using Chrome/Edge and running on localhost or HTTPS.");
    }

    // Many cheap HM-10 clones do not advertise their Service UUID in the discovery packet.
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: UART_SERVICES
    });

    if (!device || !device.gatt) {
      throw new Error("Device does not support GATT (It might be an HC-05 instead of an HM-10).");
    }

    const server = await device.gatt.connect();
    
    let service: BluetoothRemoteGATTService | undefined;
    let characteristic: BluetoothRemoteGATTCharacteristic | undefined;

    for (const uuid of UART_SERVICES) {
      try {
        service = await server.getPrimaryService(uuid);
        if (service) {
          characteristic = await service.getCharacteristic(uuid + 1); // Characteristic is usually Service UUID + 1
          if (characteristic) {
            console.log(`Connected successfully using UART Service UUID: 0x${uuid.toString(16)}`);
            break;
          }
        }
      } catch (e) {
        // Ignore and try the next UUID
      }
    }

    if (!characteristic) {
      throw new Error("Could not find a compatible UART Service. Are you sure this is an HM-10/BLE module and not an HC-05?");
    }

    // Generate a unique ID for this device in our home state, or use the existing one
    const deviceId = existingId || `ELLY-BLE-${Math.floor(Math.random() * 10000)}`;
    
    // Cache the write characteristic so we can toggle it later
    connectedCharacteristics.set(deviceId, characteristic);

    // Handle device disconnection to cleanup cache
    device.addEventListener('gattserverdisconnected', () => {
      console.warn(`Bluetooth device ${device.name} disconnected.`);
      connectedCharacteristics.delete(deviceId);
    });

    return {
      id: deviceId,
      name: device.name || "Unknown BLE Device",
    };
  } catch (error) {
    console.error("Bluetooth pairing error:", error);
    throw error;
  }
}

/**
 * Triggers Bluetooth pairing if not already connected.
 * Returns true if connected, false if failed/cancelled.
 */
export async function activateBluetoothDevice(id: string): Promise<boolean> {
  try {
    let characteristic = connectedCharacteristics.get(id);
    if (!characteristic) {
      console.log(`No active Bluetooth connection for device ${id}. Prompting pairing dialog...`);
      await pairBluetoothDevice(id);
      characteristic = connectedCharacteristics.get(id);
      
      if (!characteristic) {
        console.warn("Pairing was cancelled or failed.");
        toast.error("ELLY: Bluetooth pairing cancelled.");
        return false;
      }
    }
    return true;
  } catch (error: any) {
    console.error(`Failed to activate BLE device ${id}:`, error);
    if (error.name === "NotFoundError" || error.message.includes("cancelled")) {
      toast.error("ELLY: Bluetooth pairing cancelled.");
    } else if (error.message && error.message.includes("User gesture")) {
       toast.error("ELLY: Browser blocked Bluetooth: You must click a button directly to pair.");
    } else {
       toast.error(`ELLY: Bluetooth Error: ${error.message}`);
    }
    return false; // Return false so UI doesn't activate
  }
}

/**
 * Writes a 1 or 0 byte to the connected Bluetooth device.
 * Does not prompt for pairing.
 */
export async function toggleBluetoothDevice(id: string, isOn: boolean): Promise<boolean> {
  try {
    let characteristic = connectedCharacteristics.get(id);
    
    if (!characteristic) {
      console.warn(`No active Bluetooth connection for device ${id}. Faking toggle OFF for UI.`);
      return true;
    }

    // Send ASCII '1' (49) for ON and '0' (48) for OFF. 
    // This is required because HM-10 acts as a Serial passthrough to the Arduino.
    const payload = new Uint8Array([isOn ? 49 : 48]);
    await characteristic.writeValueWithoutResponse(payload);
    
    console.log(`Successfully sent ${isOn ? 'ON (1)' : 'OFF (0)'} to BLE device ${id}`);
    return true;
  } catch (error: any) {
    console.warn(`Failed to write to BLE device ${id}. Faking toggle for UI.`, error);
    if (error.message && error.message.includes("User gesture")) {
       toast.error("Browser blocked Bluetooth: You must click a button directly to pair.");
    } else {
       toast.error(`Bluetooth Error: ${error.message || "Unsupported browser or insecure context."}`);
    }
    return true; // Fallback so the UI is never stuck
  }
}
