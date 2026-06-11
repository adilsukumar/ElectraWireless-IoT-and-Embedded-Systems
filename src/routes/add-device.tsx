import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a device name.");
      return;
    }

    const newDevice: Device = {
      id: `ELLY-${type.toUpperCase().substring(0, 2)}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      type,
      roomId,
      on: false,
      online: true,
      watts: type === "light" ? 10 : type === "ac" ? 1000 : type === "tv" ? 120 : 50,
    };

    dispatch({ type: "ADD_DEVICE", device: newDevice });
    toast.success(`Device "${newDevice.name}" added successfully.`);
    router.navigate({ to: "/all-devices" });
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.history.back()}
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold">Add New Device</h1>
          <p className="text-sm text-muted-foreground">Register a new smart device.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-border bg-card p-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Device Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="e.g., Living Room Fan"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Room</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
          >
            {state.rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Device Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as DeviceType)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="light">Light</option>
            <option value="plug">Smart Plug</option>
            <option value="ac">Air Conditioner</option>
            <option value="fan">Fan</option>
            <option value="fridge">Refrigerator</option>
            <option value="appliance">Appliance</option>
            <option value="tv">Television</option>
            <option value="sensor">Sensor</option>
          </select>
        </div>

        <Button type="submit" className="w-full rounded-xl">
          Add Device
        </Button>
      </form>
    </div>
  );
}
