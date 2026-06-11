import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Power, BatteryMedium, Disc } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/console-remote")({
  component: ConsoleRemotePage,
});

function ConsoleRemotePage() {
  const [consoleState, setConsoleState] = useState("Standby");
  const handleAction = (msg: string) => toast.success(msg);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link to="/remotes" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold font-display">Game Console</h1>
          <p className="text-sm text-muted-foreground">PlayStation 5 • {consoleState}</p>
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-8 bg-neutral-900/40 rounded-3xl p-6 shadow-lg border border-white/5 backdrop-blur-md mx-auto max-w-sm">
        
        {/* Power States */}
        <div className="flex gap-3">
          <button 
            onClick={() => { setConsoleState('Active'); toast.success('Waking Console...'); }}
            className={cn("flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 border border-white/5", consoleState === 'Active' ? "bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]" : "bg-neutral-800/50 text-neutral-400")}
          >
            <Power className="w-6 h-6" />
            <span className="text-xs font-semibold">Wake</span>
          </button>
          <button 
            onClick={() => { setConsoleState('Standby'); toast.success('Console set to Rest Mode'); }}
            className={cn("flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 border border-white/5", consoleState === 'Standby' ? "bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]" : "bg-neutral-800/50 text-neutral-400")}
          >
            <Power className="w-6 h-6 rotate-90" />
            <span className="text-xs font-semibold">Rest</span>
          </button>
          <button 
            onClick={() => { setConsoleState('Off'); toast.success('Console Powered Off'); }}
            className={cn("flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 border border-white/5", consoleState === 'Off' ? "bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "bg-neutral-800/50 text-neutral-400")}
          >
            <Power className="w-6 h-6" />
            <span className="text-xs font-semibold">Off</span>
          </button>
        </div>

        {/* Status Info */}
        <div className="flex justify-between items-center bg-neutral-800/40 p-4 rounded-2xl border border-white/5">
           <div className="flex items-center gap-3">
             <BatteryMedium className="w-6 h-6 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
             <div>
               <p className="text-sm font-semibold text-neutral-200">Controller 1</p>
               <p className="text-xs text-neutral-500">65% • Charging</p>
             </div>
           </div>
           <button onClick={() => handleAction('Disc Ejected')} className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 active:scale-95 transition text-neutral-300">
             <Disc className="w-5 h-5" />
           </button>
        </div>

        {/* Quick Launch Games */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-neutral-300">Recent Games</p>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => handleAction('Launching Game 1')} className="aspect-square rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center hover:scale-[1.02] active:scale-95 transition shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition" />
              <span className="relative z-10 font-bold text-white drop-shadow-md text-sm">RPG</span>
            </button>
            <button onClick={() => handleAction('Launching Game 2')} className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center hover:scale-[1.02] active:scale-95 transition shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=200')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition" />
              <span className="relative z-10 font-bold text-white drop-shadow-md text-sm">RACING</span>
            </button>
            <button onClick={() => handleAction('Launching App')} className="aspect-square rounded-2xl bg-neutral-800/80 border border-white/5 flex items-center justify-center hover:scale-[1.02] active:scale-95 transition shadow-lg text-neutral-400 hover:text-white">
              <span className="font-bold text-sm">MEDIA</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
