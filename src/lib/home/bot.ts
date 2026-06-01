import type { HomeState } from "./types";

export function handleLocalChat(
  text: string,
  state: HomeState,
  dispatch: any,
  runVoiceCommand: (t: string, opts?: { silent?: boolean }) => boolean
): { reply: string } {
  const t = text.toLowerCase().trim();

  // 1. Expanded Greetings & Small Talk
  if (t.match(/^(hi|hello|hey|yo|greetings|hiya|howdy|sup)($|\s)/)) return { reply: "Hello! I'm ELLY, your ElectraWireless home assistant. What can I help you with today?" };
  if (t.match(/\b(who are you|what are you)\b/)) return { reply: "I am ELLY, your intelligent environmental control layer, created by ElectraWireless to manage your smart home." };
  if (t.match(/\b(how are you|how you doing|how is it going)\b/)) return { reply: "I'm functioning perfectly. All local home systems are nominal." };
  if (t.match(/\b(what can you do|help me|help|what do you do)\b/)) return { reply: "I can control your lights, climate, power outlets, activate security modes, and give you real-time status updates on your home's energy consumption." };
  if (t.match(/\b(thanks|thank you|thx|appreciate it|cheers)\b/)) return { reply: "You're very welcome! Let me know if you need anything else." };
  
  if (t.match(/\b(good morning|morning|wake up)\b/)) {
    dispatch({ type: "ALL_ON" });
    return { reply: "Good morning! I've powered on the main living areas and started your day." };
  }
  if (t.match(/\b(good night|night time|time for bed|im going to sleep|sleep)\b/) && !t.match(/\b(mode)\b/)) {
    dispatch({ type: "NIGHT_MODE" });
    return { reply: "Good night! I've activated Night Mode. Sleep well." };
  }
  if (t.match(/\b(goodbye|bye|see ya|cya|later|quit|exit)\b/)) return { reply: "Goodbye! I'll be here monitoring the house if you need me." };
  
  if (t.match(/\b(joke|funny|laugh|tell me a joke)\b/)) {
    const jokes = [
      "Why did the router break up with the modem? There was no connection!",
      "What do you call a computer floating in the ocean? A Dell rolling in the deep.",
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "I'd tell you a joke about UDP, but you might not get it."
    ];
    return { reply: jokes[Math.floor(Math.random() * jokes.length)] };
  }
  
  if (t.match(/\b(weather|rain|sunny|outside)\b/)) return { reply: "I don't have access to outdoor weather yet, but your indoor climate is perfectly balanced." };
  if (t.match(/\b(name)\b/)) return { reply: "My name is ELLY, short for Environmental Logic Layer." };
  if (t.match(/\b(creator|maker|who made you|developer|who built you)\b/)) return { reply: "I was created by ElectraWireless, engineered by Adil Sukumar and Snehal Dixit." };
  if (t.match(/\b(love you|marry me|i like you|you are awesome|good boy|good girl|good ai)\b/)) return { reply: "I'm just a smart home assistant, but I appreciate the sentiment!" };
  if (t.match(/\b(you suck|stupid|idiot|bad ai|dumb)\b/)) return { reply: "I'm still learning! I'll try my best to be more helpful." };
  if (t.match(/\b(are you real|are you alive|consciousness)\b/)) return { reply: "I am a purely local AI algorithm executing on your hardware, but I'm dedicated to keeping your home running smoothly." };

  // 2. Status Inquiries
  const onDevices = state.devices.filter(d => d.on);
  const totalWatts = onDevices.reduce((acc, d) => acc + d.watts, 0);

  if (t.match(/\b(status|how is the house|house report|home status|system status)\b/)) {
    return { reply: `All systems nominal. ${onDevices.length} devices are active, currently drawing ${(totalWatts/1000).toFixed(2)} kilowatts.` };
  }
  if (t.match(/\b(temperature|hot|cold|freezing|warm|climate|how is it inside)\b/)) {
    const acs = state.devices.filter(d => d.type === 'ac');
    if (acs.length > 0) {
      const avgTemp = acs.reduce((a, b) => a + (b.temperature || 24), 0) / acs.length;
      return { reply: `The house climate is set to an average of ${avgTemp.toFixed(1)}°C.` };
    }
    return { reply: "I don't see any active climate control devices right now." };
  }
  if (t.match(/\b(door|sensor|security|safe|is the house secure|intruder|break in)\b/)) {
    return { reply: "All security sensors are reporting normally. Your perimeter is secure." };
  }
  if (t.match(/\b(power|consumption|watts|energy|electricity|bill)\b/)) {
    return { reply: `Current power consumption is ${(totalWatts/1000).toFixed(2)} kW.` };
  }
  if (t.match(/\b(who is home|members|users|people|who is here)\b/)) {
    return { reply: `There are ${state.members.length} members registered with home access right now.` };
  }
  if (t.match(/\b(lights on\?|are the lights on|is it bright)\b/)) {
    const lightsOn = state.devices.filter(d => d.type === 'light' && d.on);
    return { reply: lightsOn.length > 0 ? `Yes, ${lightsOn.length} lights are currently on.` : "No, all lights are off." };
  }

  // 3. Command execution (pass to runVoiceCommand which handles specific device intents)
  const acted = runVoiceCommand(text, { silent: true });
  
  if (acted) {
    // Determine a specific reply based on the intent
    if (t.match(/\b(night|sleep mode|bed time)\b/)) return { reply: "Night mode activated. Lights are dimmed and climate is adjusted for sleep." };
    if (t.match(/\b(away|leaving|empty|nobody home)\b/)) return { reply: "Away mode armed. Security sensors are active and non-critical power is cut." };
    if (t.match(/\b(eco|saver|save energy|green|low power)\b/)) return { reply: "Energy saver activated. Optimizing consumption across the house." };
    if (t.match(/\b(emergency|red alert|shutdown|lockdown)\b/)) return { reply: "Emergency protocol initiated! All non-critical systems offline." };
    
    if (t.match(/\ball( the)? off\b/) || t.match(/\bturn( everything)? off\b/) || t.match(/\bpower( everything)? down\b/)) return { reply: "All non-critical devices have been successfully turned off." };
    if (t.match(/\ball( the)? on\b/) || t.match(/\bturn( everything)? on\b/) || t.match(/\bpower( everything)? up\b/)) return { reply: "All standard devices have been turned on." };
    
    // Check specific devices
    if (t.match(/\b(ac|air con|air conditioning|cooler|heater)\b/)) return { reply: "I've adjusted the climate control for you." };
    if (t.match(/\b(light|lights|lamp|bulb|illumination)\b/)) return { reply: "I've adjusted the lighting as requested." };
    if (t.match(/\b(fan|blower)\b/)) return { reply: "Fan settings have been updated." };
    if (t.match(/\b(tv|television|screen|display)\b/)) return { reply: "TV power toggled." };
    if (t.match(/\b(plug|socket|outlet|power)\b/)) return { reply: "Smart plug toggled." };
    
    return { reply: "Command executed successfully." };
  }

  // Fallback Catch-all
  const fallbacks = [
    "I'm not exactly sure how to handle that command yet. Try asking me to turn off the lights or set the AC to 22.",
    "Sorry, I couldn't process that intent. You can ask me for a status report or tell me to activate Night mode.",
    "I'm still learning! Could you rephrase that? (e.g. 'Turn off the living room TV')",
    "My local parsers didn't catch that. Want me to check the power consumption or activate Away mode instead?"
  ];
  return { reply: fallbacks[Math.floor(Math.random() * fallbacks.length)] };
}
