import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Cpu, DoorOpen, Info, Plus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/devices")({
  component: DevicesPage,
});

function DevicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full">
          <Link to="/">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-extrabold text-primary">Devices</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/all-devices"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-card p-4 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Cpu className="h-6 w-6" />
          </span>
          All Devices
        </Link>
        <Link
          to="/rooms"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-card p-4 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <DoorOpen className="h-6 w-6" />
          </span>
          Room
        </Link>
        <Link
          to="/select-device"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-card p-4 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Info className="h-6 w-6" />
          </span>
          Device Detail
        </Link>
        <Link
          to="/add-device"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-card p-4 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Plus className="h-6 w-6" />
          </span>
          Add Device
        </Link>
        <Link
          to="/add-room"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-card p-4 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <FolderPlus className="h-6 w-6" />
          </span>
          Add Room
        </Link>
      </div>
    </div>
  );
}
