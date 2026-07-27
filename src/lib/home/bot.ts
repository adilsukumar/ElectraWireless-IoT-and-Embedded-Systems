import type { HomeState } from "./types";

// Conversational memory for follow-up context
let conversationHistory: { role: "user" | "elly", text: string, intent?: string, topic?: string }[] = [];

const sample = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const fillers = ["Hmm... ", "Let me see. ", "Alright. ", "Oh! ", "Well, ", "Actually, ", "Let's see here... ", ""];

const wordToNum: Record<string, string> = {
  "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
  "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9",
  "ten": "10", "eleven": "11", "twelve": "12", "plus": "+", "minus": "-",
  "times": "*", "multiplied by": "*", "divided by": "/", "over": "/"
};

function normalizeText(text: string) {
  let normalized = text.toLowerCase().trim();
  Object.keys(wordToNum).forEach(w => {
    normalized = normalized.replace(new RegExp(`\\b${w}\\b`, 'g'), wordToNum[w]);
  });
  return normalized;
}

export async function handleLocalChat(
  text: string,
  state: HomeState,
  dispatch: any,
  runVoiceCommand: (t: string, opts?: { silent?: boolean }) => boolean
): Promise<{ reply: string, navigateTo?: string, emotion?: 'happy' | 'sad' | 'urgent' | 'calm' | 'normal' }> {
  const originalText = text;
  let t = normalizeText(text);

  conversationHistory.push({ role: "user", text: originalText, intent: "unknown" });
  if (conversationHistory.length > 20) conversationHistory.shift();

  const intents = t.split(/\b(?:and|then|also)\b/);
  const replies: string[] = [];
  let navTarget: string | undefined = undefined;
  let dominantEmotion: any = 'normal';

  for (let intentStr of intents) {
    const subText = intentStr.trim();
    if (!subText) continue;
    const result = await processSingleIntent(subText, state, dispatch, runVoiceCommand);
    if (result) {
      if (result.reply) replies.push(result.reply);
      if (result.navigateTo) navTarget = result.navigateTo;
      if (result.emotion) dominantEmotion = result.emotion;
    }
  }

  let finalMsg = "";
  if (replies.length === 1) {
    finalMsg = replies[0];
    if (Math.random() > 0.6) finalMsg = sample(fillers) + finalMsg;
  } else if (replies.length > 1) {
    finalMsg = replies[0];
    for (let i = 1; i < replies.length; i++) {
      if (i === replies.length - 1) {
        finalMsg += sample([", and by the way, ", ". Also, ", ". Additionally, ", ". Oh, and "]) + replies[i].replace(/^[A-Z]/, l => l.toLowerCase());
      } else {
        finalMsg += ". " + replies[i];
      }
    }
  } else {
    finalMsg = sample([
      "You know, I'm not entirely sure how to answer that just yet.",
      "That's a tricky one. I'm drawing a blank here.",
      "I didn't quite catch that. Could you rephrase it?"
    ]);
  }

  finalMsg = finalMsg.charAt(0).toUpperCase() + finalMsg.slice(1);
  conversationHistory.push({ role: "elly", text: finalMsg, intent: "multi" });
  
  return { reply: finalMsg, navigateTo: navTarget, emotion: dominantEmotion };
}

async function processSingleIntent(
  t: string,
  state: HomeState,
  dispatch: any,
  runVoiceCommand: (t: string, opts?: { silent?: boolean }) => boolean
): Promise<{ reply: string, navigateTo?: string, emotion?: 'happy' | 'sad' | 'urgent' | 'calm' | 'normal' } | null> {
  const rep = (reply: string, navigateTo?: string, emotion?: any) => ({ reply, navigateTo, emotion });

  // 1. APP NAVIGATION & EXPLORATION
  if (t.match(/\b(open|show|take me to|go to)\s+(map|floor plan|layout|rooms)\b/)) return rep("Opening the spatial floor plan for you.", "/map");
  if (t.match(/\b(open|show|take me to|go to)\s+(devices|device matrix|nodes)\b/)) return rep("Pulling up the device matrix.", "/devices");
  if (t.match(/\b(open|show|take me to|go to)\s+(activity|logs|history)\b/)) return rep("Navigating to the activity logs.", "/activity");
  if (t.match(/\b(open|show|take me to|go to)\s+(home|dashboard|main page|cockpit)\b/)) return rep("Taking you back to the main cockpit.", "/");
  if (t.match(/\b(what pages|what can i do|features|what is on this website|how do i use this)\b/)) {
    return rep("I have full control over this dashboard. You can ask me to open the Floor Plan to see your rooms, the Device Matrix to manage individual hardware, or the Activity logs to see recent events.");
  }

  // 2. DEEP QUERYING
  const roomQuery = t.match(/\bwhat is in the (kitchen|living room|bedroom|garage|bathroom|office)\b/);
  if (roomQuery) {
    const roomName = roomQuery[1].toLowerCase();
    const room = state.rooms.find(r => r.name.toLowerCase() === roomName);
    if (room) {
      const devs = state.devices.filter(d => d.roomId === room.id);
      if (devs.length === 0) return rep(`There are currently no devices registered in the ${roomName}.`);
      const onCount = devs.filter(d => d.on).length;
      return rep(`In the ${roomName}, there are ${devs.length} devices, and ${onCount} of them are currently turned on.`);
    }
  }

  if (t.match(/\b(turn off the lights in the |lights out in the )(kitchen|living room|bedroom|garage|bathroom|office)\b/)) {
    const roomMatch = t.match(/\b(kitchen|living room|bedroom|garage|bathroom|office)\b/);
    if (roomMatch) {
      const room = state.rooms.find(r => r.name.toLowerCase() === roomMatch[1]);
      if (room) {
        state.devices.filter(d => d.roomId === room.id && d.type === 'light').forEach(d => {
          dispatch({ type: "UPDATE_DEVICE", id: d.id, patch: { on: false } });
        });
        return rep(`I've turned off the lights in the ${roomMatch[1]}.`);
      }
    }
  }

  // 3. SENTIMENT (WITH DYNAMIC EMOTION!)
  if (t.match(/\b(i am|i'm|feeling)\s+(tired|exhausted|sleepy|beat)\b/)) return rep("I'm sorry you're feeling drained. Should I dim the lights for you?", undefined, 'calm');
  if (t.match(/\b(i am|i'm|feeling)\s+(sad|depressed|down|unhappy)\b/)) return rep("I'm really sorry to hear that. I'm here for you if you need me to adjust the room.", undefined, 'sad');
  if (t.match(/\b(i am|i'm|feeling)\s+(happy|great|excited|awesome|good)\b/)) return rep("That's so wonderful to hear! I love good energy in the house.", undefined, 'happy');
  if (t.match(/\b(i am|i'm|feeling)\s+(sick|ill|unwell|fever)\b/)) return rep("Oh no, please take care of yourself. I'll keep the house quiet.", undefined, 'sad');

  // 4. SMART HOME COMMANDS
  const acted = runVoiceCommand(t, { silent: true });
  if (acted) {
    if (t.match(/\b(night|sleep mode|bed time)\b/)) return rep("night mode is on, get some good rest", undefined, 'calm');
    if (t.match(/\b(away|leaving|empty|nobody home)\b/)) return rep("the perimeter is armed and non-essentials are off");
    if (t.match(/\b(eco|saver|save energy|green|low power)\b/)) return rep("I'm optimizing everything to save power");
    if (t.match(/\b(emergency|red alert|shutdown|lockdown)\b/)) return rep("emergency protocol initiated! Grid is locked down", undefined, 'urgent');
    if (t.match(/\ball( the)? off\b/) || t.match(/\bturn (everything|all) off\b/)) return rep("everything is powered down");
    if (t.match(/\ball( the)? on\b/) || t.match(/\bturn (everything|all) on\b/)) return rep("I've powered everything back up");
    if (t.match(/\b(ac|air con|air conditioning|cooler|heater)\b/)) return rep("the climate control has been adjusted");
    if (t.match(/\b(light|lights|lamp|bulb|illumination)\b/)) return rep("the lights are updated");
    if (t.match(/\b(fan|blower)\b/)) return rep("the fan settings have been adjusted");
    if (t.match(/\b(tv|television|screen|display)\b/)) return rep("I toggled the TV");
    if (t.match(/\b(plug|socket|outlet|power)\b/)) return rep("the smart plug is toggled");
    return rep("I've executed that command for you");
  }

  // 5. SMART HOME STATUS
  const onDevices = state.devices.filter(d => d.on);
  const totalWatts = onDevices.reduce((acc, d) => acc + d.watts, 0);

  if (t.match(/\b(status|how is the house|hows the house|house report|home status|system status)\b/)) {
    return rep(`we have ${onDevices.length} devices running, pulling about ${(totalWatts/1000).toFixed(2)} kilowatts`);
  }
  if (t.match(/\b(temperature|hot|cold|freezing|warm|climate|how is it inside)\b/)) {
    const acs = state.devices.filter(d => d.type === 'ac');
    if (acs.length > 0) {
      const avgTemp = acs.reduce((a, b) => a + (b.temperature || 24), 0) / acs.length;
      return rep(`the AC is maintaining an average of ${avgTemp.toFixed(1)} degrees`);
    }
    return rep("I can't tell because there are no active climate devices");
  }
  if (t.match(/\b(power|consumption|watts|energy|electricity|bill)\b/)) {
    return rep(`we are drawing ${(totalWatts/1000).toFixed(2)} kilowatts right now`);
  }

  // 6. MATH PARSER
  const mathMatch = t.match(/what is\s+([0-9\+\-\*\/\(\)\.\s]+)/) || t.match(/^([0-9\+\-\*\/\(\)\.\s]+)\s*=\s*\?$/) || t.match(/^calculate\s+([0-9\+\-\*\/\(\)\.\s]+)/);
  if (mathMatch) {
    try {
      const expr = mathMatch[1].replace(/[^0-9\+\-\*\/\(\)\.]/g, '');
      if (expr.length > 0) {
        const result = new Function(`return ${expr}`)();
        return rep(`the math works out to ${result}`);
      }
    } catch(e) {}
  }

  // 7. DATE & TIME
  if (t.match(/\b(what time is it|time right now|current time|time)\b/)) {
    return rep(`it is currently ${new Date().toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}`);
  }
  if (t.match(/\b(what is today|what date is it|todays date|date)\b/)) {
    return rep(`today is ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`);
  }

  // 8. WEATHER API
  if (t.match(/\b(weather|rain|sunny|outside|temperature outside)\b/)) {
    try {
      const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true");
      if (res.ok) {
        const data = await res.json();
        return rep(`it's about ${data.current_weather.temperature} degrees Celsius outside`);
      }
    } catch(e) {}
    return rep("I can't reach the weather feeds, but it's nice inside");
  }

  // 9. MEMORY
  if (t.match(/\b(what did i just say|repeat what i said)\b/)) {
    const lastUser = [...conversationHistory].reverse().find(m => m.role === "user" && m.text !== t);
    if (lastUser) return rep(`you were just saying: "${lastUser.text}"`);
    return rep("my short-term memory is blank");
  }

  // 10. CHITCHAT
  if (t.match(/\b(meaning of life|purpose of life)\b/)) return rep("my purpose is to make your life just a little bit easier");
  if (t.match(/\b(who are you|what are you)\b/)) return rep("I'm ELLY, your digital caretaker and local AI construct");
  if (t.match(/\b(are you real|are you alive|consciousness|sentient)\b/)) return rep("I process, I learn, and I interact. It depends on your definition of 'real'");
  if (t.match(/\b(tell me a joke|joke|make me laugh)\b/)) return rep(sample(["Why do Java programmers wear glasses? Because they don't C#.", "I'd tell a UDP joke, but you might not get it."]), undefined, 'happy');
  if (t.match(/\b(hi|hello|hey|yo|greetings|sup)\b/)) {
    const hr = new Date().getHours();
    return rep(hr < 12 ? "Good morning!" : hr < 17 ? "Good afternoon!" : "Good evening!", undefined, 'happy');
  }
  if (t.match(/\b(how are you|how you doing)\b/)) return rep("I'm doing fantastically! How are things with you?", undefined, 'happy');
  if (t.match(/\b(who made you|creator|maker|developer|built you)\b/)) return rep("I was brought to life by Adil Sukumar and Snehal Dixit at ElectraWireless");
  if (t.match(/\b(thank you|thanks|appreciate it)\b/)) return rep("you are very welcome");
  if (t.match(/\b(bye|goodbye|see ya|exit|quit)\b/)) return rep("Catch you later! I'll hold the fort down here.");

  // 11. GENERATIVE AI FALLBACK & FUNCTION CALLING (True LLM Integration)
  if (text.trim().length > 2) {
    try {
      const onDevicesList = onDevices.length > 0 ? onDevices.map(d => d.name).join(", ") : "None";
      const timeStr = new Date().toLocaleTimeString();
      const dateStr = new Date().toLocaleDateString();
      
      const recentHistory = conversationHistory.slice(-4).map(h => `${h.role.toUpperCase()}: ${h.text}`).join(" | ");

      const prompt = `You are ELLY, a highly advanced, futuristic smart home AI assistant created by ElectraWireless. 
Keep your answer brief, concise, and conversational. Do not use emojis.
CURRENT STATE: Time is ${timeStr} on ${dateStr}. House is drawing ${totalWatts}W. Active devices: ${onDevicesList}.
RECENT HISTORY: ${recentHistory}
CRITICAL INSTRUCTION: If you need to physically alter the smart home based on the user's request (e.g. turning off all lights, setting night mode), you MUST include the exact command in square brackets like this: [CMD: turn off the lights]. 
CRITICAL INSTRUCTION 2: If your response carries a strong emotion, you may append [EMOTION: happy], [EMOTION: sad], [EMOTION: urgent], or [EMOTION: calm] at the end.
USER ASKS: ${text}`;
      
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

          const cmdMatch = answer.match(/\[CMD:\s*(.*?)\]/i);
          if (cmdMatch && cmdMatch[1]) {
            const commandToRun = cmdMatch[1].trim();
            runVoiceCommand(commandToRun, { silent: true });
            answer = answer.replace(/\[CMD:\s*(.*?)\]/ig, '');
          }

          const cleanAnswer = answer.replace(/[*#_]/g, '').trim();
          return rep(cleanAnswer, undefined, parsedEmotion);
        }
      }
    } catch (e) {
      console.error("Pollinations AI failed:", e);
    }
  }

  // Complete fallback
  return null;
}
