import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrendingUp, TriangleAlert, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnergyAreaChart, EnergyBarChart } from "@/components/home/EnergyChart";
import { toast } from "sonner";
import { useHome } from "@/lib/home/store";

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
  const { state, dispatch, totalWatts } = useHome();
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
        <h1 className="text-2xl font-extrabold">Energy Intelligence</h1>
        <p className="text-sm text-muted-foreground">
          Energy is the foundation of the ElectraWireless ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Live load</p>
          <p className="font-display text-2xl font-extrabold">
            {(totalWatts / 1000).toFixed(2)} kW
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="font-display text-2xl font-extrabold">12.4 kWh</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">This week</p>
          <p className="font-display text-2xl font-extrabold">63 kWh</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Est. cost</p>
          <p className="font-display text-2xl font-extrabold">$18.90</p>
        </Card>
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
