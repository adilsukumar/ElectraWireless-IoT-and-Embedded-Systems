import os
import re

def patch_camera():
    path = "D:/17_ElectraWireless_Elly_IoT/src/routes/camera.tsx"
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()

    # Lower face similarity threshold
    code = code.replace('if (highestSim > 0.85 && bestMatch) {', 'if (highestSim > 0.55 && bestMatch) {')
    code = code.replace('Increased threshold to 0.85 to stop false positives', 'Lowered threshold to 0.55 to prevent Unknown Person error')

    # Debounce Global Scene prediction
    old_global_scene = """          try {
            const globalPredictions = await model.classify(video);
            if (globalPredictions && globalPredictions.length > 0) {
              const topLabel = globalPredictions[0].className.split(',')[0].toUpperCase();
              const topScore = Math.round(globalPredictions[0].probability * 100);
              currentDetectionsHtml += `
                <div class="flex justify-between items-center bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg mb-2 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                  <span class="text-xs font-bold text-slate-900 dark:text-white tracking-wider">GLOBAL SCENE: ${topLabel}</span>
                  <span class="text-[10px] font-mono text-blue-500 bg-blue-500/20 px-1.5 py-0.5 rounded">${topScore}%</span>
                </div>
              `;
            }
          } catch(e) {}"""
          
    new_global_scene = """          try {
            // Debounce the global scene prediction (1 call every 1.5 seconds)
            const now = Date.now();
            if (now - lastLogTime > 1500) {
              const globalPredictions = await model.classify(video);
              if (globalPredictions && globalPredictions.length > 0) {
                const topLabel = globalPredictions[0].className.split(',')[0].toUpperCase();
                const topScore = Math.round(globalPredictions[0].probability * 100);
                setPrediction({ className: topLabel, probability: topScore });
              }
              lastLogTime = now;
            }
          } catch(e) {}
          
          if (prediction) {
            currentDetectionsHtml += `
              <div class="flex justify-between items-center bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg mb-2 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                <span class="text-xs font-bold text-slate-900 dark:text-white tracking-wider">GLOBAL SCENE: ${prediction.className}</span>
                <span class="text-[10px] font-mono text-blue-500 bg-blue-500/20 px-1.5 py-0.5 rounded">${prediction.probability}%</span>
              </div>
            `;
          }"""

    code = code.replace(old_global_scene, new_global_scene)

    with open(path, "w", encoding="utf-8") as f:
        f.write(code)

if __name__ == "__main__":
    patch_camera()
