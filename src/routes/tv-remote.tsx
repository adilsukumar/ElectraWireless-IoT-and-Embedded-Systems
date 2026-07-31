import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Power, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, VolumeX, Search, Wifi, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useHome } from "@/lib/home/store";
import { autoDiscoverPanasonicTV, sendPanasonicCommand, PANASONIC_KEYS } from "@/lib/panasonic";

export const Route = createFileRoute("/tv-remote")({
  component: TvRemotePage,
});

function TvRemotePage() {
  const [tvOn, setTvOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [tvIp, setTvIp] = useState<string | null>(localStorage.getItem("panasonic_ip"));
  const { state } = useHome();

  const handleAction = async (msg: string, keyCommand?: string) => {
    if (state.appMode === "demo" || !tvIp || !keyCommand) {
      toast.success(msg);
      return;
    }
    
    // Live mode execution
    const success = await sendPanasonicCommand(tvIp, keyCommand);
    if (!success) {
      toast.error(`Failed to send command. Is the TV on?`);
    }
  };

  const startAutoDiscovery = async () => {
    setIsScanning(true);
    toast("Scanning local network for Panasonic TV...");
    
    const foundIp = await autoDiscoverPanasonicTV();
    
    if (foundIp) {
      setTvIp(foundIp);
      localStorage.setItem("panasonic_ip", foundIp);
      toast.success(`Connected to TV at ${foundIp}`);
    } else {
      toast.error("TV not found on network. Ensure 'Network Remote' is ON in TV settings.", {
        duration: 8000,
        icon: <AlertTriangle className="text-destructive h-5 w-5" />
      });
    }
    
    setIsScanning(false);
  };

  return (
    <div className="bg-background min-h-screen text-foreground pb-24 -mx-4 px-4 sm:-mx-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/remotes" className="p-2 -ml-2 rounded-full bg-card hover:bg-secondary transition-colors border border-border/20">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Living Room TV</h1>
              <p className="text-sm font-medium text-muted-foreground">Panasonic Viera Smart TV</p>
            </div>
          </div>

          {state.appMode === "live" && (
            <button 
              onClick={startAutoDiscovery}
              disabled={isScanning}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                tvIp 
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20" 
                  : "bg-blue-500/10 text-blue-500 border-blue-500/30 hover:bg-blue-500/20",
                isScanning && "opacity-50 cursor-not-allowed animate-pulse"
              )}
            >
              {isScanning ? <Search className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              {isScanning ? "SCANNING..." : tvIp ? "CONNECTED" : "AUTO-CONNECT"}
            </button>
          )}
        </div>

        <div className="pt-4 flex flex-col items-center gap-8 rounded-[2rem] border border-border/20 glass-card p-6 mx-auto max-w-sm shadow-sm relative overflow-hidden">
        
        {/* Connection overlay if in live mode and not connected */}
        {state.appMode === "live" && !tvIp && !isScanning && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
            <Wifi className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-bold text-lg mb-2">TV Not Connected</h3>
            <p className="text-sm text-muted-foreground mb-6">Tap Auto-Connect to scan your local Wi-Fi for your Panasonic Smart TV.</p>
            <button onClick={startAutoDiscovery} className="px-6 py-3 bg-blue-500 text-white rounded-[1rem] font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 transition-all">
              Start Scan
            </button>
          </div>
        )}

        {/* Power & Source */}
        <div className="flex justify-between w-full max-w-[280px]">
          <button 
            onClick={() => { 
              setTvOn(!tvOn); 
              handleAction(`TV turned ${!tvOn ? 'ON' : 'OFF'}`, PANASONIC_KEYS.POWER); 
            }}
            className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md", tvOn ? "bg-red-500 text-foreground shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-secondary text-muted-foreground")}
          >
            <Power className="w-6 h-6" />
          </button>
          <button onClick={() => handleAction('Input Source', PANASONIC_KEYS.SOURCE)} className="px-5 h-14 rounded-full bg-secondary text-foreground/80 text-sm font-semibold active:scale-95 transition hover:bg-secondary/80">
            SOURCE
          </button>
        </div>

        {/* D-Pad */}
        <div className="relative w-56 h-56 bg-secondary/30 rounded-full flex items-center justify-center p-2 shadow-inner border border-border/20">
          <button onClick={() => handleAction('Up', PANASONIC_KEYS.UP)} className="absolute top-2 w-16 h-12 flex items-center justify-center rounded-[1.5rem] hover:bg-secondary/50 active:bg-secondary transition text-foreground/80"><ChevronUp className="w-8 h-8" /></button>
          <button onClick={() => handleAction('Down', PANASONIC_KEYS.DOWN)} className="absolute bottom-2 w-16 h-12 flex items-center justify-center rounded-[1.5rem] hover:bg-secondary/50 active:bg-secondary transition text-foreground/80"><ChevronDown className="w-8 h-8" /></button>
          <button onClick={() => handleAction('Left', PANASONIC_KEYS.LEFT)} className="absolute left-2 w-12 h-16 flex items-center justify-center rounded-[1.5rem] hover:bg-secondary/50 active:bg-secondary transition text-foreground/80"><ChevronLeft className="w-8 h-8" /></button>
          <button onClick={() => handleAction('Right', PANASONIC_KEYS.RIGHT)} className="absolute right-2 w-12 h-16 flex items-center justify-center rounded-[1.5rem] hover:bg-secondary/50 active:bg-secondary transition text-foreground/80"><ChevronRight className="w-8 h-8" /></button>
          <button onClick={() => handleAction('OK', PANASONIC_KEYS.OK)} className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-lg active:scale-95 transition shadow-sm border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">OK</button>
        </div>

        {/* Vol & CH */}
        <div className="flex gap-12 w-full justify-center">
          <div className="flex flex-col items-center bg-secondary/50 rounded-full p-2 shadow-sm border border-border/20">
            <button onClick={() => handleAction('Volume Up', PANASONIC_KEYS.VOL_UP)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-secondary/80 active:scale-95 transition text-foreground/80"><ChevronUp className="w-5 h-5" /></button>
            <span className="text-[10px] font-bold my-2 text-muted-foreground tracking-widest">VOL</span>
            <button onClick={() => handleAction('Volume Down', PANASONIC_KEYS.VOL_DOWN)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-secondary/80 active:scale-95 transition text-foreground/80"><ChevronDown className="w-5 h-5" /></button>
          </div>
          <button onClick={() => handleAction('Mute', PANASONIC_KEYS.MUTE)} className="w-12 h-12 mt-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition hover:bg-secondary/80 text-foreground/80"><VolumeX className="w-5 h-5" /></button>
          <div className="flex flex-col items-center bg-secondary/50 rounded-full p-2 shadow-sm border border-border/20">
            <button onClick={() => handleAction('Channel Up', PANASONIC_KEYS.CH_UP)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-secondary/80 active:scale-95 transition text-foreground/80"><ChevronUp className="w-5 h-5" /></button>
            <span className="text-[10px] font-bold my-2 text-muted-foreground tracking-widest">CH</span>
            <button onClick={() => handleAction('Channel Down', PANASONIC_KEYS.CH_DOWN)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-secondary/80 active:scale-95 transition text-foreground/80"><ChevronDown className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Keypad & Apps */}
        <div className="w-full max-w-[280px] grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} onClick={() => handleAction(`Channel ${n}`, PANASONIC_KEYS[`NUM_${n}` as keyof typeof PANASONIC_KEYS])} className="h-12 rounded-[1rem] bg-secondary/50 text-foreground/80 font-semibold active:scale-95 transition hover:bg-secondary">{n}</button>
          ))}
          <div />
          <button onClick={() => handleAction(`Channel 0`, PANASONIC_KEYS.NUM_0)} className="h-12 rounded-[1rem] bg-secondary/50 text-foreground/80 font-semibold active:scale-95 transition hover:bg-secondary">0</button>
          <div />
        </div>
        <div className="w-full max-w-[280px] grid grid-cols-2 gap-3 mt-2">
           <button onClick={() => handleAction('Apps', PANASONIC_KEYS.APPS)} className="h-12 rounded-[1rem] bg-purple-500/10 text-purple-500 font-bold active:scale-95 transition shadow-[0_0_10px_rgba(168,85,247,0.2)] border border-purple-500/20 hover:bg-purple-500/20">APPS</button>
           <button onClick={() => handleAction('Home', PANASONIC_KEYS.HOME)} className="h-12 rounded-[1rem] bg-blue-500/10 text-blue-500 font-bold active:scale-95 transition shadow-[0_0_10px_rgba(59,130,246,0.2)] border border-blue-500/20 hover:bg-blue-500/20">HOME</button>
        </div>
      </div>
    </div>
  </div>
  );
}
