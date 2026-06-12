import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Wifi, Bluetooth, Cloud, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useHome } from "@/lib/home/store";
import { cn } from "@/lib/utils";
import type { FallbackStatus } from "@/lib/home/types";

export const Route = createFileRoute("/settings-network")({
  component: SettingsNetworkPage,
});

const statusStyles: Record<FallbackStatus, string> = {
  active: "bg-green-500/15 text-green-400 border-green-500/40",
  standby: "bg-white/10 text-neutral-300 border-white/5",
  down: "bg-red-500/15 text-red-400 border-red-500/40",
};

const fallbackIcon: Record<string, typeof Wifi> = { lan: Wifi, ble: Bluetooth, cloud: Cloud };

function SettingsNetworkPage() {
  const { state, dispatch } = useHome();

  return (
    <div className="bg-slate-50 dark:bg-black flex-1 text-white pb-6 -mx-4 px-4 sm:-mx-8 sm:px-8 flex flex-col">
      <div className="mx-auto max-w-4xl w-full space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/settings" className="p-2 bg-white dark:bg-[#111116] rounded-full hover:bg-white/10 transition-colors border border-white/5">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-extrabold tracking-tight">Network & Fallback</h1>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button className="flex-1 py-3 font-bold rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs" onClick={() => { dispatch({ type: "FAILOVER", key: "ble" }); toast("Simulating Wi-Fi outage → BLE"); }}>
            Simulate Outage
          </button>
          <button className="flex-1 py-3 font-bold flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all text-xs" onClick={() => { dispatch({ type: "RESTORE_NETWORK" }); toast.success("Network restored"); }}>
            <RotateCcw className="h-3.5 w-3.5" /> Restore Primary
          </button>
        </div>

        <div className="grid gap-3 mt-4">
          {state.fallback.map((f) => {
            const Icon = fallbackIcon[f.key] || Wifi;
            return (
              <div key={f.key} className="p-4 rounded-2xl bg-white dark:bg-[#111116] border border-white/5 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c1c24] border border-white/5 text-neutral-300">
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <p className="font-bold text-sm">{f.path}</p>
                      <span className="px-2 py-0.5 bg-white/10 rounded-full text-[9px] font-bold uppercase tracking-wider text-neutral-400">{f.label}</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed font-medium">{f.scenario}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3.5">
                  <span className={cn("px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border", statusStyles[f.status])}>
                    {f.status}
                  </span>
                  {f.status !== "active" && (
                    <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors" onClick={() => { dispatch({ type: "FAILOVER", key: f.key }); toast(`Routing via ${f.path}`); }}>
                      Route via this tier →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
