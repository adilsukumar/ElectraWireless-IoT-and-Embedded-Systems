import { useEffect, useRef, useState } from "react";
import '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { createFileRoute } from "@tanstack/react-router";
import { Mic, Moon, ShieldCheck, Circle, Bell, CameraOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useHome } from "@/lib/home/store";

export const Route = createFileRoute("/camera")({
  head: () => ({
    meta: [
      { title: "Smart Vision, ELLY Home Automation" },
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  // Real Edge AI Detections using MobileNet
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [objectDetector, setObjectDetector] = useState<cocoSsd.ObjectDetection | null>(null);
  const [snehalEmbeddings, setSnehalEmbeddings] = useState<Float32Array[]>([]);
  const [prediction, setPrediction] = useState<{ className: string; probability: number } | null>(null);

  // Load MobileNet once on component mount
  useEffect(() => {
    let isMounted = true;
    Promise.all([mobilenet.load(), cocoSsd.load()]).then(async ([m, objDetector]) => {
      if (!isMounted) return;
      setModel(m);
      setObjectDetector(objDetector);

      const embeddings: Float32Array[] = [];
      for (let i = 1; i <= 6; i++) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = `/snehaldixitpic/img${i}.jpg`;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          const activation = m.infer(img, true);
          embeddings.push(activation.dataSync() as Float32Array);
          activation.dispose();
        } catch (e) {
          console.error(`Failed to load training image img${i}.jpg`, e);
        }
      }
      setSnehalEmbeddings(embeddings);
    });
    return () => { isMounted = false; };
  }, []);

  // Run classification loop when camera is active and model is loaded
  useEffect(() => {
    if (!active || !model || !videoRef.current) {
      setPrediction(null);
      return;
    }
    
    let animationFrameId: number;
    let lastLogTime = 0;

    const detectFrame = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && canvasRef.current && objectDetector) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          const detections = await objectDetector.detect(video);
          
          for (const det of detections) {
            let label = det.class;
            
            const [x, y, width, height] = det.bbox;
            const cropCanvas = document.createElement('canvas');
            cropCanvas.width = width;
            cropCanvas.height = height;
            const cropCtx = cropCanvas.getContext('2d');
            
            if (cropCtx && det.score > 0.5) {
              cropCtx.drawImage(video, x, y, width, height, 0, 0, width, height);
              
              try {
                const predictions = await model.classify(cropCanvas);
                if (predictions && predictions.length > 0) {
                  const mobileNetClass = predictions[0].className.split(',')[0].toLowerCase();
                  const isHumanClothing = ["suit", "t-shirt", "jersey", "sweatshirt", "cardigan", "jean", "wig", "sunglasses", "seat belt", "neck brace", "bow tie", "mask", "abaya", "academic gown", "apron", "bathing cap", "bikini", "brassiere", "cowboy hat", "crash helmet", "fur coat", "gown", "lab coat", "miniskirt", "overskirt", "pajama", "poncho", "shower cap", "ski mask", "sombrero", "stole", "swimming trunks", "trench coat", "vest", "nipple", "face powder", "hair spray", "lipstick", "lotion", "perfume", "stethoscope"].some(c => mobileNetClass.includes(c));

                  if (det.class === "person" || isHumanClothing) {
                    if (snehalEmbeddings.length > 0) {
                      const activation = model.infer(cropCanvas, true);
                      const data = activation.dataSync() as Float32Array;
                      activation.dispose();

                      let maxSim = 0;
                      for (const emb of snehalEmbeddings) {
                        let dotProduct = 0, normA = 0, normB = 0;
                        for (let i = 0; i < data.length; i++) {
                          dotProduct += data[i] * emb[i];
                          normA += data[i] * data[i];
                          normB += emb[i] * emb[i];
                        }
                        const sim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
                        if (sim > maxSim) maxSim = sim;
                      }

                      if (maxSim > 0.60) {
                        label = `Snehal Dixit #Elly ID : #0001 (${Math.round(maxSim * 100)}%)`;
                      } else {
                        label = `Unknown Person (${Math.round(maxSim * 100)}%)`;
                      }
                    } else {
                      label = "Unknown Person";
                    }
                  } else {
                    // It's an object! Use MobileNet's 1000-class label
                    label = mobileNetClass.charAt(0).toUpperCase() + mobileNetClass.slice(1);
                  }
                }
              } catch (e) {}
            }
            
            const scaleX = canvas.width / video.videoWidth;
            const scaleY = canvas.height / video.videoHeight;
            const scale = Math.max(scaleX, scaleY);
            const offsetX = (canvas.width - video.videoWidth * scale) / 2;
            const offsetY = (canvas.height - video.videoHeight * scale) / 2;

            const drawX = x * scale + offsetX;
            const drawY = y * scale + offsetY;
            const drawW = width * scale;
            const drawH = height * scale;

            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 3;
            ctx.strokeRect(drawX, drawY, drawW, drawH);
            
            ctx.fillStyle = '#a855f7';
            const textWidth = ctx.measureText(label).width;
            ctx.fillRect(drawX, drawY - 24, textWidth + 10, 24);
            
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.fillText(label, drawX + 5, drawY - 6);

            const now = Date.now();
            if (det.score > 0.7 && now - lastLogTime > 15000) {
              dispatch({ 
                type: "LOG", 
                entry: { 
                  id: now.toString(), 
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
                  source: "system", 
                  text: `Vision AI: High confidence match - ${label}` 
                } 
              });
              lastLogTime = now;
            }
          }
        }
      }
      
      setTimeout(() => {
        animationFrameId = requestAnimationFrame(detectFrame);
      }, 100);
    };

    detectFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, model, objectDetector, snehalEmbeddings, dispatch]);

  useEffect(() => {
    if (active) startStream();
    else stopStream();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="bg-black flex-1 text-white pb-6 -mx-4 px-4 sm:-mx-8 sm:px-8 flex flex-col">
      <div className="mx-auto max-w-4xl w-full space-y-6 pt-2">
        {!state.cameraEnabled && (
          <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-blue-500/20 bg-[#111116] p-8 text-center shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <ShieldCheck className="h-10 w-10 text-blue-400" />
            <p className="text-[15px] font-medium text-neutral-300">
              Camera access requires your explicit consent. Enable to view live feed and alerts.
            </p>
            <button
              className="rounded-full bg-blue-500 hover:bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all"
              onClick={() => {
                dispatch({
                  type: "PATCH_CAMERA",
                  patch: { cameraEnabled: true, cameraPrivacy: false },
                });
                toast.success("Camera consent granted");
              }}
            >
              Grant camera consent
            </button>
          </div>
        )}

        {/* Live feed */}
        <div className="overflow-hidden rounded-[2rem] border border-white/5 shadow-2xl bg-[#111116]">
          <div className="relative flex aspect-video items-center justify-center bg-black text-white">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={active && !camError ? "h-full w-full object-cover" : "hidden"}
            />
            <canvas
              ref={canvasRef}
              className={active && !camError ? "absolute inset-0 h-full w-full pointer-events-none z-10" : "hidden"}
            />

            {active && !camError && (
              <>
                <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.5)] z-10">
                  <Circle className="h-2 w-2 animate-pulse fill-current" /> LIVE
                </span>
                {state.cameraRecording && (
                  <span className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-white z-10">
                    <Circle className="h-2 w-2 animate-pulse fill-red-500 text-red-500" /> REC
                  </span>
                )}

                {!model && active && !camError && (
                  <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-[13px] font-bold text-white tracking-wide z-10 shadow-lg">
                    Loading AI Model...
                  </span>
                )}
                {starting && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm text-[15px] font-medium z-10">
                    Starting camera…
                  </span>
                )}
              </>
            )}

            {active && camError && (
              <div className="flex flex-col items-center gap-4 px-6 text-center">
                <CameraOff className="h-10 w-10 text-neutral-500" />
                <span className="text-[15px] font-medium text-neutral-400">{camError}</span>
                <button 
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2 text-sm font-bold text-white transition-all"
                  onClick={startStream}
                >
                  <RefreshCw className="h-4 w-4" /> Retry
                </button>
              </div>
            )}

            {!active && (
              <div className="flex flex-col items-center gap-3">
                <Moon className="h-10 w-10 text-neutral-500" />
                <span className="text-[15px] font-bold text-neutral-400">
                  {state.cameraEnabled ? "Privacy Mode, camera off" : "Camera disabled"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => dispatch({ type: "PATCH_CAMERA", patch: { cameraPrivacy: !state.cameraPrivacy } })}
            disabled={!state.cameraEnabled}
            className="flex flex-col items-center justify-center gap-3 py-5 px-2 rounded-[1.5rem] bg-[#111116] border border-white/5 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg group"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform group-hover:scale-105 ${state.cameraPrivacy ? "bg-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "bg-white/10"}`}>
              <Moon className="h-6 w-6" />
            </span>
            <span className="font-semibold text-white text-[13px]">Privacy</span>
          </button>
          
          <button
            onClick={() => dispatch({ type: "PATCH_CAMERA", patch: { cameraMotionAlerts: !state.cameraMotionAlerts } })}
            disabled={!active}
            className="flex flex-col items-center justify-center gap-3 py-5 px-2 rounded-[1.5rem] bg-[#111116] border border-white/5 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg group"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform group-hover:scale-105 ${state.cameraMotionAlerts ? "bg-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "bg-white/10"}`}>
              <Bell className="h-6 w-6" />
            </span>
            <span className="font-semibold text-white text-[13px]">Alerts</span>
          </button>
          
          <button
            onClick={() => dispatch({ type: "PATCH_CAMERA", patch: { cameraRecording: !state.cameraRecording } })}
            disabled={!active}
            className="flex flex-col items-center justify-center gap-3 py-5 px-2 rounded-[1.5rem] bg-[#111116] border border-white/5 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg group"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform group-hover:scale-105 ${state.cameraRecording ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "bg-white/10"}`}>
              <Circle className="h-6 w-6" />
            </span>
            <span className="font-semibold text-white text-[13px]">Record</span>
          </button>

          <button
            onClick={toggleTalk}
            disabled={!active}
            className="flex flex-col items-center justify-center gap-3 py-5 px-2 rounded-[1.5rem] bg-[#111116] border border-white/5 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg group col-span-2"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform group-hover:scale-105 ${talking ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse" : "bg-white/10"}`}>
              <Mic className="h-6 w-6" />
            </span>
            <span className="font-semibold text-white text-[13px]">{talking ? "Speaking..." : "Talk"}</span>
          </button>

          <button
            disabled={!active}
            className="flex flex-col items-center justify-center gap-3 py-5 px-2 rounded-[1.5rem] bg-[#111116] border border-white/5 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg group"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform group-hover:scale-105 ${active ? "bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.4)]" : "bg-white/10"}`}>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-white">Auto</span>
            </span>
            <span className="font-semibold text-white text-[13px]">Night</span>
          </button>
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-[#111116] p-7 shadow-2xl">
          <h2 className="mb-5 text-lg font-bold text-neutral-400">Event History</h2>
          <div className="space-y-4">
            {events.map((e) => (
              <div key={e.time} className="flex items-center gap-4">
                <span className="font-mono text-sm font-bold text-neutral-500">{e.time}</span>
                <span className="text-[15px] font-medium text-white">{e.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
