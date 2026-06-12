import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Cpu, Server, Activity, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/settings-gateways")({
  component: SettingsGatewaysPage,
});

function SettingsGatewaysPage() {
  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen text-slate-900 dark:text-white pb-24 -mx-4 px-4 sm:-mx-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <Link to="/settings" className="p-2 bg-white dark:bg-[#111116] rounded-full hover:bg-white dark:bg-[#111116]/10 transition-colors border border-white/5">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight">Gateways</h1>
        </div>

        <div className="flex flex-col items-center gap-2 py-4 mt-2">
          <div className="flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-white dark:bg-[#111116] p-4 shadow-lg">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c1c24] text-neutral-300 border border-white/5"><Cpu className="h-5 w-5" /></div>
            <div className="text-left"><p className="font-bold text-sm">Smart Appliances</p><p className="text-xs font-medium text-neutral-400 mt-0.5">Wi-Fi · BLE · Zigbee · Matter</p></div>
          </div>
          
          <ArrowDown className="h-5 w-5 text-neutral-600 my-1" strokeWidth={2.5} />
          
          <div className="flex w-full items-center gap-4 rounded-2xl border border-[#a855f7]/30 bg-[#a855f7]/10 p-4 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7]/0 via-[#a855f7]/5 to-[#a855f7]/0 pointer-events-none" />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#a855f7] text-slate-900 dark:text-white shadow-[0_0_10px_rgba(168,85,247,0.5)] z-10"><Server className="h-5 w-5" /></div>
            <div className="text-left z-10"><p className="font-bold text-sm text-slate-900 dark:text-white">Local Integration Gateway</p><p className="text-xs font-medium text-[#a855f7] mt-0.5">Home Assistant · MQTT Broker</p></div>
          </div>
          
          <ArrowDown className="h-5 w-5 text-neutral-600 my-1" strokeWidth={2.5} />
          
          <div className="flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-white dark:bg-[#111116] p-4 shadow-lg">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c1c24] text-neutral-300 border border-white/5"><Activity className="h-5 w-5" /></div>
            <div className="text-left"><p className="font-bold text-sm">ELLY AI Engine</p><p className="text-xs font-medium text-neutral-400 mt-0.5">Local Edge Inference</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
