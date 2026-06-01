import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mic, Moon, ShieldCheck, Circle, Bell, CameraOff, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useHome } from "@/lib/home/store";

export const Route = createFileRoute("/camera")({
  head: () => ({
    meta: [
      { title: "Smart Vision, ELLY Home Automation" },
      { name: "description", content: "Secure, user-controlled camera with privacy-first design." },
    ],
  }),
  component: CameraPage,
});

const events = [
  { time: "08:42", text: "Motion detected, front door" },
  { time: "07:15", text: "Person detected, living room" },
  { time: "23:50", text: "Night vision engaged" },
  { time: "22:03", text: "Recording started (event-based)" },
];

function CameraPage() {
  const { state, dispatch } = useHome();
  const active = state.cameraEnabled && !state.cameraPrivacy;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [talking, setTalking] = useState(false);

  const toggleTalk = async () => {
    if (talking) {
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
      setTalking(false);
      toast("Two-way audio closed");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      toast.error("Microphone is not supported on this device.");
      return;
    }
    try {
      micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      setTalking(true);
      toast.success("Two-way audio open, speak now");
    } catch {
      toast.error("Microphone permission denied.");
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    setTalking(false);
  };

  const startStream = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCamError("This device or browser does not support camera access.");
      return;
    }
    setStarting(true);
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setCamError(
        name === "NotAllowedError"
          ? "Camera permission was denied. Allow access in your browser to view the live feed."
          : "Could not access a camera on this device.",
      );
    } finally {
      setStarting(false);
    }
  };

  // Manage the live stream based on consent + privacy mode
  useEffect(() => {
    if (active) startStream();
    else stopStream();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Smart Vision</h1>
        <p className="text-sm text-muted-foreground">
          Optional. Secure. User-controlled. Camera enhances safety, it never invades privacy.
        </p>
      </div>

      {!state.cameraEnabled && (
        <Card className="flex flex-col items-center gap-3 rounded-3xl border-accent/40 bg-accent/10 p-6 text-center">
          <ShieldCheck className="h-8 w-8 text-accent" />
          <p className="text-sm">
            Camera access requires your explicit consent. Enable to view live feed and alerts.
          </p>
          <Button
            onClick={() => {
              dispatch({
                type: "PATCH_CAMERA",
                patch: { cameraEnabled: true, cameraPrivacy: false },
              });
              toast.success("Camera consent granted");
            }}
          >
            Grant camera consent
          </Button>
        </Card>
      )}

      {/* Live feed */}
      <Card className="overflow-hidden rounded-3xl p-0">
        <div className="relative flex aspect-video items-center justify-center bg-black text-primary-foreground">
          {/* Always-mounted video element so the ref is ready */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={active && !camError ? "h-full w-full object-cover" : "hidden"}
          />

          {active && !camError && (
            <>
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold">
                <Circle className="h-2 w-2 animate-pulse fill-current" /> CAMERA ACTIVE
              </span>
              {state.cameraRecording && (
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs">
                  <Circle className="h-2 w-2 animate-pulse fill-current text-destructive" /> REC
                </span>
              )}
              {starting && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm">
                  Starting camera…
                </span>
              )}
            </>
          )}

          {active && camError && (
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <CameraOff className="h-10 w-10 opacity-80" />
              <span className="text-sm opacity-90">{camError}</span>
              <Button size="sm" variant="secondary" onClick={startStream}>
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </Button>
            </div>
          )}

          {!active && (
            <div className="flex flex-col items-center gap-2">
              <Moon className="h-10 w-10 opacity-70" />
              <span className="text-sm opacity-80">
                {state.cameraEnabled ? "Privacy Mode, camera off" : "Camera disabled"}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Controls */}
      <Card className="space-y-4 rounded-3xl p-5">
        <h2 className="font-display font-bold">Controls</h2>
        <Row label="Privacy mode" icon={Moon}>
          <Switch
            checked={state.cameraPrivacy}
            disabled={!state.cameraEnabled}
            onCheckedChange={(v) => dispatch({ type: "PATCH_CAMERA", patch: { cameraPrivacy: v } })}
          />
        </Row>
        <Row label="Motion alerts" icon={Bell}>
          <Switch
            checked={state.cameraMotionAlerts}
            disabled={!active}
            onCheckedChange={(v) =>
              dispatch({ type: "PATCH_CAMERA", patch: { cameraMotionAlerts: v } })
            }
          />
        </Row>
        <Row label="Event recording" icon={Circle}>
          <Switch
            checked={state.cameraRecording}
            disabled={!active}
            onCheckedChange={(v) =>
              dispatch({ type: "PATCH_CAMERA", patch: { cameraRecording: v } })
            }
          />
        </Row>
        <Button
          variant={talking ? "default" : "outline"}
          className="w-full"
          disabled={!active}
          onClick={toggleTalk}
        >
          <Mic className={`mr-2 h-4 w-4 ${talking ? "animate-pulse" : ""}`} />{" "}
          {talking ? "Speaking, tap to stop" : "Two-way audio"}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Night vision</span>
          <Badge variant={active ? "default" : "secondary"}>{active ? "Auto" : "Standby"}</Badge>
        </div>
      </Card>

      <Card className="rounded-3xl p-5">
        <h2 className="mb-3 font-display font-bold">Event History</h2>
        <div className="space-y-2 text-sm">
          {events.map((e) => (
            <div key={e.time} className="flex gap-3 border-b border-border pb-2 last:border-0">
              <span className="font-mono text-xs text-muted-foreground">{e.time}</span>
              <span>{e.text}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Recordings stored locally for a user-defined duration. AI vision is processed on the edge,
          no continuous behavioral tracking.
        </p>
      </Card>
    </div>
  );
}

function Row({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Moon;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="flex items-center gap-2 text-sm font-normal">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" /> {label}
      </Label>
      {children}
    </div>
  );
}
