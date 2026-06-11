import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  PlugZap,
  Power,
  Moon,
  ShieldCheck,
  Leaf,
  OctagonAlert,
  Activity,
  Cpu,
  Zap,
  TriangleAlert,
  ChevronRight,
  Video,
  Camera,
  DoorOpen,
  ClipboardList,
  Tv,
  Sun,
  Home,
  User
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useHome } from "@/lib/home/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ELLY Home Dashboard, ElectraWireless" },
      {
        name: "description",
        content: "Control, monitor, and optimize your smart home with ELLY by ElectraWireless.",
      },
      { property: "og:title", content: "ELLY Home Dashboard, ElectraWireless" },
      {
        property: "og:description",
        content: "The intelligent environmental layer of ElectraWireless.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state, dispatch, totalWatts, activeCount, alerts, canEdit } = useHome();

  const roomStats = state.rooms.map((room) => {
    const devices = state.devices.filter((d) => d.roomId === room.id);
    const active = devices.filter((d) => d.on).length;
    const watts = devices.filter((d) => d.on).reduce((s, d) => s + d.watts, 0);
    return { room, count: devices.length, active, watts };
  });

  // Analyse how the home feels today based on alerts, activity and consumption.
  const activeRatio = state.devices.length ? activeCount / state.devices.length : 0;
  const mood = (() => {
    if (alerts.length >= 2 || (alerts.length >= 1 && activeRatio > 0.6)) {
      return {
        key: "chaotic",
        title: "Busy day",
        emoji: "🌪️",
        message: "Your home feels chaotic today, a few things need your attention.",
        className: "text-destructive",
      };
    }
    if (alerts.length === 1 || activeRatio > 0.5 || totalWatts > 3000) {
      return {
        key: "calm",
        title: "Good day",
        emoji: "",
        message: "Your home is calm and under control.",
        className: "text-muted-foreground",
      };
    }
    return {
      key: "peace",
      title: "Peaceful day",
      emoji: "🌿",
      message: "Your home is at peace, quiet, efficient and all clear.",
      className: "text-primary",
    };
  })();

  return (
    <div className="space-y-6">


      {/* Quick actions */}
      <div>
        <div className="grid grid-cols-3 gap-3">
          <QuickAction
            icon={Power}
            label="All Off"
            onClick={() => {
              dispatch({ type: "ALL_OFF" });
              toast.success("All non-critical devices off");
            }}
            disabled={!canEdit}
          />
          <QuickAction
            icon={Sun}
            label="Morning"
            onClick={() => {
              toast.success("Morning Routine started");
            }}
            disabled={!canEdit}
          />
          <QuickAction
            icon={Home}
            label="Home"
            onClick={() => {
              toast.success("Welcome Home");
            }}
            disabled={!canEdit}
          />
          <QuickAction
            icon={User}
            label="Guest"
            onClick={() => {
              toast.success("Guest Mode activated");
            }}
            disabled={!canEdit}
          />
          <QuickAction
            icon={Moon}
            label="Night"
            onClick={() => {
              dispatch({ type: "NIGHT_MODE" });
              toast.success("Night Mode on");
            }}
            disabled={!canEdit}
          />
          <QuickAction
            icon={ShieldCheck}
            label="Away"
            onClick={() => {
              dispatch({ type: "AWAY_MODE" });
              toast.success("Away Mode armed");
            }}
            disabled={!canEdit}
          />
          <QuickAction
            icon={Leaf}
            label="Eco"
            onClick={() => {
              dispatch({ type: "ENERGY_SAVER" });
              toast.success("Energy Saver applied");
            }}
            disabled={!canEdit}
          />
          <Link
            to="/devices"
            className="flex flex-col items-center justify-center gap-3 py-5 px-2 rounded-[1.5rem] bg-[#111116] border border-white/5 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 shadow-lg group"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-transform group-hover:scale-105">
              <Cpu className="h-6 w-6" />
            </span>
            <span className="font-semibold text-white text-[13px]">Devices</span>
          </Link>
          <Link
            to="/activity"
            className="flex flex-col items-center justify-center gap-3 py-5 px-2 rounded-[1.5rem] bg-[#111116] border border-white/5 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 shadow-lg group"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)] transition-transform group-hover:scale-105">
              <ClipboardList className="h-6 w-6" />
            </span>
            <span className="font-semibold text-white text-[13px]">Activity</span>
          </Link>
          <Link
            to="/remotes"
            className="flex flex-col items-center justify-center gap-3 py-5 px-2 rounded-[1.5rem] bg-[#111116] border border-white/5 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 shadow-lg group"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-transform group-hover:scale-105">
              <Tv className="h-6 w-6" />
            </span>
            <span className="font-semibold text-white text-[13px]">Remotes</span>
          </Link>
          <EmergencyAction
            disabled={!canEdit}
            onConfirm={() => {
              dispatch({ type: "EMERGENCY" });
              toast.error("Emergency shutdown executed");
            }}
          />
        </div>
      </div>

    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  disabled,
  colorClass = "bg-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.4)]"
}: {
  icon: any;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  colorClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center justify-center gap-3 py-5 px-2 rounded-[1.5rem] bg-[#111116] border border-white/5 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg group"
    >
      <span className={cn("flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform group-hover:scale-105", colorClass)}>
        <Icon className="h-6 w-6" />
      </span>
      <span className="font-semibold text-white text-[13px]">{label}</span>
    </button>
  );
}

function EmergencyAction({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          disabled={disabled}
          className="flex flex-col items-center justify-center gap-3 py-5 px-2 rounded-[1.5rem] bg-[#111116] border border-red-500/10 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg group col-span-2"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-transform group-hover:scale-105">
            <OctagonAlert className="h-6 w-6" />
          </span>
          <span className="font-semibold text-red-500 text-[13px]">Emergency</span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <PlugZap className="h-5 w-5 text-destructive" /> Emergency Shutdown?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This immediately cuts power to all non-critical devices (the refrigerator stays on).
            Safety overrides automation. Continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Shut down now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
