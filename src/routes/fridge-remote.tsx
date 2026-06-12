import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/fridge-remote")({
  component: FridgeRemotePage,
});

function FridgeRemotePage() {
  const [fridgeTemps, setFridgeTemps] = useState([3]);
  const [freezerTemps, setFreezerTemps] = useState([-18]);
  const [iceMaker, setIceMaker] = useState("Cubed");
  const [fridgeMode, setFridgeMode] = useState("Normal");

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link to="/remotes" className="p-2 -ml-2 rounded-full hover:bg-white dark:bg-[#111116]/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold font-display">Smart Fridge</h1>
          <p className="text-sm text-muted-foreground">Temperature, Ice Maker, Settings</p>
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-8 bg-neutral-900/40 rounded-3xl p-6 shadow-lg border border-white/5 backdrop-blur-md mx-auto max-w-sm">
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-sm font-semibold text-neutral-300">Fridge</p>
              <p className="text-xl font-bold text-teal-400">{fridgeTemps[0]}°C</p>
            </div>
            <Slider value={fridgeTemps} min={1} max={7} step={1} onValueChange={setFridgeTemps} className="[&>span:first-child]:bg-teal-500/20 [&_[role=slider]]:border-teal-500 [&_[role=slider]]:bg-teal-950 [&>span:first-child>span]:bg-teal-500" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-sm font-semibold text-neutral-300">Freezer</p>
              <p className="text-xl font-bold text-blue-400">{freezerTemps[0]}°C</p>
            </div>
            <Slider value={freezerTemps} min={-24} max={-14} step={1} onValueChange={setFreezerTemps} className="[&>span:first-child]:bg-blue-500/20 [&_[role=slider]]:border-blue-500 [&_[role=slider]]:bg-blue-950 [&>span:first-child>span]:bg-blue-500" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-neutral-300">Ice Maker</p>
          <div className="flex bg-neutral-800/50 p-1 rounded-2xl">
            {['Cubed', 'Crushed', 'Off'].map(m => (
              <button 
                key={m} 
                onClick={() => setIceMaker(m)}
                className={cn("flex-1 py-2 text-sm font-medium rounded-xl transition-all", iceMaker === m ? "bg-teal-500/20 text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.2)]" : "text-neutral-500 hover:text-neutral-300")}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-neutral-300">Mode</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setFridgeMode('Quick Cool'); toast.success('Quick Cool activated'); }} className={cn("py-3 rounded-xl border border-white/5 text-sm font-medium transition-all active:scale-95", fridgeMode === 'Quick Cool' ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-neutral-800/50 text-neutral-400")}>Quick Cool</button>
            <button onClick={() => { setFridgeMode('Energy Saver'); toast.success('Energy Saver activated'); }} className={cn("py-3 rounded-xl border border-white/5 text-sm font-medium transition-all active:scale-95", fridgeMode === 'Energy Saver' ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-neutral-800/50 text-neutral-400")}>Energy Saver</button>
          </div>
        </div>

      </div>
    </div>
  );
}
