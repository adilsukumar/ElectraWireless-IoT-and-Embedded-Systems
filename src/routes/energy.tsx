import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrendingUp, TriangleAlert, Check, Activity, Cpu, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnergyAreaChart, EnergyBarChart } from "@/components/home/EnergyChart";
import { toast } from "sonner";
import { useHome } from "@/lib/home/store";
import { cn } from "@/lib/utils";

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

export const Route = createFileRoute("/energy")({
  head: () => ({
    meta: [
      { title: "Energy Intelligence, ElectraWireless" },
      {
        name: "description",
        content: "Track, rank and optimize device-level and whole-home energy use.",
      },
    ],
  }),
  component: EnergyPage,
});

const ranges = {
  daily: Array.from({ length: 24 }, (_, i) => ({
    label: `${i}`,
    value: Math.round(400 + Math.sin(i / 3) * 350 + Math.random() * 200),
  })),
  weekly: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
    label: d,
    value: Math.round(8 + Math.random() * 6),
  })),
  monthly: Array.from({ length: 4 }, (_, i) => ({
    label: `W${i + 1}`,
    value: Math.round(50 + Math.random() * 30),
  })),
};

function EnergyPage() {
  const { state, dispatch, totalWatts, activeCount, alerts } = useHome();
  const [range, setRange] = useState<keyof typeof ranges>("daily");
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const ranking = [...state.devices]
    .filter((d) => d.on)
    .sort((a, b) => b.watts - a.watts)
    .slice(0, 8)
    .map((d) => ({ label: d.name, value: d.watts }));

  const findDevice = (match: string) =>
    state.devices.find((d) => d.name.toLowerCase().includes(match));

  const optimizations = [
    {
      id: "workstation",
      text: "Shift Workstation Plug load away from the 2 to 4 PM peak",
      apply: () => {
        const d = findDevice("workstation");
        if (d) dispatch({ type: "UPDATE_DEVICE", id: d.id, patch: { on: false } });
      },
    },
    {
      id: "living-ac",
      text: "Raise Living AC setpoint by 1°C to save ~110 W",
      apply: () => {
        const d = findDevice("living ac");
        if (d)
          dispatch({
            type: "UPDATE_DEVICE",
            id: d.id,
            patch: { temperature: (d.temperature ?? 24) + 1 },
          });
      },
    },
    {
      id: "coffee",
      text: "Schedule Coffee Maker outside peak tariff hours",
      apply: () => {
        const d = findDevice("coffee");
        if (d) dispatch({ type: "UPDATE_DEVICE", id: d.id, patch: { on: false } });
      },
    },
  ];

  const applyOptimization = (o: (typeof optimizations)[number]) => {
    o.apply();
    setAppliedIds((ids) => [...ids, o.id]);
    toast.success("Optimization applied");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Energy</h1>
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

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Consumption</h2>
          <Tabs value={range} onValueChange={(v) => setRange(v as keyof typeof ranges)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <EnergyAreaChart data={ranges[range]} height={240} />
      </Card>

      <Card className="border-warning/50 bg-warning/10 p-4">
        <div className="flex items-center gap-3">
          <TriangleAlert className="h-5 w-5 text-warning" />
          <p className="text-sm">
            <span className="font-semibold">Abnormal spike detected</span> around 2–4 PM, 38% above
            your daily average.
          </p>
        </div>
      </Card>

      <div className="grid gap-4">
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-bold">
            <TrendingUp className="h-4 w-4" /> Top consumers
          </h2>
          <EnergyBarChart data={ranking} />
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-bold">Suggested optimizations</h2>
          {optimizations.filter((o) => !appliedIds.includes(o.id)).length === 0 && (
            <p className="text-sm text-muted-foreground">All optimizations applied. Nice work.</p>
          )}
          {optimizations
            .filter((o) => !appliedIds.includes(o.id))
            .map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm"
              >
                <span>{o.text}</span>
                <Button size="sm" variant="outline" onClick={() => applyOptimization(o)}>
                  <Check className="mr-1 h-3.5 w-3.5" /> Apply
                </Button>
              </div>
            ))}
        </Card>
      </div>
    </div>
  );
}
