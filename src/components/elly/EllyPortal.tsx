import { useEffect, useRef, useState } from "react";
import { Mic, CornerDownLeft, X, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHome } from "@/lib/home/store";
import { handleLocalChat } from "@/lib/home/bot";
import { EllyLogo } from "./EllyLogo";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

const chips = [
  "Turn off all lights",
  "Set bedroom AC to 23 degrees",
  "Activate energy saver mode",
  "Activate night mode",
];

type ChatMsg = { id: string; role: "user" | "assistant"; content: string };

// Minimal typing for the Web Speech API (not in standard TS lib)
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

const uid = () => Math.random().toString(36).slice(2);

const GREETING: ChatMsg = {
  id: "greet",
  role: "assistant",
  content:
    "Hi, I'm ELLY. Ask me anything or tell me what to do, like turning off the lights or setting the AC.",
};

export function EllyPortal({ open, onClose, initialCmd }: { open: boolean; onClose: () => void; initialCmd?: string }) {
  const { runVoiceCommand, state, totalWatts, activeCount, dispatch } = useHome();
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [heard, setHeard] = useState("");
  const [thinking, setThinking] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(true);
  const [messages, setMessages] = useState<ChatMsg[]>([GREETING]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Process initial command if woken with one
  useEffect(() => {
    if (open && initialCmd) {
      // Small delay to let UI render before sending
      setTimeout(() => sendMessage(initialCmd), 500);
    } else if (open && !initialCmd && !listening) {
      // If opened with just "Hey Elly", start listening automatically
      startListening();
    }
  }, [open, initialCmd]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  // Keep input focused
  useEffect(() => {
    if (open && !listening) inputRef.current?.focus();
  }, [open, listening, messages]);

  const speak = async (s: string) => {
    if (!voiceReplies) return;
    try {
      if (typeof window !== "undefined" && (window as any).cordova) {
        await TextToSpeech.stop();
        await TextToSpeech.speak({
          text: s,
          lang: 'en-US',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          category: 'ambient',
        });
      } else if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(s);
        u.rate = 1.02;
        u.pitch = 1.05;
        window.speechSynthesis.speak(u);
      }
    } catch {
      /* ignore */
    }
  };

  const homeSummary = () => {
    const onDevices = state.devices
      .filter((d) => d.on)
      .map((d) => d.name)
      .slice(0, 8)
      .join(", ");
    return `${activeCount} devices on, total load ${(totalWatts / 1000).toFixed(2)} kW. Active: ${onDevices || "none"}. Role: ${state.role}.`;
  };

  const sendMessage = async (raw: string) => {
    const value = raw.trim();
    if (!value || thinking) return;
    setText("");
    setHeard("");
    const userMsg: ChatMsg = { id: uid(), role: "user", content: value };
    const history = [...messages, userMsg];
    setMessages(history);
    setThinking(true);

    try {
      // Small artificial delay to feel like it's thinking
      await new Promise(resolve => setTimeout(resolve, 600));
      const res = handleLocalChat(value, state, dispatch, runVoiceCommand);
      
      const reply = res.reply || "Done.";
      setMessages((m) => [...m, { id: uid(), role: "assistant", content: reply }]);
      speak(reply);
    } catch {
      const msg = "Sorry, I had trouble processing that.";
      setMessages((m) => [...m, { id: uid(), role: "assistant", content: msg }]);
      speak(msg);
    } finally {
      setThinking(false);
    }
  };

  const stopListening = () => {
    setListening(false);
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
  };

  const startListening = () => {
    setHeard("");
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setListening(true);
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      const transcript = Array.from({ length: e.results.length })
        .map((_, i) => e.results[i][0].transcript)
        .join(" ");
      setHeard(transcript);
    };
    rec.onend = () => {
      setListening(false);
      setHeard((current) => {
        if (current.trim()) sendMessage(current.trim());
        return "";
      });
    };
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const toggleMic = () => {
    if (listening) {
      stopListening();
      if (heard.trim()) sendMessage(heard.trim());
    } else {
      startListening();
    }
  };

  // Reset transient state when closing
  useEffect(() => {
    if (!open) {
      stopListening();
      setHeard("");
      setText("");
      setThinking(false);
      try {
        if (typeof window !== "undefined" && (window as any).cordova) {
          TextToSpeech.stop();
        } else if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="fixed inset-0 z-[60] mx-auto flex w-full max-w-md flex-col bg-background text-foreground">
      {/* Ambient purple glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15"
      />

      {/* Header */}
      <div className="relative flex items-center gap-3 px-5 pt-6">
        <EllyLogo className="h-11 w-11" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-extrabold leading-none">ELLY</p>
          <p className="text-[11px] text-muted-foreground">AI Control Portal</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setVoiceReplies((v) => !v)}
          aria-label={voiceReplies ? "Mute voice replies" : "Unmute voice replies"}
          className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {voiceReplies ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close ELLY portal"
          className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="relative flex-1 space-y-4 overflow-y-auto px-5 py-6">
        {messages.map((m) =>
          m.role === "assistant" ? (
            <div key={m.id} className="flex items-start gap-2.5">
              <EllyLogo className="mt-0.5 h-7 w-7 shrink-0" />
              <p className="max-w-[85%] text-sm leading-relaxed text-foreground">{m.content}</p>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm leading-relaxed text-primary-foreground">
                {m.content}
              </p>
            </div>
          ),
        )}
        {thinking && (
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <EllyLogo className="h-7 w-7 shrink-0" />
            <span className="flex items-center gap-1.5 text-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> ELLY is thinking
            </span>
          </div>
        )}
        {listening && (
          <div className="flex justify-end">
            <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-muted px-3.5 py-2 text-sm italic text-muted-foreground">
              {heard || "Listening…"}
            </p>
          </div>
        )}
      </div>

      {/* Bottom: composer */}
      <div className="relative border-t border-border/60 bg-background/95 backdrop-blur-md px-4 pb-6 pt-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => sendMessage(c)}
              disabled={thinking}
              className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground disabled:opacity-50"
            >
              {c}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(text);
          }}
          className="flex items-center gap-2"
        >
          <Button
            type="button"
            size="icon"
            onClick={toggleMic}
            aria-label={listening ? "Stop listening" : "Start voice command"}
            className={cn(
              "shrink-0 rounded-full transition-colors",
              listening
                ? "bg-primary text-primary-foreground shadow-[0_0_24px_-4px_hsl(var(--primary))]"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            <Mic className={cn("h-4 w-4", listening && "animate-pulse")} />
          </Button>
          <Input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'Ask ELLY… e.g. "Set bedroom AC to 23 degrees"'}
            className="flex-1 border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
          />
          <Button
            type="submit"
            size="icon"
            disabled={thinking || !text.trim()}
            aria-label="Send command"
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <CornerDownLeft className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
