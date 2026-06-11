import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Thermometer, Activity, Server } from "lucide-react";

export const Route = createFileRoute("/settings-safety")({
  component: SettingsSafetyPage,
});

function SettingsSafetyPage() {
  return (
    <div className="bg-black min-h-screen text-white pb-24 -mx-4 px-4 sm:-mx-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <Link to="/settings" className="p-2 bg-[#111116] rounded-full hover:bg-white/10 transition-colors border border-white/5">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight">Safety & Risk</h1>
        </div>

        <div className="grid gap-3 mt-5">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#111116] border border-white/5 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c1c24] border border-white/5 text-neutral-300">
                <Thermometer className="h-5 w-5 text-neutral-400" />
              </div>
              <span className="font-bold text-sm">Overheating</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="font-bold text-green-500 text-xs uppercase tracking-wide">Normal</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#111116] border border-white/5 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c1c24] border border-white/5 text-neutral-300">
                <Activity className="h-5 w-5 text-neutral-400" />
              </div>
              <span className="font-bold text-sm">Abnormal usage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="font-bold text-green-500 text-xs uppercase tracking-wide">None</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#111116] border border-white/5 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c1c24] border border-white/5 text-neutral-300">
                <Server className="h-5 w-5 text-neutral-400" />
              </div>
              <span className="font-bold text-sm">Overload guard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="font-bold text-green-500 text-xs uppercase tracking-wide">Armed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
