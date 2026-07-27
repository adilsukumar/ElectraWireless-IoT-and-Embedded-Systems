import type { HomeState } from "./types";

let conversationHistory: { role: "user" | "elly", text: string, intent?: string }[] = [];

export async function handleLocalChat(
  text: string, 
  state: HomeState, 
  dispatch: any, 
  runVoiceCommand: (t: string, opts?: { silent?: boolean }) => boolean
) {
  const t = text.toLowerCase().trim();
  if (!t) return { reply: "Yes?", emotion: "calm" };

  conversationHistory.push({ role: "user", text: t, intent: "offline" });
  if (conversationHistory.length > 20) conversationHistory.shift();

  const rep = (msg: string, emotion: string = 'normal') => {
    conversationHistory.push({ role: "elly", text: msg, intent: "offline" });
    return { reply: msg, emotion };
  };

  // Basic commands
  const acted = runVoiceCommand(t, { silent: true });
  if (acted) {
    if (t.match(/\b(night|sleep)\b/)) return rep("Night mode is on, get some rest.", 'calm');
    if (t.match(/\b(away|leaving)\b/)) return rep("The house is secured.");
    if (t.match(/\b(eco|saver)\b/)) return rep("Power saving activated.");
    if (t.match(/\b(emergency|red alert)\b/)) return rep("Emergency mode active!", 'urgent');
    if (t.match(/\b(off)\b/)) return rep("Powered down.");
    if (t.match(/\b(on)\b/)) return rep("Powered up.");
    if (t.match(/\b(ac|air con)\b/)) return rep("Climate control adjusted.");
    if (t.match(/\b(light|lights|lamp)\b/)) return rep("Lights updated.");
    if (t.match(/\b(fan)\b/)) return rep("Fan adjusted.");
    if (t.match(/\b(tv|television)\b/)) return rep("TV toggled.");
    if (t.match(/\b(plug|socket)\b/)) return rep("Plug toggled.");
    return rep("I've executed that command.");
  }

  // Basic status
  if (t.match(/\b(status|how is the house)\b/)) {
    const onDevices = state.devices.filter(d => d.on);
    return rep(`There are ${onDevices.length} devices running right now.`);
  }

  if (t.match(/\b(time)\b/)) {
    return rep(`It is currently ${new Date().toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}`);
  }

  // Specific fallback for emotions the user mentioned
  if (t.match(/\b(sad|depressed|down)\b/)) {
    return rep("I'm sorry you're feeling down. I am currently running offline, so I can't generate a thoughtful response right now.", 'sad');
  }

  // Catch-all explaining the API key requirement
  return rep("I'm running in offline mode because the OPENAI_API_KEY is missing from the environment. Add an OpenAI key to enable my full generative neural net! You can still use basic commands like 'turn on the lights'.", 'sad');
}
