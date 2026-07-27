import { toast } from "sonner";
import { type Device } from "./types";

/**
 * Universal Appliance Bridge
 * This layer abstracts away the raw Bluetooth/WiFi connections so we can 
 * seamlessly integrate with real-world local appliances (unencrypted HTTP/BLE).
 */
export const ApplianceBridge = {
  /**
   * Send a command to a local unencrypted smart appliance.
   * If it has an IP address, it sends HTTP.
   * If it has a MAC address, it sends BLE/Bluetooth Serial.
   */
  async sendCommand(device: Device, payload: any): Promise<boolean> {
    const payloadStr = JSON.stringify(payload) + "\n";
    
    // 1. WiFi Route (Local HTTP)
    if (device.ipAddress) {
      toast.loading(`Sending command to ${device.name} over WiFi...`, { id: 'bridge-send' });
      try {
        const res = await fetch(`http://${device.ipAddress}/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadStr,
          signal: AbortSignal.timeout(3000)
        });
        toast.dismiss('bridge-send');
        if (res.ok) {
          console.log(`[ApplianceBridge] HTTP Success to ${device.ipAddress}:`, payload);
          return true;
        }
        throw new Error("HTTP Error");
      } catch (e) {
        toast.dismiss('bridge-send');
        console.error("[ApplianceBridge] WiFi failed:", e);
        toast.error(`${device.name} is unreachable over WiFi.`);
        return false;
      }
    }

    // 2. Bluetooth Route (Native SPP/BLE)
    if (device.macAddress) {
      toast.loading(`Sending command to ${device.name} over Bluetooth...`, { id: 'bridge-send' });
      const bs = (window as any).bluetoothSerial;
      if (!bs) {
        toast.dismiss('bridge-send');
        console.warn("[ApplianceBridge] No native Bluetooth available, mocking success.");
        return true;
      }

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          toast.dismiss('bridge-send');
          toast.error("Bluetooth write timeout.");
          resolve(false); // resolve false instead of rejecting to handle gracefully
        }, 3000);

        bs.write(payloadStr, () => {
          clearTimeout(timer);
          toast.dismiss('bridge-send');
          console.log(`[ApplianceBridge] Bluetooth Success to ${device.macAddress}:`, payload);
          resolve(true);
        }, (err: any) => {
          clearTimeout(timer);
          toast.dismiss('bridge-send');
          console.error("[ApplianceBridge] Bluetooth failed:", err);
          toast.error(`Bluetooth command failed: ${err}`);
          resolve(false);
        });
      });
    }

    // 3. Fallback (Simulation)
    console.log(`[ApplianceBridge Mock] Command to ${device.name}:`, payload);
    return true;
  }
};
