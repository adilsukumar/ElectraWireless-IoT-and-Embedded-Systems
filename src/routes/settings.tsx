import { createFileRoute } from "@tanstack/react-router";
import {
  Crown,
  Users,
  UserRound,
  Server,
  Cpu,
  Wifi,
  Bluetooth,
  Cloud,
  ArrowDown,
  Thermometer,
  Activity,
  PowerOff,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useHome } from "@/lib/home/store";
import { MembersManager } from "@/components/home/MembersManager";
import type { Role, FallbackStatus } from "@/lib/home/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings, ELLY Home Automation" },
      {
        name: "description",
        content: "Roles & permissions, integration gateway, fallback routing and safety.",
      },
    ],
  }),
  component: SettingsPage,
});

const roles: { id: Role; label: string; icon: typeof Crown; perms: string[] }[] = [
  {
    id: "owner",
    label: "Owner",
    icon: Crown,
    perms: ["Full control", "Add / remove devices", "Create automations"],
  },
  {
    id: "family",
    label: "Family Member",
    icon: Users,
    perms: ["Control devices", "Limited automation editing"],
  },
  {
    id: "guest",
    label: "Guest",
    icon: UserRound,
    perms: ["Restricted device control", "No automation editing"],
  },
];

const statusStyles: Record<FallbackStatus, string> = {
  active: "bg-success/15 text-success border-success/40",
  standby: "bg-secondary text-secondary-foreground border-border",
  down: "bg-destructive/15 text-destructive border-destructive/40",
};

const fallbackIcon: Record<string, typeof Wifi> = { lan: Wifi, ble: Bluetooth, cloud: Cloud };

function SettingsPage() {
  const { state, dispatch } = useHome();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Trust over convenience, security, access and resilience.
        </p>
      </div>

      {/* Roles */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Users & Roles</h2>
        <div className="grid grid-cols-2 gap-3">
          {roles.map((r) => {
            const activeRole = state.role === r.id;
            return (
              <Card
                key={r.id}
                className={cn(
                  "p-4 transition-colors",
                  activeRole && "border-accent ring-1 ring-accent",
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <r.icon className="h-5 w-5 text-accent" />
                  <p className="font-semibold">{r.label}</p>
                  {activeRole && <Badge className="ml-auto">Active</Badge>}
                </div>
                <ul className="mb-3 space-y-1 text-sm text-muted-foreground">
                  {r.perms.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant={activeRole ? "secondary" : "outline"}
                  className="w-full"
                  disabled={activeRole}
                  onClick={() => {
                    dispatch({ type: "SET_ROLE", role: r.id });
                    toast.success(`Now acting as ${r.label}`);
                  }}
                >
                  {activeRole ? "Current role" : `Switch to ${r.label}`}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      <MembersManager />

      {/* Gateway architecture */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Integration Gateway</h2>
        <Card className="p-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <Tier icon={Cpu} title="Smart Appliances" sub="Wi-Fi · BLE · Zigbee · Matter" />
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
            <Tier
              icon={Server}
              title="Local Integration Gateway"
              sub="Home Assistant · MQTT Broker · Node-RED"
              accent
            />
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
            <Tier
              icon={Activity}
              title="ELLY AI Engine"
              sub="Standardized JSON over HTTP / WebSockets"
            />
          </div>
        </Card>
      </section>

      {/* Fallback routing */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Fallback Routing</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                dispatch({ type: "FAILOVER", key: "ble" });
                toast("Simulating Wi-Fi outage → BLE");
              }}
            >
              Simulate Wi-Fi failure
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                dispatch({ type: "RESTORE_NETWORK" });
                toast.success("Network restored");
              }}
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {state.fallback.map((f) => {
            const Icon = fallbackIcon[f.key];
            return (
              <Card key={f.key} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold leading-tight">{f.path}</p>
                      <Badge variant="secondary" className="shrink-0">
                        {f.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{f.scenario}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                      statusStyles[f.status],
                    )}
                  >
                    {f.status}
                  </span>
                </div>
                {f.status !== "active" && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        dispatch({ type: "FAILOVER", key: f.key });
                        toast(`Routing via ${f.path}`);
                      }}
                    >
                      Route here
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Safety */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Safety & Risk Management</h2>
        <div className="grid grid-cols-2 gap-3">
          <SafetyTile icon={Thermometer} label="Overheating" value="Normal" ok />
          <SafetyTile icon={Activity} label="Abnormal usage" value="None detected" ok />
          <SafetyTile icon={Server} label="Overload guard" value="Armed" ok />
        </div>
        <Card className="flex flex-col items-start gap-3 border-destructive/40 bg-destructive/5 p-5 sm:flex-row sm:items-center">
          <PowerOff className="h-6 w-6 text-destructive" />
          <p className="flex-1 text-sm">
            Emergency power cut overrides all automation and immediately de-energizes non-critical
            circuits.
          </p>
          <Button
            variant="destructive"
            disabled={state.role === "guest"}
            onClick={() => {
              dispatch({ type: "EMERGENCY" });
              toast.error("Emergency power cut executed");
            }}
          >
            Emergency Power Cut
          </Button>
        </Card>
      </section>
    </div>
  );
}

function Tier({
  icon: Icon,
  title,
  sub,
  accent,
}: {
  icon: typeof Cpu;
  title: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full max-w-md items-center gap-3 rounded-2xl border p-4",
        accent ? "border-accent bg-accent/10" : "border-border bg-card",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl",
          accent ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-left">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function SafetyTile({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: typeof Thermometer;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <p className={cn("mt-1 font-bold", ok ? "text-success" : "text-destructive")}>{value}</p>
    </Card>
  );
}
