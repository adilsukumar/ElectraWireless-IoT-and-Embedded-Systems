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
} from "lucide-react";
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

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4",
        accent ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border",
      )}
    >
      <span className={cn("techno-glow mb-6 inline-flex", accent ? "" : "")}>
        <Icon className={cn("h-5 w-5", accent ? "opacity-90" : "text-primary")} />
      </span>
      <p className="font-display text-2xl font-extrabold tracking-tight">{value}</p>
      <p className={cn("text-xs", accent ? "opacity-80" : "text-muted-foreground")}>{label}</p>
    </div>
  );
}

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
      <div>
        <h1 className="font-display text-3xl font-extrabold">
          {mood.title} {mood.emoji}
        </h1>
        <p className={mood.className}>{mood.message}</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Cpu, label: "Devices connected", value: String(state.devices.length) },
          { icon: Activity, label: "Active now", value: String(activeCount), accent: true },
          { icon: Zap, label: "Live consumption", value: `${(totalWatts / 1000).toFixed(2)} kW` },
          { icon: TriangleAlert, label: "Alerts", value: String(alerts.length) },
        ].map((s) => (
          <div key={s.label}>
            <StatCard icon={s.icon} label={s.label} value={s.value} accent={s.accent} />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Quick Actions
        </h2>
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
          <EmergencyAction
            disabled={!canEdit}
            onConfirm={() => {
              dispatch({ type: "EMERGENCY" });
              toast.error("Emergency shutdown executed");
            }}
          />
        </div>
      </div>

      {/* Rooms */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Rooms
        </h2>
        <div className="space-y-3">
          {roomStats.map(({ room, count, active, watts }) => (
            <div key={room.id}>
              <Link
                to="/room/$roomId"
                params={{ roomId: room.id }}
                className="block rounded-3xl bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-lg font-bold">{room.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {active} of {count} active · {watts} W
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${count ? (active / count) * 100 : 0}%` }}
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Camera mini */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Smart Camera
        </h2>
        <div className="overflow-hidden rounded-3xl bg-card">
          <div className="relative flex aspect-video items-center justify-center bg-primary/90 text-primary-foreground">
            {state.cameraEnabled && !state.cameraPrivacy ? (
              <>
                <Video className="h-10 w-10 opacity-80" />
                <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <Camera className="h-9 w-9 opacity-70" />
                <span className="text-xs opacity-80">Privacy Mode, camera off</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between p-3 text-sm">
            <span className="text-muted-foreground">
              {state.cameraMotionAlerts ? "Motion alerts on" : "Motion alerts off"}
            </span>
            <Button asChild variant="ghost" size="sm">
              <Link to="/camera">Open</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Activity log */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Activity Log
        </h2>
        <div className="max-h-56 space-y-2 overflow-y-auto rounded-3xl bg-card p-4 text-sm">
          {state.logs.slice(0, 10).map((l) => (
            <div key={l.id} className="flex gap-2">
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{l.time}</span>
              <span
                className={cn(
                  l.source === "voice" && "text-primary",
                  l.source === "system" && "text-muted-foreground",
                )}
              >
                {l.text}
              </span>
            </div>
          ))}
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
}: {
  icon: typeof Power;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card py-4 text-xs font-medium text-foreground transition-colors hover:bg-muted active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Icon className="h-5 w-5" />
      </span>

      {label}
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
          className="flex w-full flex-col items-center gap-2 rounded-3xl bg-destructive/10 py-4 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-destructive text-destructive-foreground">
            <OctagonAlert className="h-5 w-5" />
          </span>
          Emergency
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
