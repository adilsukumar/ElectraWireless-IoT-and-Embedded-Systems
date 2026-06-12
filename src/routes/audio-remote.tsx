import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/audio-remote")({
  component: AudioRemotePage,
});

function AudioRemotePage() {
  const [audioState, setAudioState] = useState("Playing");
  const [audioVolume, setAudioVolume] = useState([65]);
  const [audioSource, setAudioSource] = useState("Wi-Fi");
  const [bass, setBass] = useState([5]);
  const [treble, setTreble] = useState([5]);

  const handleAction = (msg: string) => toast.success(msg);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link to="/remotes" className="p-2 -ml-2 rounded-full hover:bg-white dark:bg-[#111116]/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold font-display">Home Audio System</h1>
          <p className="text-sm text-muted-foreground">Sonos Surround • {audioState}</p>
        </div>
      </div>

      <div className="pt-4 flex flex-col items-center gap-8 bg-neutral-900/40 rounded-3xl p-6 shadow-lg border border-white/5 backdrop-blur-md mx-auto max-w-sm">
        
        <div className="flex bg-neutral-800/50 p-1 rounded-full w-full max-w-[280px]">
          {['Wi-Fi', 'Bluetooth', 'TV Audio'].map(s => (
            <button 
              key={s} 
              onClick={() => { setAudioSource(s); toast.success(`Source switched to ${s}`); }}
              className={cn("flex-1 py-2 text-xs font-semibold rounded-full transition-all", audioSource === s ? "bg-orange-500/20 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]" : "text-neutral-500 hover:text-neutral-300")}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-8 mt-2">
          <button onClick={() => handleAction('Skip Back')} className="w-12 h-12 flex items-center justify-center rounded-full text-neutral-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-[#111116]/5 active:scale-95 transition"><SkipBack className="w-6 h-6 fill-current" /></button>
          <button 
            onClick={() => setAudioState(audioState === 'Playing' ? 'Paused' : 'Playing')} 
            className="w-20 h-20 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center justify-center active:scale-95 transition"
          >
            {audioState === 'Playing' ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
          <button onClick={() => handleAction('Skip Forward')} className="w-12 h-12 flex items-center justify-center rounded-full text-neutral-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-[#111116]/5 active:scale-95 transition"><SkipForward className="w-6 h-6 fill-current" /></button>
        </div>

        {/* Volume Slider */}
        <div className="w-full space-y-4 max-w-[280px]">
          <div className="flex justify-between items-center text-xs font-semibold text-neutral-400">
            <Volume2 className="w-4 h-4" />
            <span>{audioVolume[0]}%</span>
          </div>
          <Slider value={audioVolume} min={0} max={100} step={1} onValueChange={setAudioVolume} className="[&>span:first-child]:bg-orange-500/20 [&_[role=slider]]:border-orange-500 [&_[role=slider]]:bg-orange-950 [&>span:first-child>span]:bg-orange-500" />
        </div>

        {/* EQ */}
        <div className="w-full flex gap-6 max-w-[280px] bg-neutral-800/40 p-4 rounded-3xl border border-white/5">
          <div className="flex-1 space-y-3">
            <div className="flex justify-between text-xs text-neutral-400"><span>Bass</span><span>{bass[0]}</span></div>
            <Slider value={bass} min={-10} max={10} step={1} onValueChange={setBass} className="[&>span:first-child]:bg-orange-500/20 [&_[role=slider]]:border-orange-500 [&_[role=slider]]:bg-orange-950 [&>span:first-child>span]:bg-orange-500" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between text-xs text-neutral-400"><span>Treble</span><span>{treble[0]}</span></div>
            <Slider value={treble} min={-10} max={10} step={1} onValueChange={setTreble} className="[&>span:first-child]:bg-orange-500/20 [&_[role=slider]]:border-orange-500 [&_[role=slider]]:bg-orange-950 [&>span:first-child>span]:bg-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
