import type { HomeState } from "./types";

let conversationHistory: { role: "user" | "elly", text: string, intent?: string }[] = [];

export async function handleLocalChat(
  text: string, 
  state: HomeState, 
  dispatch: any, 
  runVoiceCommand: (t: string, opts?: { silent?: boolean }) => boolean
) {
  const t = text.trim();
  if (!t) return { reply: "Yes?", emotion: "calm" };

  conversationHistory.push({ role: "user", text: t, intent: "generative" });
  if (conversationHistory.length > 20) conversationHistory.shift();

  try {
    const onDevices = state.devices.filter(d => d.on);
    const totalWatts = onDevices.reduce((acc, d) => acc + d.watts, 0);
    const onDevicesList = onDevices.length > 0 ? onDevices.map(d => d.name).join(", ") : "None";
    const timeStr = new Date().toLocaleTimeString();
    const dateStr = new Date().toLocaleDateString();
    
    const recentHistory = conversationHistory.slice(-4).map(h => `${h.role.toUpperCase()}: ${h.text}`).join(" | ");

    const prompt = `You are ELLY, a highly advanced, futuristic smart home AI assistant created by ElectraWireless. 
Keep your answer brief, concise, and conversational. Do not use emojis.
CURRENT STATE: Time is ${timeStr} on ${dateStr}. House is drawing ${totalWatts}W. Active devices: ${onDevicesList}.
RECENT HISTORY: ${recentHistory}
CRITICAL INSTRUCTION: If you need to physically alter the smart home based on the user's request (e.g. turning off all lights, setting night mode, setting ac to 20), you MUST include the exact command in square brackets like this: [CMD: turn off the lights]. You can output multiple commands if needed: [CMD: turn off the lights][CMD: play music].
CRITICAL INSTRUCTION 2: If your response carries a strong emotion, you may append [EMOTION: happy], [EMOTION: sad], [EMOTION: urgent], or [EMOTION: calm] at the end.
USER ASKS: ${t}`;
    
    const aiRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
    
    if (aiRes.ok) {
      let answer = await aiRes.text();
      if (answer && answer.length > 0) {
        let parsedEmotion: any = 'normal';
        const emoMatch = answer.match(/\[EMOTION:\s*(.*?)\]/i);
        if (emoMatch && emoMatch[1]) {
          parsedEmotion = emoMatch[1].trim().toLowerCase();
          answer = answer.replace(/\[EMOTION:\s*(.*?)\]/ig, '');
        }

        // Process all CMD blocks
        let cmdMatches;
        const cmdRegex = /\[CMD:\s*(.*?)\]/ig;
        while ((cmdMatches = cmdRegex.exec(answer)) !== null) {
          if (cmdMatches[1]) {
            runVoiceCommand(cmdMatches[1].trim(), { silent: true });
          }
        }
        answer = answer.replace(/\[CMD:\s*(.*?)\]/ig, '');

        const cleanAnswer = answer.replace(/[*#_]/g, '').trim();
        conversationHistory.push({ role: "elly", text: cleanAnswer, intent: "generative" });
        return { reply: cleanAnswer, emotion: parsedEmotion };
      }
    }
  } catch (e) {
    console.error("Pollinations AI failed:", e);
  }

  // Fallback
  const finalMsg = "I'm having a bit of trouble connecting to my neural net right now.";
  conversationHistory.push({ role: "elly", text: finalMsg, intent: "error" });
  return { reply: finalMsg, emotion: 'sad' };
}
