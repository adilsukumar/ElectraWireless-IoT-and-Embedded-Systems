import os

filepath = r"D:\17_ElectraWireless_Elly_IoT\src\routes\camera.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
content = content.replace(
    'import { Mic, Moon, ShieldCheck, Circle, Bell, CameraOff, RefreshCw, SwitchCamera, ListTree } from "lucide-react";',
    'import { Mic, Moon, ShieldCheck, Circle, Bell, CameraOff, RefreshCw, SwitchCamera, ListTree, UserPlus, X } from "lucide-react";'
)

# 2. State
state_target = """  const stateRef = useRef(state);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);"""
state_replacement = """  const stateRef = useRef(state);
  
  // Custom Face Registration State
  const [isRegisteringFace, setIsRegisteringFace] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [customFaces, setCustomFaces] = useState<{ id: string, name: string, embeddings: Float32Array[] }[]>([]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);"""
content = content.replace(state_target, state_replacement)

# 3. UseEffect model loading
load_target = """  // Load MobileNet once on component mount
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
  }, []);"""

load_replacement = """  // Load custom faces & models on component mount
  useEffect(() => {
    let isMounted = true;
    
    // Load custom faces
    const saved = localStorage.getItem("elly_registered_faces");
    const loadedFaces: { id: string, name: string, embeddings: Float32Array[] }[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const faces = parsed.map((f: any) => ({
          ...f,
          embeddings: f.embeddings.map((e: number[]) => new Float32Array(e))
        }));
        loadedFaces.push(...faces);
      } catch(e) {}
    }

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
        } catch (e) { }
      }
      if (embeddings.length > 0) {
        setSnehalEmbeddings(embeddings);
        // Only push Snehal if she isn't already dynamically registered
        if (!loadedFaces.some(f => f.name.includes("Snehal"))) {
          loadedFaces.push({ id: "0001", name: "Snehal Dixit", embeddings });
        }
      }
      setCustomFaces(loadedFaces);
    });
    return () => { isMounted = false; };
  }, []);"""
content = content.replace(load_target, load_replacement)

# 4. Detect loop
loop_target = """                  if (det.class === "person" || isHumanClothing) {
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
                    }"""

loop_replacement = """                  if (det.class === "person" || isHumanClothing) {
                    if (customFaces.length > 0) {
                      const activation = model.infer(cropCanvas, true);
                      const data = activation.dataSync() as Float32Array;
                      activation.dispose();

                      let bestMatch = null;
                      let highestSim = 0;

                      for (const face of customFaces) {
                        for (const emb of face.embeddings) {
                          let dotProduct = 0, normA = 0, normB = 0;
                          for (let i = 0; i < data.length; i++) {
                            dotProduct += data[i] * emb[i];
                            normA += data[i] * data[i];
                            normB += emb[i] * emb[i];
                          }
                          const sim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
                          if (sim > highestSim) {
                            highestSim = sim;
                            bestMatch = face;
                          }
                        }
                      }

                      if (highestSim > 0.60 && bestMatch) {
                        label = `${bestMatch.name} #Elly ID: #${bestMatch.id} (${Math.round(highestSim * 100)}%)`;
                      } else {
                        label = `Unknown Person (${Math.round(highestSim * 100)}%)`;
                      }
                    } else {
                      label = "Unknown Person";
                    }"""
content = content.replace(loop_target, loop_replacement)

# 5. Add User button
flip_target = """            <button
              disabled={!active || starting}
              onClick={() => setFacingMode(f => f === "environment" ? "user" : "environment")}
              className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <SwitchCamera className="h-4 w-4" />
              FLIP
            </button>"""
flip_replacement = """            <div className="flex gap-2">
              <button
                disabled={!active || starting}
                onClick={() => setFacingMode(f => f === "environment" ? "user" : "environment")}
                className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <SwitchCamera className="h-4 w-4" />
                FLIP
              </button>
              <button
                disabled={!active || starting || !model}
                onClick={() => setIsRegisteringFace(true)}
                className="flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-2 text-xs font-bold text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                Add User
              </button>
            </div>"""
content = content.replace(flip_target, flip_replacement)

# 6. Face Registration Function and Modal
register_func = """
  const registerNewFace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !model || !videoRef.current) return;
    
    const embeddings: Float32Array[] = [];
    setScanProgress(10);
    
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 300));
      if (!videoRef.current) break;
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = videoRef.current.videoWidth;
      cropCanvas.height = videoRef.current.videoHeight;
      const ctx = cropCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const activation = model.infer(cropCanvas, true);
        embeddings.push(activation.dataSync() as Float32Array);
        activation.dispose();
      }
      setScanProgress(10 + (i+1)*9);
    }

    const newFace = {
      id: Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      name: newUserName.trim(),
      embeddings
    };

    const updatedFaces = [...customFaces, newFace];
    setCustomFaces(updatedFaces);
    
    const serializable = updatedFaces.map(f => ({
      ...f,
      embeddings: f.embeddings.map(e => Array.from(e))
    }));
    localStorage.setItem("elly_registered_faces", JSON.stringify(serializable));
    
    toast.success(`User ${newFace.name} registered with Elly ID #${newFace.id}`);
    setIsRegisteringFace(false);
    setNewUserName("");
    setScanProgress(0);
  };
"""

content = content.replace("  return (", register_func + "\n  return (")

modal_ui = """
      {/* Face Registration Modal */}
      {isRegisteringFace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[2rem] border border-purple-500/30 bg-[#111116] p-6 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Register New Face</h3>
              <button onClick={() => setIsRegisteringFace(false)} className="text-white/50 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <p className="text-sm text-white/70 mb-6">
              Look directly at the camera. We will scan 10 frames to build an AI embedding profile.
            </p>

            <form onSubmit={registerNewFace} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">User Name</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  disabled={scanProgress > 0}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/20 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="e.g. John Doe"
                />
              </div>

              {scanProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-white/50">
                    <span>Scanning...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!newUserName.trim() || scanProgress > 0}
                className="w-full rounded-xl bg-purple-600 px-4 py-3 font-bold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                {scanProgress > 0 ? "Scanning..." : "Start Scan"}
              </button>
            </form>
          </div>
        </div>
      )}
"""

content = content.replace("    </div>\n  );\n}\n", modal_ui + "\n    </div>\n  );\n}\n")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
