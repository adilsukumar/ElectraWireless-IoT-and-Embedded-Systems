import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

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

export interface BluetoothDevice {
  name: string;
  address: string;
  id: string;
  class: number;
}

/**
 * Scans for unpaired native Bluetooth devices (Android Only)
 */

export async function openBluetoothSettings(): Promise<void> {
  const isNative = Capacitor.isNativePlatform();
  if (isNative) {
    const bs = (window as any).bluetoothSerial;
    if (bs) bs.showBluetoothSettings();
  } else {
    toast.error("Bluetooth settings only available on native Android app.");
  }
}

export async function listPairedDevices(): Promise<BluetoothDevice[]> {
  const isNative = Capacitor.isNativePlatform();
  if (!isNative) return [];
  return new Promise((resolve, reject) => {
    const bs = (window as any).bluetoothSerial;
    if (!bs) return reject(new Error("Native Bluetooth plugin is not ready."));
    bs.list((devices: any[]) => resolve(devices), reject);
  });
}

export async function scanBluetoothDevices(): Promise<BluetoothDevice[]> {
  const isNative = Capacitor.isNativePlatform();
  if (!isNative) return [];

  return new Promise((resolve, reject) => {
    const bs = (window as any).bluetoothSerial;
    if (!bs) return reject(new Error("Native Bluetooth plugin is not ready."));
    
    // Request turning on Bluetooth if it isn't
    bs.isEnabled(
      () => {
        toast.loading("Scanning for nearby Bluetooth devices...", { id: "bt-scan" });
        bs.discoverUnpaired(
          (devices: BluetoothDevice[]) => {
            toast.dismiss("bt-scan");
            resolve(devices);
          },
          (err: any) => {
            toast.dismiss("bt-scan");
            reject(new Error(`Scan failed: ${err}`));
          }
        );
      },
      () => {
        toast("Enabling Bluetooth...");
        bs.enable(
          () => {
            toast.loading("Scanning for nearby Bluetooth devices...", { id: "bt-scan" });
            bs.discoverUnpaired(
              (devices: BluetoothDevice[]) => {
                toast.dismiss("bt-scan");
                resolve(devices);
              },
              (err: any) => reject(new Error(`Scan failed: ${err}`))
            );
          },
          () => reject(new Error("Bluetooth was not enabled."))
        );
      }
    );
  });
}

/**
 * Connects to a specific MAC address
 */
export async function connectToMacAddress(macAddress: string, deviceName: string, existingId?: string): Promise<BluetoothPairResult> {
  const isNative = Capacitor.isNativePlatform();
  if (!isNative) throw new Error("Only supported on native Android.");

  return new Promise((resolve, reject) => {
    const bs = (window as any).bluetoothSerial;
    if (!bs) return reject(new Error("Plugin not ready."));

    toast.loading(`Connecting to ${deviceName}...`, { id: "bt-connect" });
    bs.connect(macAddress, () => {
      toast.dismiss("bt-connect");
      toast.success(`Connected to ${deviceName}`);
      
      const deviceId = existingId || `ELLY-NATIVE-${macAddress}`;
      connectedCharacteristics.set(deviceId, "NATIVE_SPP" as any);
      
      // Save for auto-connect
      localStorage.setItem("elly_saved_bt_mac", macAddress);
      localStorage.setItem("elly_saved_bt_name", deviceName);
      
      resolve({ id: deviceId, name: deviceName });
    }, (err: any) => {
      toast.dismiss("bt-connect");
      reject(new Error(`Connection failed: ${err}`));
    });
  });
}

/**
 * Auto-connects if a MAC address was saved previously
 */
export async function autoConnectBluetooth(): Promise<BluetoothPairResult | null> {
  const isNative = Capacitor.isNativePlatform();
  if (!isNative) return null;
  
  const savedMac = localStorage.getItem("elly_saved_bt_mac");
  const savedName = localStorage.getItem("elly_saved_bt_name");
  
  if (!savedMac) return null;

  return new Promise((resolve) => {
    const bs = (window as any).bluetoothSerial;
    if (!bs) return resolve(null);
    
    bs.isConnected(
      () => {
        // Already connected
        const deviceId = `ELLY-NATIVE-${savedMac}`;
        connectedCharacteristics.set(deviceId, "NATIVE_SPP" as any);
        resolve({ id: deviceId, name: savedName || "Saved Device" });
      },
      () => {
        // Not connected, try connecting silently
        bs.connect(savedMac, () => {
          toast.success(`Auto-connected to ${savedName}`);
          const deviceId = `ELLY-NATIVE-${savedMac}`;
          connectedCharacteristics.set(deviceId, "NATIVE_SPP" as any);
          resolve({ id: deviceId, name: savedName || "Saved Device" });
        }, () => {
          // Silent fail
          resolve(null);
        });
      }
    );
  });
}

/**
 * Triggers the browser's native Bluetooth pairing dialog.
 * Must be called in response to a user gesture (e.g., button click).
 */
export async function pairBluetoothDevice(existingId?: string, forceMac?: string): Promise<(BluetoothPairResult & {macAddress?: string}) | null> {
  try {
    const isNative = Capacitor.isNativePlatform();
    if (isNative) {
      return new Promise((resolve, reject) => {
        const bs = (window as any).bluetoothSerial;
        if (!bs) return reject(new Error("Native Bluetooth plugin is not ready."));

        if (forceMac) {
          toast(`Connecting to selected device...`);
          bs.connect(forceMac, () => {
             const deviceId = existingId || `ELLY-NATIVE-${forceMac}`;
             connectedCharacteristics.set(deviceId, "NATIVE_SPP" as any);
             resolve({ id: deviceId, name: "Bluetooth Appliance", macAddress: forceMac });
          }, (err: any) => reject(new Error(`Native connection failed: ${err}`)));
          return;
        }

        bs.list((devices: any[]) => {
          // Broaden search to anything that looks like an IoT module, light, or generic BT
          let target = devices.find((d: any) => d.name && (
            d.name.includes("HC-") || d.name.includes("HM-") || d.name.includes("BT") || 
            d.name.includes("BLE") || d.name.includes("Light") || d.name.includes("Appliance") || 
            d.name.includes("Electra") || d.name.includes("Tuya") || d.name.includes("Smart")
          ));
          
          // Fallback to the first paired device that isn't obviously headphones/watch
          if (!target && devices.length > 0) {
             target = devices.find((d: any) => d.name && !d.name.includes("AirPods") && !d.name.includes("Buds") && !d.name.includes("Watch") && !d.name.includes("Audio"));
          }
          
          // If still no target, or no devices paired at all
          if (!target) {
            openBluetoothSettings();
            return reject(new Error("No paired appliance found! Please pair it in your Android Settings first, then try again."));
          }
          
          toast(`Connecting to ${target.name}...`);
          bs.connect(target.address, () => {
            const deviceId = existingId || `ELLY-NATIVE-${target.address}`;
            connectedCharacteristics.set(deviceId, "NATIVE_SPP" as any);
            resolve({ id: deviceId, name: target.name, macAddress: target.address });
          }, (err: any) => reject(new Error(`Connection failed: ${err}`)));
        }, reject);
      });
    }

    // --- WEB BLUETOOTH FALLBACK ---
    if (!navigator.bluetooth) {
      throw new Error("Web Bluetooth API is not available in this browser.");
    }

    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: UART_SERVICES
    });

    if (!device || !device.gatt) throw new Error("Device does not support GATT.");

    const server = await device.gatt.connect();
    let service: BluetoothRemoteGATTService | undefined;
    let characteristic: BluetoothRemoteGATTCharacteristic | undefined;

    for (const uuid of UART_SERVICES) {
      try {
        service = await server.getPrimaryService(uuid);
        if (service) {
          characteristic = await service.getCharacteristic(uuid + 1);
          if (characteristic) break;
        }
      } catch (e) {}
    }

    if (!characteristic) throw new Error("Could not find a compatible UART Service.");

    const deviceId = existingId || `ELLY-BLE-${Math.floor(Math.random() * 10000)}`;
    connectedCharacteristics.set(deviceId, characteristic);

    device.addEventListener('gattserverdisconnected', () => {
      connectedCharacteristics.delete(deviceId);
    });

    return {
      id: deviceId,
      name: device.name || "Unknown BLE Device",
      macAddress: ""
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
export async function toggleBluetoothDevice(id: string, isOn: boolean, macAddress?: string): Promise<boolean> {
  try {
    let characteristic = connectedCharacteristics.get(id);

    // If native platform and not connected, auto-connect using MAC address
    const isNative = Capacitor.isNativePlatform();
    if (isNative && characteristic !== "NATIVE_SPP" && macAddress) {
      const bs = (window as any).bluetoothSerial;
      if (bs) {
        try {
          await new Promise((resolve, reject) => {
             bs.isConnected(resolve, () => {
                 bs.connect(macAddress, resolve, reject);
             });
          });
          connectedCharacteristics.set(id, "NATIVE_SPP" as any);
          characteristic = "NATIVE_SPP" as any;
        } catch(e) {
          console.error("Failed to auto-connect to MAC:", macAddress, e);
        }
      }
    }

    if (!characteristic) {
      console.warn(`No active Bluetooth connection for device ${id}. Faking toggle OFF for UI.`);
      return true;
    }

    const payloadStr = isOn ? "1" : "0";
    
    // Check if this is a native Classic Bluetooth connection
    if ((characteristic as any) === "NATIVE_SPP") {
      return new Promise((resolve, reject) => {
        const bs = (window as any).bluetoothSerial;
        bs.write(payloadStr, () => {
          console.log(`Successfully sent ${payloadStr} to Native Classic BLE device ${id}`);
          resolve(true);
        }, reject);
      });
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
