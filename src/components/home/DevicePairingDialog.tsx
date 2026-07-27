import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHome } from "@/lib/home/store";
import { toast } from "sonner";
import type { DeviceType, Device } from "@/lib/home/types";

export function DevicePairingDialog() {
  const { state, dispatch, newlyDiscoveredDevice, setNewlyDiscoveredDevice } = useHome();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [deviceType, setDeviceType] = useState<DeviceType | "">("");

  useEffect(() => {
    if (newlyDiscoveredDevice) {
      setOpen(true);
      setName(newlyDiscoveredDevice.name || "Unknown Device");
      setRoomId(state.rooms[0]?.id || "");
    } else {
      setOpen(false);
    }
  }, [newlyDiscoveredDevice, state.rooms]);

  const handleClose = () => {
    setOpen(false);
    setNewlyDiscoveredDevice(null);
  };

  const handleSave = () => {
    if (!name || !roomId || !deviceType) {
      toast.error("Please fill out all fields.");
      return;
    }

    const newDevice: Device = {
      id: `ELLY-${deviceType.toString().toUpperCase().slice(0, 2)}-${Math.random().toString(36).slice(2, 6)}`,
      name: name,
      type: deviceType as DeviceType,
      roomId,
      on: false,
      online: true,
      watts: 15,
      connectionType: "direct",
      macAddress: newlyDiscoveredDevice.address,
    };

    dispatch({ type: "ADD_DEVICE", device: newDevice });
    toast.success(`Appliance "${newDevice.name}" added successfully`);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) handleClose();
    }}>
      <DialogContent className="sm:max-w-[425px] border-slate-200 dark:border-white/10 bg-white dark:bg-[#111116] text-slate-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New Appliance Found!</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-neutral-400">
            ELLY discovered a new Bluetooth device nearby. Let's set it up.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">MAC Address</label>
            <div className="text-sm p-3 bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl font-mono">
              {newlyDiscoveredDevice?.address}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Appliance Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Living Room AC"
              className="bg-slate-100 dark:bg-black border-slate-200 dark:border-white/5 rounded-xl h-12"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Appliance Type</label>
            <Select value={deviceType} onValueChange={(val) => setDeviceType(val as DeviceType)}>
              <SelectTrigger className="bg-slate-100 dark:bg-black border-slate-200 dark:border-white/5 rounded-xl h-12">
                <SelectValue placeholder="Select Type..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#181820] border-slate-200 dark:border-white/10">
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="fan">Fan</SelectItem>
                <SelectItem value="ac">Air Conditioner</SelectItem>
                <SelectItem value="tv">TV / Display</SelectItem>
                <SelectItem value="plug">Smart Plug</SelectItem>
                <SelectItem value="appliance">Kitchen Appliance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Assign to Room</label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger className="bg-slate-100 dark:bg-black border-slate-200 dark:border-white/5 rounded-xl h-12">
                <SelectValue placeholder="Select Room..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#181820] border-slate-200 dark:border-white/10">
                {state.rooms.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} className="rounded-xl h-12 hover:bg-slate-100 dark:hover:bg-white/5">
            Ignore Device
          </Button>
          <Button onClick={handleSave} className="rounded-xl h-12 bg-blue-500 hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)] text-white font-semibold">
            Add to ELLY
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
