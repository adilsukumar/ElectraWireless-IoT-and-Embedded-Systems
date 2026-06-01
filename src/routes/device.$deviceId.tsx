import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Thermometer, Gauge, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { EnergyAreaChart } from "@/components/home/EnergyChart";
import { SignalIndicator } from "@/components/home/SignalIndicator";
import { deviceIcon, deviceTypeLabel } from "@/components/home/device-icons";
import { useHome } from "@/lib/home/store";
import type { Device } from "@/lib/home/types";

export const Route = createFileRoute("/device/$deviceId")({
  head: () => ({
    meta: [
      { title: "Device Control, ELLY Home" },
      { name: "description", content: "Advanced device control, energy and automation details." },
    ],
  }),
  component: DevicePage,
});

function makeSeries(base: number) {
  return Array.from({ length: 12 }, (_, i) => ({
    label: `${i * 2}h`,
    value: Math.max(0, Math.round(base * (0.5 + Math.sin(i / 2) * 0.3 + Math.random() * 0.2))),
  }));
}

function DevicePage() {
  const { deviceId } = Route.useParams();
  const { state, dispatch, canEdit } = useHome();
  const router = useRouter();
  const device = state.devices.find((d) => d.id === deviceId);

  if (!device) {
    return (
      <div className="mx-auto max-w-4xl">
        <p>Device not found.</p>
        <Button asChild variant="link">
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const room = state.rooms.find((r) => r.id === device.roomId);
  const Icon = deviceIcon[device.type];
  const linked = state.automations.filter((a) => a.enabled);
  const patch = (p: Partial<Device>) =>
    dispatch({ type: "UPDATE_DEVICE", id: device.id, patch: p });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.history.back()}
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">{device.name}</h1>
            <p className="text-sm text-muted-foreground">
              {deviceTypeLabel[device.type]} · {room?.name}
            </p>
          </div>
        </div>
        {device.type !== "sensor" && (
          <Switch
            checked={device.on}
            disabled={!device.online || !canEdit}
            onCheckedChange={() => dispatch({ type: "TOGGLE_DEVICE", id: device.id })}
          />
        )}
      </div>

      <div className="grid gap-4">
        <div className="space-y-6">
          {/* Controls */}
          <Card className="space-y-5 p-5">
            <h2 className="font-bold">Controls</h2>

            {device.type === "light" && (
              <>
                <ControlRow label={`Brightness, ${device.brightness ?? 0}%`}>
                  <Slider
                    value={[device.brightness ?? 0]}
                    max={100}
                    step={1}
                    disabled={!device.on || !canEdit}
                    onValueChange={([v]) => patch({ brightness: v })}
                  />
                </ControlRow>
                <ControlRow label={`Color temperature, ${device.colorTemp ?? 4000}K`}>
                  <Slider
                    value={[device.colorTemp ?? 4000]}
                    min={2700}
                    max={6500}
                    step={100}
                    disabled={!device.on || !canEdit}
                    onValueChange={([v]) => patch({ colorTemp: v })}
                  />
                </ControlRow>
              </>
            )}

            {(device.type === "ac" || device.type === "fan") && (
              <>
                {device.type === "ac" && (
                  <ControlRow label={`Temperature, ${device.temperature ?? 24}°C`}>
                    <div className="flex items-center gap-3">
                      <Snowflake className="h-4 w-4 text-accent" />
                      <Slider
                        value={[device.temperature ?? 24]}
                        min={16}
                        max={30}
                        step={1}
                        disabled={!device.on || !canEdit}
                        onValueChange={([v]) => patch({ temperature: v })}
                      />
                    </div>
                  </ControlRow>
                )}
                <ControlRow label="Fan speed">
                  <div className="flex gap-2">
                    {["Off", "Low", "Med", "High"].map((s, i) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={(device.fanSpeed ?? 0) === i ? "default" : "outline"}
                        disabled={!device.on || !canEdit}
                        onClick={() => patch({ fanSpeed: i })}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </ControlRow>
                {device.type === "ac" && (
                  <ControlRow label="Mode">
                    <div className="flex gap-2">
                      {["Cool", "Heat", "Auto", "Dry"].map((m) => (
                        <Button
                          key={m}
                          size="sm"
                          variant={device.mode === m ? "default" : "outline"}
                          disabled={!device.on || !canEdit}
                          onClick={() => patch({ mode: m })}
                        >
                          {m}
                        </Button>
                      ))}
                    </div>
                  </ControlRow>
                )}
              </>
            )}

            {device.type === "plug" && (
              <p className="text-sm text-muted-foreground">
                Live draw:{" "}
                <span className="font-semibold text-foreground">
                  {device.on ? device.watts : 0} W
                </span>
              </p>
            )}

            {device.type === "wpt" && (
              <>
                <ControlRow label={`Power output, ${device.output ?? 0}%`}>
                  <Slider
                    value={[device.output ?? 0]}
                    max={100}
                    step={5}
                    disabled={!device.on || !canEdit}
                    onValueChange={([v]) => patch({ output: v, watts: Math.round(v * 5) })}
                  />
                </ControlRow>
                <div className="grid grid-cols-2 gap-3">
                  <Stat
                    icon={Thermometer}
                    label="Thermal"
                    value={`${device.thermal ?? 0}°C`}
                    warn={(device.thermal ?? 0) > 55}
                  />
                  <Stat icon={Gauge} label="Connected" value="2 appliances" />
                </div>
                <p className="rounded-xl bg-secondary p-3 text-xs text-secondary-foreground">
                  ⚡ Safety active, output capped on overheat.
                </p>
              </>
            )}

            {device.type === "sensor" && (
              <p className="text-sm text-muted-foreground">
                Reporting normally · automation trigger.
              </p>
            )}
          </Card>

          {/* Energy graph */}
          <Card className="p-5">
            <h2 className="mb-2 font-bold">Energy, last 24h</h2>
            <EnergyAreaChart data={makeSeries(device.watts || 10)} />
          </Card>
        </div>

        {/* Side info */}
        <div className="space-y-4">
          <Card className="space-y-3 p-5 text-sm">
            <h2 className="font-bold">Details</h2>
            <InfoRow label="Device ID" value={device.id} />
            <InfoRow label="Room" value={room?.name ?? ", "} />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Connection</span>
              <span className="flex items-center gap-2">
                <SignalIndicator online={device.online} /> {device.online ? "Online" : "Offline"}
              </span>
            </div>
            <InfoRow label="Live draw" value={`${device.on ? device.watts : 0} W`} />
          </Card>

          <Card className="space-y-2 p-5 text-sm">
            <h2 className="font-bold">Linked Automations</h2>
            {linked.length === 0 ? (
              <p className="text-muted-foreground">None enabled.</p>
            ) : (
              linked.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center justify-between">
                  <span>{a.name}</span>
                  <Badge variant="secondary">{a.type}</Badge>
                </div>
              ))
            )}
          </Card>

          <Card className="space-y-2 p-5 text-sm">
            <h2 className="font-bold">Assigned Users</h2>
            <div className="flex flex-wrap gap-2">
              <Badge>Owner</Badge>
              <Badge variant="secondary">Family</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  warn,
}: {
  icon: typeof Thermometer;
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${warn ? "border-destructive/50 bg-destructive/10" : "border-border"}`}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className={`mt-1 font-bold ${warn ? "text-destructive" : ""}`}>{value}</p>
    </div>
  );
}
