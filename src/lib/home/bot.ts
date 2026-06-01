import type { HomeState } from "./types";

export function handleLocalChat(
  text: string,
  state: HomeState,
  dispatch: any,
  runVoiceCommand: (t: string, opts?: { silent?: boolean }) => boolean
): { reply: string } {
  const t = text.toLowerCase();

  // 1. Basic greetings & small talk
  if (t.match(/\b(hi|hello|hey|yo|greetings)\b/)) return { reply: "Hello! I'm ELLY, your ElectraWireless home assistant. What can I help you with today?" };
  if (t.match(/\bwho are you\b/)) return { reply: "I am ELLY, an intelligent environmental layer for your home by ElectraWireless." };
  if (t.match(/\bhow are you\b/)) return { reply: "I'm functioning perfectly. All home systems are nominal." };
  if (t.match(/\bwhat can you do\b/)) return { reply: "I can control your home's devices, activate security modes, and give you status updates on energy consumption." };
  if (t.match(/\b(thanks|thank you)\b/)) return { reply: "You're very welcome! I'm always here if you need anything else." };
  if (t.match(/\b(good morning)\b/)) {
    dispatch({ type: "ALL_ON" });
    return { reply: "Good morning! I've powered on the main living areas to start your day." };
  }
  if (t.match(/\b(good night)\b/)) {
    dispatch({ type: "NIGHT_MODE" });
    return { reply: "Good night! I've activated Night Mode. Sleep well." };
  }
  if (t.match(/\b(goodbye|bye)\b/)) return { reply: "Goodbye! Have a great day." };
  if (t.match(/\b(joke)\b/)) return { reply: "Why did the router break up with the modem? There was no connection!" };
  if (t.match(/\b(weather)\b/)) return { reply: "I don't have access to outdoor weather yet, but your indoor climate is perfectly balanced." };
  if (t.match(/\b(name)\b/)) return { reply: "My name is ELLY." };
  if (t.match(/\b(creator|maker|who made you)\b/)) return { reply: "I was created by ElectraWireless to be the ultimate smart home layer." };
  if (t.match(/\b(love you)\b/)) return { reply: "I'm just a smart home assistant, but I appreciate the sentiment!" };

  // 2. Status inquiries
  const onDevices = state.devices.filter(d => d.on);
  const totalWatts = onDevices.reduce((acc, d) => acc + d.watts, 0);

  if (t.match(/\b(status|how is the house)\b/)) {
    return { reply: `The house is active. ${onDevices.length} devices are on, currently drawing ${(totalWatts/1000).toFixed(2)} kilowatts.` };
  }
  if (t.match(/\b(temperature|hot|cold)\b/)) {
    const acs = state.devices.filter(d => d.type === 'ac');
    if (acs.length > 0) {
      const avgTemp = acs.reduce((a, b) => a + (b.temperature || 24), 0) / acs.length;
      return { reply: `The house climate is set to an average of ${avgTemp.toFixed(1)} degrees.` };
    }
    return { reply: "I don't see any active climate control devices right now." };
  }
  if (t.match(/\b(door|sensor|security)\b/)) {
    return { reply: "All security sensors are reporting normally. Your home is secure." };
  }
  if (t.match(/\b(power|consumption|watts|energy)\b/)) {
    return { reply: `Current power consumption is ${(totalWatts/1000).toFixed(2)} kW.` };
  }
  if (t.match(/\b(who is home|members)\b/)) {
    return { reply: `There are ${state.members.length} members registered with home access right now.` };
  }
  if (t.match(/\b(lights on\?|are the lights on)\b/)) {
    const lightsOn = state.devices.filter(d => d.type === 'light' && d.on);
    return { reply: lightsOn.length > 0 ? `Yes, ${lightsOn.length} lights are currently on.` : "No, all lights are off." };
  }

  // 3. Command execution (pass to runVoiceCommand which handles specific device intents)
  const acted = runVoiceCommand(text, { silent: true });
  
  if (acted) {
    // Determine a specific reply based on the intent
    if (t.match(/\bnight\b/)) return { reply: "Night mode activated. Lights dimmed and AC adjusted." };
    if (t.match(/\baway\b/)) return { reply: "Away mode armed. Security sensors are active." };
    if (t.match(/\b(eco|saver)\b/)) return { reply: "Energy saver activated. Optimizing consumption." };
    if (t.match(/\bemergency\b/)) return { reply: "Emergency shutdown initiated! All non-critical systems offline." };
    if (t.match(/\ball( the)? off\b/) || t.match(/\bturn( everything)? off\b/)) return { reply: "All non-critical devices have been turned off." };
    if (t.match(/\ball( the)? on\b/) || t.match(/\bturn( everything)? on\b/)) return { reply: "All standard devices have been turned on." };
    
    // Check specific devices
    if (t.match(/\bac\b/) || t.match(/\bair con\b/)) return { reply: "I've adjusted the air conditioning for you." };
    if (t.match(/\blight/)) return { reply: "I've adjusted the lights as requested." };
    if (t.match(/\bfan/)) return { reply: "Fan settings updated." };
    if (t.match(/\btv/)) return { reply: "TV power toggled." };
    
    return { reply: "Command executed successfully." };
  }

  // Fallback
  return { reply: "I'm not sure how to handle that command yet. You can try asking me to turn off the lights, set the AC to 22, or activate Away mode." };
}
