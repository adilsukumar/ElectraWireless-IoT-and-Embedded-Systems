import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Power, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, VolumeX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tv-remote")({
  component: TvRemotePage,
});

function TvRemotePage() {
  const [tvOn, setTvOn] = useState(false);
  const handleAction = (msg: string) => toast.success(msg);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link to="/remotes" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold font-display">Living Room TV</h1>
          <p className="text-sm text-muted-foreground">Samsung Smart TV</p>
        </div>
      </div>

      <div className="pt-4 flex flex-col items-center gap-8 bg-neutral-900/40 rounded-3xl p-6 shadow-lg border border-white/5 backdrop-blur-md mx-auto max-w-sm">
        {/* Power & Source */}
        <div className="flex justify-between w-full max-w-[280px]">
          <button 
            onClick={() => { setTvOn(!tvOn); toast.success(`TV turned ${!tvOn ? 'ON' : 'OFF'}`); }}
            className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md", tvOn ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-neutral-800 text-neutral-400")}
          >
            <Power className="w-6 h-6" />
          </button>
          <button onClick={() => handleAction('Input Source')} className="px-5 h-14 rounded-full bg-neutral-800 text-neutral-300 text-sm font-semibold active:scale-95 transition hover:bg-neutral-700">
            SOURCE
          </button>
        </div>

        {/* D-Pad */}
        <div className="relative w-56 h-56 bg-neutral-800/50 rounded-full flex items-center justify-center p-2 shadow-inner border border-white/5">
          <button onClick={() => handleAction('Up')} className="absolute top-2 w-16 h-12 flex items-center justify-center rounded-2xl hover:bg-white/10 active:bg-white/20 transition text-neutral-300"><ChevronUp className="w-8 h-8" /></button>
          <button onClick={() => handleAction('Down')} className="absolute bottom-2 w-16 h-12 flex items-center justify-center rounded-2xl hover:bg-white/10 active:bg-white/20 transition text-neutral-300"><ChevronDown className="w-8 h-8" /></button>
          <button onClick={() => handleAction('Left')} className="absolute left-2 w-12 h-16 flex items-center justify-center rounded-2xl hover:bg-white/10 active:bg-white/20 transition text-neutral-300"><ChevronLeft className="w-8 h-8" /></button>
          <button onClick={() => handleAction('Right')} className="absolute right-2 w-12 h-16 flex items-center justify-center rounded-2xl hover:bg-white/10 active:bg-white/20 transition text-neutral-300"><ChevronRight className="w-8 h-8" /></button>
          <button onClick={() => handleAction('OK')} className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg active:scale-95 transition shadow-sm border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">OK</button>
        </div>

        {/* Vol & CH */}
        <div className="flex gap-12 w-full justify-center">
          <div className="flex flex-col items-center bg-neutral-800/80 rounded-full p-2 shadow-sm border border-white/5">
            <button onClick={() => handleAction('Volume Up')} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition text-neutral-300"><ChevronUp className="w-5 h-5" /></button>
            <span className="text-[10px] font-bold my-2 text-neutral-500 tracking-widest">VOL</span>
            <button onClick={() => handleAction('Volume Down')} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition text-neutral-300"><ChevronDown className="w-5 h-5" /></button>
          </div>
          <button onClick={() => handleAction('Mute')} className="w-12 h-12 mt-10 rounded-full bg-neutral-800 flex items-center justify-center active:scale-95 transition hover:bg-neutral-700 text-neutral-400"><VolumeX className="w-5 h-5" /></button>
          <div className="flex flex-col items-center bg-neutral-800/80 rounded-full p-2 shadow-sm border border-white/5">
            <button onClick={() => handleAction('Channel Up')} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition text-neutral-300"><ChevronUp className="w-5 h-5" /></button>
            <span className="text-[10px] font-bold my-2 text-neutral-500 tracking-widest">CH</span>
            <button onClick={() => handleAction('Channel Down')} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition text-neutral-300"><ChevronDown className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Keypad & Apps */}
        <div className="w-full max-w-[280px] grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} onClick={() => handleAction(`Channel ${n}`)} className="h-12 rounded-xl bg-neutral-800/60 text-neutral-300 font-semibold active:scale-95 transition hover:bg-neutral-700">{n}</button>
          ))}
          <div />
          <button onClick={() => handleAction(`Channel 0`)} className="h-12 rounded-xl bg-neutral-800/60 text-neutral-300 font-semibold active:scale-95 transition hover:bg-neutral-700">0</button>
          <div />
        </div>
        <div className="w-full max-w-[280px] grid grid-cols-2 gap-3 mt-2">
           <button onClick={() => handleAction('Netflix Launched')} className="h-12 rounded-xl bg-[#E50914]/20 text-[#E50914] font-bold active:scale-95 transition shadow-[0_0_10px_rgba(229,9,20,0.2)]">NETFLIX</button>
           <button onClick={() => handleAction('YouTube Launched')} className="h-12 rounded-xl bg-[#FF0000]/20 text-[#FF0000] font-bold active:scale-95 transition shadow-[0_0_10px_rgba(255,0,0,0.2)]">YouTube</button>
        </div>
      </div>
    </div>
  );
}
