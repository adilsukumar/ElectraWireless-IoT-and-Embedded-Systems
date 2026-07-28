import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Radar, Bluetooth, Wifi, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useHome } from "@/lib/home/store";
import type { Device, DeviceType } from "@/lib/home/types";
import { pairBluetoothDevice, startNativeBluetoothScan } from "@/lib/home/bluetooth";

export const Route = createFileRoute("/add-device")({
  head: () => ({
    meta: [
      { title: "Add Device, ELLY Home" },
      { name: "description", content: "Scan and add a new smart device." },
    ],
  }),
  component: AddDevicePage,
});

type DiscoveredDevice = {
  id: string;
  name: string;
  type: "wifi" | "ble";
  address: string;
  ecosystem?: string;
};

function AddDevicePage() {
  const { state, dispatch } = useHome();
  const router = useRouter();

  const [step, setStep] = useState<"scan" | "setup">("scan");
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DiscoveredDevice | null>(null);

  // Setup Form State
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState(state.rooms[0]?.id || "");
  const [type, setType] = useState<DeviceType>("light");

  // Simulated Web Wi-Fi Discovery
  useEffect(() => {
    if (step !== "scan") return;

    const isNative = (window as any).Capacitor?.isNativePlatform();
    
    if (isNative) {
      // Live Native BLE Discovery
      startNativeBluetoothScan((device: any) => {
        const mapped: DiscoveredDevice = {
          id: device.id || `ELLY-BLE-${Math.random().toString(36).substring(7)}`,
          name: device.name || "Unknown BLE Device",
          type: "ble",
          address: device.address || device.macAddress || ""
        };
        // Avoid duplicates
        setDiscoveredDevices(prev => {
          if (prev.some(d => d.address === mapped.address)) return prev;
          return [...prev, mapped];
        });
      });
    }
    
    // Simulate Wi-Fi Discovery (always run for demo purposes so the UI isn't completely empty if BLE fails)
    const timer1 = setTimeout(() => {
      setDiscoveredDevices(prev => {
        if (prev.some(d => d.id === "sim-1")) return prev;
        return [...prev, { id: "sim-1", name: "Smart Plug (Tuya)", type: "wifi", address: "192.168.1.155", ecosystem: "tuya" }];
      });
    }, 2500);

    const timer2 = setTimeout(() => {
      setDiscoveredDevices(prev => {
        if (prev.some(d => d.id === "sim-2")) return prev;
        return [...prev, { id: "sim-2", name: "Living Room Light (WLED)", type: "wifi", address: "192.168.1.180", ecosystem: "wled" }];
      });
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [step]);

  const handleWebBluetoothScan = async () => {
    try {
      const result = await pairBluetoothDevice();
      if (result) {
        setDiscoveredDevices(prev => [
          ...prev,
          { id: result.id, name: result.name, type: "ble", address: result.macAddress || "" }
        ]);
        toast.success(`Found ${result.name}!`);
      }
    } catch (e: any) {
      if (e.name !== "NotFoundError" && !e.message?.includes("cancelled")) {
        toast.error(`Scan failed: ${e.message}`);
      }
    }
  };

  const handleSelectDevice = (dev: DiscoveredDevice) => {
    setSelectedDevice(dev);
    setName(dev.name);
    
    // Guess type based on name
    const n = dev.name.toLowerCase();
    if (n.includes("plug") || n.includes("socket")) setType("plug");
    else if (n.includes("ac") || n.includes("air")) setType("ac");
    else if (n.includes("fan")) setType("fan");
    else if (n.includes("tv")) setType("tv");
    else setType("light");

    setStep("setup");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedDevice) {
      toast.error("Please enter a device name.");
      return;
    }

    const newDevice: Device = {
      id: selectedDevice.id.startsWith("sim-") 
          ? `ELLY-${type.toUpperCase().substring(0, 2)}-${Math.floor(Math.random() * 1000)}` 
          : selectedDevice.id, // preserve BLE id so it stays connected
      name: name.trim(),
      type,
      roomId,
      on: false,
      online: true,
      watts: type === "light" ? 10 : type === "ac" ? 1000 : type === "tv" ? 120 : 50,
      connectionType: selectedDevice.type,
      ecosystem: selectedDevice.ecosystem || "generic",
      ...(selectedDevice.type === "wifi" ? { ipAddress: selectedDevice.address } : { macAddress: selectedDevice.address }),
    };

    dispatch({ type: "ADD_DEVICE", device: newDevice });
    toast.success(`Device "${newDevice.name}" added successfully.`);
    router.navigate({ to: "/all-devices" });
  };

  const isNative = (window as any).Capacitor?.isNativePlatform();

  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen text-slate-900 dark:text-white pb-24 -mx-4 px-4 sm:-mx-8 sm:px-8">
      <div className="mx-auto max-w-xl space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => step === "setup" ? setStep("scan") : router.history.back()}
            className="p-2 bg-white/40 dark:bg-[#111116] rounded-full hover:bg-white/60 dark:bg-[#111116]/10 transition-colors border border-blue-200 dark:border-white/5"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              {step === "scan" ? "Discover Devices" : "Setup Device"}
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">
              {step === "scan" ? "Scanning for local smart appliances..." : "Configure your new smart device."}
            </p>
          </div>
        </div>

        {step === "scan" ? (
          <div className="space-y-8 mt-8">
            {/* Radar Animation */}
            <div className="relative flex items-center justify-center h-48 w-full">
              <div className="absolute w-32 h-32 bg-purple-500/20 rounded-full animate-ping" />
              <div className="absolute w-48 h-48 border border-purple-500/30 rounded-full" />
              <div className="absolute w-64 h-64 border border-blue-500/20 rounded-full" />
              <div className="z-10 bg-purple-600 rounded-full p-4 shadow-[0_0_30px_rgba(147,51,234,0.5)]">
                <Radar className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>

            {/* Web Bluetooth Manual Trigger */}
            {!isNative && (
              <div className="flex justify-center">
                <button
                  onClick={handleWebBluetoothScan}
                  className="flex items-center gap-2 bg-[#111116] dark:bg-white/10 hover:bg-black dark:hover:bg-white/20 border border-purple-500/30 px-6 py-3 rounded-full text-sm font-bold transition-all shadow-lg"
                >
                  <Bluetooth className="w-4 h-4 text-blue-400" />
                  Pair Web Bluetooth Device
                </button>
              </div>
            )}

            {/* Discovered Devices List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 px-2 uppercase tracking-wider flex items-center justify-between">
                Discovered in Area
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              </h3>
              
              {discoveredDevices.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                  Listening for signals...
                </div>
              ) : (
                <div className="space-y-2">
                  {discoveredDevices.map((dev, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleSelectDevice(dev)}
                      className="flex items-center justify-between p-4 bg-white/60 dark:bg-[#111116]/80 border border-purple-200 dark:border-white/5 rounded-2xl hover:border-purple-500 cursor-pointer transition-all shadow-sm group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                          {dev.type === "wifi" ? (
                            <Wifi className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <Bluetooth className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{dev.name}</p>
                          <p className="text-xs text-slate-500">{dev.address || "No Address"}</p>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-center text-xs text-slate-500">
              Make sure your device is powered on and in pairing mode.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-purple-200 dark:border-purple-500/25 bg-white/40 dark:bg-purple-950/30 backdrop-blur-md p-6 shadow-sm">
            <div className="bg-purple-50 dark:bg-[#111116] p-4 rounded-xl border border-purple-100 dark:border-white/5 mb-6">
              <p className="text-xs text-slate-500 mb-1 uppercase font-bold">Selected Hardware</p>
              <div className="flex items-center gap-2">
                 {selectedDevice?.type === "wifi" ? <Wifi className="w-4 h-4 text-purple-500" /> : <Bluetooth className="w-4 h-4 text-blue-500" />}
                 <p className="text-sm font-medium">{selectedDevice?.name} <span className="text-slate-500">({selectedDevice?.address})</span></p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 dark:text-white">Device Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-blue-200 dark:border-white/10 bg-white/50 dark:bg-[#111116]/50 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="e.g., Living Room Fan"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 dark:text-white">Room</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full rounded-xl border border-blue-200 dark:border-white/10 bg-white/50 dark:bg-[#111116]/50 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors appearance-none"
              >
                {state.rooms.map((room) => (
                  <option key={room.id} value={room.id} className="bg-white dark:bg-[#111116]">
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 dark:text-white">Device Type / Icon</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DeviceType)}
                className="w-full rounded-xl border border-blue-200 dark:border-white/10 bg-white/50 dark:bg-[#111116]/50 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors appearance-none"
              >
                <option value="light" className="bg-white dark:bg-[#111116]">Light</option>
                <option value="plug" className="bg-white dark:bg-[#111116]">Smart Plug</option>
                <option value="ac" className="bg-white dark:bg-[#111116]">Air Conditioner</option>
                <option value="fan" className="bg-white dark:bg-[#111116]">Fan</option>
                <option value="fridge" className="bg-white dark:bg-[#111116]">Refrigerator</option>
                <option value="appliance" className="bg-white dark:bg-[#111116]">Appliance</option>
                <option value="tv" className="bg-white dark:bg-[#111116]">Television</option>
                <option value="sensor" className="bg-white dark:bg-[#111116]">Sensor</option>
              </select>
            </div>

            <button type="submit" className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)] mt-8">
              Complete Setup
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
