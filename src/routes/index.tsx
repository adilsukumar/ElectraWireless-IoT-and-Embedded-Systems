import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Power, Moon, ShieldCheck, Zap, OctagonAlert,
  Cpu, DoorOpen, Mic, Loader2, Wifi, Activity
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useHome } from "@/lib/home/store";
import { handleLocalChat } from "@/lib/home/bot";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ELLY Home Dashboard · ElectraWireless" },
      { name: "description", content: "Control, monitor, and optimize your smart home with ELLY." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state, dispatch, totalWatts, runVoiceCommand, canEdit } = useHome();
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState("Tap the core to speak");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const speak = async (s: string, emotion?: string) => {
    setIsSpeaking(true);
    let pitch = 1.0, rate = 1.0;
    if (emotion === "happy") { pitch = 1.2; rate = 1.1; }
    else if (emotion === "sad") { pitch = 0.8; rate = 0.9; }
    else if (emotion === "urgent") { pitch = 1.1; rate = 1.3; }
    else if (emotion === "calm") { pitch = 0.9; rate = 0.85; }
    try {
      if (typeof window !== "undefined" && (window as any).cordova) {
        await TextToSpeech.stop();
        await TextToSpeech.speak({ text: s, lang: "en-US", rate, pitch, volume: 1.0, category: "ambient" });
      } else if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(s);
        const voices = window.speechSynthesis.getVoices();
        const female = voices.find(v => /female|woman|zira|samantha|karen|victoria/i.test(v.name)) || voices.find(v => v.lang.startsWith("en"));
        if (female) u.voice = female;
        u.pitch = pitch; u.rate = rate;
        u.onend = () => setIsSpeaking(false);
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
        return;
      }
    } catch { /* ignore */ }
    setTimeout(() => setIsSpeaking(false), s.length * 70);
  };

  const processVoice = async (text: string) => {
    if (!text.trim()) return;
    setIsListening(false);
    setIsThinking(true);
    setTranscript(`"${text}"`);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [{ role: "user", content: text }], 
          homeSummary: `${state.devices.filter(d => d.on).length} devices on. Role: ${state.role}.` 
        })
      });
      if (!response.ok) throw new Error("API failed");
      const data = await response.json();
      
      setIsThinking(false);
      const reply = data.reply || "Done.";
      setTranscript(reply);
      speak(reply);
      if (data.command) runVoiceCommand(data.command, { silent: true });
    } catch {
      // Fallback
      try {
        const res = await handleLocalChat(text, state, dispatch, runVoiceCommand) as any;
        setIsThinking(false);
        setTranscript(res.reply);
        speak(res.reply, res.emotion);
        if (res.navigateTo) navigate({ to: res.navigateTo });
      } catch {
        setIsThinking(false);
        setTranscript("Error processing request");
      }
    }
  };

  const toggleMic = async () => {
    if (isListening) {
      setIsListening(false);
      try {
        if ((window as any).cordova) SpeechRecognition.stop();
        else recognitionRef.current?.stop();
      } catch { }
      return;
    }
    try {
      if ((window as any).cordova) TextToSpeech.stop();
      else window.speechSynthesis?.cancel();
    } catch { }
    setIsSpeaking(false);
    setTranscript("Listening...");
    setIsListening(true);
    try {
      if (typeof window !== "undefined" && (window as any).cordova) {
        const hasPermission = await SpeechRecognition.checkPermissions();
        if (hasPermission.speechRecognition !== "granted") await SpeechRecognition.requestPermissions();
        const result = await SpeechRecognition.start({ language: "en-US", maxResults: 1, partialResults: false });
        setIsListening(false);
        if (result.matches && result.matches.length > 0) processVoice(result.matches[0]);
      } else {
        const w = window as any;
        const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
        if (!Ctor) { toast.error("Speech recognition not supported."); setIsListening(false); return; }
        const rec = new Ctor();
        rec.lang = "en-US"; rec.continuous = false; rec.interimResults = false;
        rec.onresult = (e: any) => processVoice(e.results[0][0].transcript);
        rec.onend = () => setIsListening(false);
        rec.onerror = () => setIsListening(false);
        recognitionRef.current = rec;
        rec.start();
      }
    } catch { setIsListening(false); }
  };

  const onDevices = state.devices.filter(d => d.on).length;
  const totalDevices = state.devices.length;

  return (
    <div className="flex flex-col min-h-full gap-5 pb-4 relative">
      {/* Ambient Purple Glow Orbs */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px]" />
        <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-violet-500/15 blur-[80px]" />
        <div className="absolute bottom-20 left-1/4 w-48 h-48 rounded-full bg-fuchsia-600/10 blur-[70px]" />
      </div>

      {/* Status Cards Row */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-purple-200 dark:border-purple-500/25 bg-white/40 dark:bg-purple-950/30 backdrop-blur-md p-4 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 dark:via-purple-400/60 to-transparent" />
          <p className="text-purple-700 dark:text-purple-400 font-mono text-[10px] tracking-[0.2em] uppercase mb-1">System Time</p>
          <p className="text-2xl font-light text-slate-900 dark:text-white tabular-nums leading-tight">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-[11px] text-purple-600/70 dark:text-purple-300/70 mt-0.5 leading-snug">
            {time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
          </p>
        </div>
        <div className="rounded-2xl border border-violet-200 dark:border-violet-500/25 bg-white/40 dark:bg-violet-950/30 backdrop-blur-md p-4 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 dark:via-violet-400/60 to-transparent" />
          <p className="text-violet-700 dark:text-violet-400 font-mono text-[10px] tracking-[0.2em] uppercase mb-1">Grid Load</p>
          <p className="text-2xl font-light text-slate-900 dark:text-white leading-tight">
            {(totalWatts / 1000).toFixed(2)}<span className="text-sm text-violet-600/60 dark:text-violet-300/60 ml-1">kW</span>
          </p>
          <p className="text-[11px] text-violet-600/70 dark:text-violet-300/70 mt-0.5">{onDevices} of {totalDevices} on</p>
        </div>
      </div>

      {/* Status Pill Row */}
      <div className="relative z-10 flex gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-white/40 dark:bg-emerald-950/20 px-3 py-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 truncate">Online</span>
        </div>
        <div className="flex-1 flex items-center gap-2 rounded-xl border border-purple-200 dark:border-purple-500/20 bg-white/40 dark:bg-purple-950/20 px-3 py-2 shadow-sm">
          <Wifi className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300 truncate">{onDevices} Active</span>
        </div>
        <div className="flex-1 flex items-center gap-2 rounded-xl border border-fuchsia-200 dark:border-fuchsia-500/20 bg-white/40 dark:bg-fuchsia-950/20 px-3 py-2 shadow-sm">
          <Activity className="h-3 w-3 text-fuchsia-600 dark:text-fuchsia-400 shrink-0" />
          <span className="text-[11px] font-medium text-fuchsia-700 dark:text-fuchsia-300 truncate">60+ Protocols</span>
        </div>
      </div>

      {/* ELLY AI Core Orb */}
      <div className="relative z-10 flex flex-col items-center py-2">
        <button
          onClick={toggleMic}
          className="relative flex items-center justify-center w-52 h-52 outline-none group"
          aria-label="Tap to speak to ELLY"
        >
          <div className={cn(
            "absolute inset-0 rounded-full transition-all duration-700",
            isListening ? "bg-purple-500/25 scale-125 animate-ping" :
            isSpeaking ? "bg-fuchsia-500/20 scale-150 animate-pulse" :
            "bg-purple-500/5 group-hover:bg-purple-500/10 group-hover:scale-110"
          )} />
          <div className={cn(
            "absolute inset-6 rounded-full border transition-all duration-500",
            isListening ? "border-purple-400/70 scale-110 animate-spin" :
            isSpeaking ? "border-fuchsia-400/50 scale-110 border-dashed animate-pulse" :
            "border-purple-500/20 group-hover:border-purple-400/40"
          )} style={{ animationDuration: isListening ? "3s" : "1s" }} />
          <div className={cn(
            "absolute inset-10 rounded-full border-2 transition-all duration-500",
            isListening ? "border-purple-400/50 dark:border-purple-300/50" :
            isSpeaking ? "border-fuchsia-400/40 dark:border-fuchsia-300/40 animate-ping" :
            "border-violet-300/50 dark:border-violet-500/30"
          )} />
          <div className={cn(
            "relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl",
            isListening
              ? "bg-gradient-to-br from-purple-400 to-violet-500 dark:from-purple-500 dark:to-violet-600 shadow-[0_0_60px_rgba(168,85,247,0.6)] dark:shadow-[0_0_60px_rgba(168,85,247,0.9)] scale-95"
              : isSpeaking
              ? "bg-gradient-to-br from-fuchsia-400 to-purple-500 dark:from-fuchsia-500 dark:to-purple-600 shadow-[0_0_70px_rgba(232,121,249,0.6)] dark:shadow-[0_0_70px_rgba(232,121,249,0.9)] scale-110 animate-pulse"
              : "bg-gradient-to-br from-white to-purple-50 dark:from-[#1e0d35] dark:to-[#0d0118] border border-purple-200 dark:border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.15)] dark:shadow-[0_0_40px_rgba(168,85,247,0.3)] group-hover:shadow-[0_0_60px_rgba(168,85,247,0.3)] dark:group-hover:shadow-[0_0_60px_rgba(168,85,247,0.5)]"
          )}>
            {isListening ? (
              <Mic className="h-10 w-10 text-white animate-pulse" />
            ) : isThinking ? (
              <Loader2 className="h-10 w-10 text-purple-500 dark:text-purple-300 animate-spin" />
            ) : (
              <>
                <span className="font-display font-black text-3xl tracking-tighter bg-gradient-to-b from-purple-700 to-purple-400 dark:from-white dark:to-purple-300 bg-clip-text text-transparent">
                  ELLY
                </span>
                <span className="text-[9px] font-mono text-purple-500/80 dark:text-purple-400/70 tracking-[0.15em] mt-0.5">AI CORE</span>
              </>
            )}
          </div>
        </button>
        <p className={cn(
          "mt-3 text-center text-sm font-light max-w-[260px] transition-all duration-300 leading-relaxed",
          isListening ? "text-purple-600 dark:text-purple-300 italic" :
          isSpeaking ? "text-fuchsia-600 dark:text-fuchsia-300" :
          "text-slate-500 dark:text-purple-200/50"
        )}>
          {transcript}
        </p>
      </div>

      {/* Subroutines */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-gradient-to-r from-purple-200 dark:from-purple-500/50 to-transparent" />
          <p className="text-purple-600 dark:text-purple-400 font-mono text-[10px] tracking-[0.25em] uppercase px-2">Subroutines</p>
          <div className="h-px flex-1 bg-gradient-to-l from-purple-200 dark:from-purple-500/50 to-transparent" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <EllyBtn icon={Power} label="All Off" sublabel="Power Down"
            onClick={() => { dispatch({ type: "ALL_OFF" }); toast.success("Powering down all devices."); }}
            disabled={!canEdit} color="purple" />
          <EllyBtn icon={Moon} label="Night Mode" sublabel="Sleep Routine"
            onClick={() => { dispatch({ type: "NIGHT_MODE" }); toast.success("Night mode activated."); }}
            disabled={!canEdit} color="violet" />
          <EllyBtn icon={ShieldCheck} label="Away Mode" sublabel="Security On"
            onClick={() => { dispatch({ type: "AWAY_MODE" }); toast.success("Away mode armed."); }}
            disabled={!canEdit} color="emerald" />
          <EllyBtn icon={Zap} label="Party Mode" sublabel="Ambience"
            onClick={() => { toast.success("Party mode initiated! 🎉"); }}
            disabled={!canEdit} color="fuchsia" />
        </div>
        <div className="flex flex-col gap-3 mt-3">
          <Link to="/devices">
            <EllyBtn icon={Cpu} label="Device Matrix" sublabel={`${totalDevices} devices registered`}
              onClick={() => {}} disabled={false} color="blue" wide />
          </Link>
          <Link to="/map">
            <EllyBtn icon={DoorOpen} label="Spatial Layout" sublabel="Floor plan view"
              onClick={() => {}} disabled={false} color="orange" wide />
          </Link>
          <EmergencyAction
            disabled={!canEdit}
            onConfirm={() => { dispatch({ type: "EMERGENCY" }); toast.error("EMERGENCY LOCKDOWN INITIATED"); }}
          />
        </div>
      </div>

      {/* Protocol Badge Strip */}
      <div className="relative z-10 rounded-2xl border border-purple-200 dark:border-purple-500/20 bg-white/40 dark:bg-purple-950/20 backdrop-blur-md p-4 shadow-sm">
        <p className="text-purple-600 dark:text-purple-400 font-mono text-[10px] tracking-[0.2em] uppercase mb-3">Universal Bridge · 60+ Protocols Active</p>
        <div className="flex flex-wrap gap-1.5">
          {["Tuya", "Shelly", "Hue", "ESPHome", "Z-Wave", "Zigbee", "Sonos", "Roku", "LG TV", "Samsung", "IKEA", "Nest", "Ring", "WLED", "Kodi", "+45 more"].map(p => (
            <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300/70 bg-purple-50 dark:bg-purple-500/5">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EllyBtn({ icon: Icon, label, sublabel, onClick, disabled, color, wide }: {
  icon: any; label: string; sublabel?: string; onClick: () => void;
  disabled?: boolean; color: string; wide?: boolean;
}) {
  const colorMap: Record<string, string> = {
    purple:  "border-purple-500/30 hover:border-purple-400/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] text-purple-400",
    violet:  "border-violet-500/30 hover:border-violet-400/60 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] text-violet-400",
    fuchsia: "border-fuchsia-500/30 hover:border-fuchsia-400/60 hover:shadow-[0_0_25px_rgba(232,121,249,0.3)] text-fuchsia-400",
    emerald: "border-emerald-500/30 hover:border-emerald-400/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] text-emerald-400",
    blue:    "border-blue-500/30 hover:border-blue-400/60 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] text-blue-400",
    orange:  "border-orange-500/30 hover:border-orange-400/60 hover:shadow-[0_0_25px_rgba(249,115,22,0.3)] text-orange-400",
    red:     "border-red-500/30 hover:border-red-400/60 hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] text-red-400 bg-red-950/20",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative group rounded-2xl border bg-[#0d0118]/60 backdrop-blur-md transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed",
        colorMap[color] || colorMap.purple,
        wide ? "w-full flex items-center gap-4 px-5 py-4" : "flex flex-col items-center justify-center gap-2 p-5 h-28"
      )}
    >
      <div className={cn(
        "flex items-center justify-center rounded-xl transition-transform group-hover:scale-110 group-active:scale-95",
        wide ? "w-10 h-10 shrink-0" : "w-11 h-11"
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <div className={cn("text-left", !wide && "text-center")}>
        <p className="font-bold text-xs tracking-wide text-white/90 uppercase">{label}</p>
        {sublabel && <p className="text-[10px] text-white/40 mt-0.5">{sublabel}</p>}
      </div>
    </button>
  );
}

function EmergencyAction({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div>
          <EllyBtn icon={OctagonAlert} label="Emergency Lockdown" sublabel="Override all systems" disabled={disabled} color="red" wide />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#0d0118] border border-red-500/40 text-white max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-400">
            <OctagonAlert className="h-5 w-5" /> OVERRIDE PROTOCOL
          </AlertDialogTitle>
          <AlertDialogDescription className="text-purple-200/60">
            Execute immediate shutdown of all non-critical power systems? This will isolate the grid and trigger all emergency routines.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl">Abort</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] rounded-xl"
            onClick={onConfirm}
          >
            Execute Lockdown
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
