import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { useHome } from "@/lib/home/store";
import type { Device, DeviceType } from "@/lib/home/types";
import { toast } from "sonner";

export const Route = createFileRoute("/add-device")({
  head: () => ({
    meta: [
      { title: "Add Device, ELLY Home" },
      { name: "description", content: "Add a new device to your home." },
    ],
  }),
  component: AddDevicePage,
});

function AddDevicePage() {
  const { state, dispatch } = useHome();
  const router = useRouter();

  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState(state.rooms[0]?.id || "");
  const [type, setType] = useState<DeviceType>("light");
  const [networkAddress, setNetworkAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a device name.");
      return;
    }

    const isIP = networkAddress.includes(".");

    const newDevice: Device = {
      id: `ELLY-${type.toUpperCase().substring(0, 2)}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      type,
      roomId,
      on: false,
      online: true,
      watts: type === "light" ? 10 : type === "ac" ? 1000 : type === "tv" ? 120 : 50,
      connectionType: networkAddress ? (isIP ? "wifi" : "ble") : "wifi", // Default to wifi for manual testing if left blank
      ...(isIP ? { ipAddress: networkAddress } : { macAddress: networkAddress }),
    };

    dispatch({ type: "ADD_DEVICE", device: newDevice });
    toast.success(`Device "${newDevice.name}" added successfully.`);
    router.navigate({ to: "/all-devices" });
  };

  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen text-slate-900 dark:text-white pb-24 -mx-4 px-4 sm:-mx-8 sm:px-8">
      <div className="mx-auto max-w-xl space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.history.back()}
            className="p-2 bg-white/40 dark:bg-[#111116] rounded-full hover:bg-white/60 dark:bg-[#111116]/10 transition-colors border border-blue-200 dark:border-white/5"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Add New Device</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">Register a new smart device.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-purple-200 dark:border-purple-500/25 bg-white/40 dark:bg-purple-950/30 backdrop-blur-md p-6 shadow-sm">
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
            <label className="text-sm font-bold text-slate-900 dark:text-white">Device Type</label>
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

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Network Address (Optional)</label>
            <input
              type="text"
              value={networkAddress}
              onChange={(e) => setNetworkAddress(e.target.value)}
              className="w-full rounded-xl border border-blue-200 dark:border-white/10 bg-white/50 dark:bg-[#111116]/50 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="e.g., 192.168.1.50 (for Wi-Fi) or empty"
            />
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              Enter an IP address for Wi-Fi devices. Leave blank for a simulated Wi-Fi device.
            </p>
          </div>

          <button type="submit" className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            Add Device
          </button>
        </form>
      </div>
    </div>
  );
}
