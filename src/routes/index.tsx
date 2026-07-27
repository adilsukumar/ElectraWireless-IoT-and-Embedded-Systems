import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Power, Moon, ShieldCheck, Leaf, OctagonAlert,
  Cpu, Zap, DoorOpen, ClipboardList, Tv, Sun, Home, User,
  Mic, Loader2
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
      { title: "ELLY Home Dashboard, ElectraWireless" },
      { name: "description", content: "Control, monitor, and optimize your smart home with ELLY." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state, dispatch, totalWatts, runVoiceCommand, canEdit } = useHome();
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState("Tap the core to speak");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const speak = async (s: string, emotion?: 'happy' | 'sad' | 'urgent' | 'calm' | 'normal') => {
    setIsSpeaking(true);
    
    let pitch = 1.0;
    let rate = 1.0;
    
    if (emotion === 'happy') { pitch = 1.2; rate = 1.1; }
    else if (emotion === 'sad') { pitch = 0.8; rate = 0.9; }
    else if (emotion === 'urgent') { pitch = 1.1; rate = 1.3; }
    else if (emotion === 'calm') { pitch = 0.9; rate = 0.85; }

    try {
      if (typeof window !== "undefined" && (window as any).cordova) {
        await TextToSpeech.stop();
        await TextToSpeech.speak({ text: s, lang: 'en-US', rate, pitch, volume: 1.0, category: 'ambient' });
      } else if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(s);
        u.pitch = pitch;
        u.rate = rate;
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
      const res = await handleLocalChat(text, state, dispatch, runVoiceCommand) as any;
      setIsThinking(false);
      setTranscript(res.reply);
      speak(res.reply, res.emotion);
      
      if (res.navigateTo) {
        navigate({ to: res.navigateTo });
      }
    } catch (e) {
      setIsThinking(false);
      setTranscript("Error processing request");
    }
  };

  const toggleMic = async () => {
    if (isListening) {
      setIsListening(false);
      try {
        if ((window as any).cordova) SpeechRecognition.stop();
        else recognitionRef.current?.stop();
      } catch {}
      return;
    }
    
    // Stop current speech
    try {
      if ((window as any).cordova) TextToSpeech.stop();
      else window.speechSynthesis?.cancel();
    } catch {}
    setIsSpeaking(false);

    setTranscript("Listening...");
    setIsListening(true);

    try {
      if (typeof window !== "undefined" && (window as any).cordova) {
        const hasPermission = await SpeechRecognition.checkPermissions();
        if (hasPermission.speechRecognition !== 'granted') await SpeechRecognition.requestPermissions();
        const result = await SpeechRecognition.start({ language: 'en-US', maxResults: 1, partialResults: false });
        setIsListening(false);
        if (result.matches && result.matches.length > 0) processVoice(result.matches[0]);
      } else {
        const w = window as any;
        const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
        if (!Ctor) {
          toast.error("Speech recognition not supported in this browser.");
          setIsListening(false);
          return;
        }
        const rec = new Ctor();
        rec.lang = "en-US";
        rec.continuous = false;
        rec.interimResults = false;
        rec.onresult = (e: any) => processVoice(e.results[0][0].transcript);
        rec.onend = () => setIsListening(false);
        rec.onerror = () => setIsListening(false);
        recognitionRef.current = rec;
        rec.start();
      }
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#020205] text-white overflow-hidden font-sans relative selection:bg-cyan-500/30">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid Layout Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 grid-rows-[auto_1fr_auto] md:grid-rows-[1fr] gap-4 p-4 z-10 h-full">

        {/* TOP / LEFT PANEL: Status & Climate (Desktop: col span 3) */}
        <div className="flex flex-col gap-4 md:col-span-3">
          <div className="glass-panel p-5 rounded-3xl border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.05)] bg-[#0a0a0f]/80 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="text-cyan-400 font-mono text-xs tracking-[0.2em] uppercase mb-1">System Time</div>
            <div className="text-4xl font-light tracking-tight">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-sm text-neutral-400 mt-1">{time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          </div>
          
          <div className="glass-panel flex-1 p-5 rounded-3xl border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.05)] bg-[#0a0a0f]/80 backdrop-blur-xl relative flex flex-col justify-between">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
             <div>
               <div className="text-purple-400 font-mono text-xs tracking-[0.2em] uppercase mb-4">Grid Load</div>
               <div className="text-5xl font-light tracking-tight">{(totalWatts / 1000).toFixed(1)} <span className="text-xl text-neutral-500">kW</span></div>
             </div>
             
             <div className="space-y-2 mt-4">
               <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl">
                 <span className="text-sm text-neutral-400">Active Nodes</span>
                 <span className="font-bold text-white">{state.devices.filter(d => d.on).length}</span>
               </div>
               <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl">
                 <span className="text-sm text-neutral-400">Network Status</span>
                 <span className="font-bold text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online</span>
               </div>
             </div>
          </div>
        </div>

        {/* CENTER PANEL: ELLY AI Core (Desktop: col span 6) */}
        <div className="flex flex-col items-center justify-center md:col-span-6 relative bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent rounded-[3rem] border border-white/5">
          
          {/* Jarvis Blob Visualizer */}
          <button 
            onClick={toggleMic}
            className="relative flex items-center justify-center w-64 h-64 outline-none tap-highlight-transparent group"
          >
            {/* Outer Aura */}
            <div className={cn(
              "absolute inset-0 rounded-full transition-all duration-700 ease-out",
              isListening ? "bg-cyan-500/20 scale-125 blur-xl animate-pulse" : 
              isSpeaking ? "bg-purple-500/30 scale-150 blur-2xl animate-[spin_3s_linear_infinite]" : 
              "bg-cyan-500/5 scale-100 blur-lg group-hover:bg-cyan-500/10 group-hover:scale-110"
            )}></div>
            
            {/* Inner Ring */}
            <div className={cn(
              "absolute inset-4 rounded-full border-[2px] transition-all duration-500",
              isListening ? "border-cyan-400/50 scale-110 animate-ping" : 
              isSpeaking ? "border-purple-400/60 scale-110 animate-pulse border-dashed" : 
              "border-cyan-500/20 group-hover:border-cyan-400/40"
            )}></div>

            {/* Core */}
            <div className={cn(
              "relative z-10 w-28 h-28 rounded-full flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] transition-all duration-500",
              isListening ? "bg-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.8)] scale-95" :
              isSpeaking ? "bg-gradient-to-br from-purple-500 to-cyan-500 shadow-[0_0_60px_rgba(168,85,247,0.8)] scale-110 animate-bounce" :
              "bg-neutral-900 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
            )}>
              {isListening ? (
                <Mic className="h-10 w-10 text-white animate-pulse" />
              ) : isThinking ? (
                <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
              ) : (
                <div className="text-center font-display font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">ELLY</div>
              )}
            </div>
          </button>

          {/* Transcript / Subtitle */}
          <div className="absolute bottom-10 left-8 right-8 text-center min-h-[3rem] flex items-center justify-center pointer-events-none">
            <p className={cn(
              "text-lg font-light transition-all duration-300 max-w-md",
              isListening ? "text-cyan-400 italic" : "text-neutral-300",
              isSpeaking && "text-purple-300 shadow-purple-500/50 drop-shadow-md"
            )}>
              {transcript}
            </p>
          </div>
        </div>

        {/* BOTTOM / RIGHT PANEL: Quick Actions (Desktop: col span 3) */}
        <div className="flex flex-col gap-3 md:col-span-3">
          <div className="text-cyan-400 font-mono text-xs tracking-[0.2em] uppercase px-2">Subroutines</div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <FuturisticBtn icon={Power} label="All Off" onClick={() => { dispatch({ type: "ALL_OFF" }); toast.success("Powering down."); }} disabled={!canEdit} color="cyan" />
            <FuturisticBtn icon={Moon} label="Night" onClick={() => { dispatch({ type: "NIGHT_MODE" }); toast.success("Night mode."); }} disabled={!canEdit} color="purple" />
            <FuturisticBtn icon={ShieldCheck} label="Away" onClick={() => { dispatch({ type: "AWAY_MODE" }); toast.success("Armed."); }} disabled={!canEdit} color="emerald" />
            <FuturisticBtn icon={Zap} label="Party" onClick={() => { toast.success("Party Mode initiated!"); }} disabled={!canEdit} color="pink" />
            
            <Link to="/devices" className="col-span-2">
               <FuturisticBtn icon={Cpu} label="Device Matrix" onClick={() => {}} disabled={!canEdit} color="blue" fullWidth />
            </Link>
            <Link to="/map" className="col-span-2">
               <FuturisticBtn icon={DoorOpen} label="Spatial Layout" onClick={() => {}} disabled={!canEdit} color="orange" fullWidth />
            </Link>

            <EmergencyAction disabled={!canEdit} onConfirm={() => { dispatch({ type: "EMERGENCY" }); toast.error("LOCKDOWN"); }} />
          </div>
        </div>

      </div>
    </div>
  );
}

function FuturisticBtn({ icon: Icon, label, onClick, disabled, color, fullWidth }: any) {
  const colorMap: any = {
    cyan: "hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] text-cyan-500",
    purple: "hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] text-purple-500",
    emerald: "hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] text-emerald-500",
    pink: "hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] text-pink-500",
    blue: "hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] text-blue-500",
    orange: "hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] text-orange-500",
    red: "hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] text-red-500 bg-red-500/5",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed",
        colorMap[color] || colorMap.cyan,
        fullWidth ? "w-full flex-row justify-start px-6 gap-4" : "h-full"
      )}
    >
      <Icon className="h-6 w-6 transition-transform group-hover:scale-110 group-active:scale-95" />
      <span className="font-sans font-bold text-[11px] tracking-wider uppercase text-white/80 group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}

function EmergencyAction({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="col-span-2">
           <FuturisticBtn icon={OctagonAlert} label="Emergency Lockdown" disabled={disabled} color="red" fullWidth />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-neutral-950 border border-red-500/30 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-500">
            <OctagonAlert className="h-5 w-5" /> OVERRIDE PROTOCOL
          </AlertDialogTitle>
          <AlertDialogDescription className="text-neutral-400">
            Execute immediate shutdown of all non-critical power systems? This action will isolate the grid.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white">Abort</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            onClick={onConfirm}
          >
            Execute
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
