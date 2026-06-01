import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { toast } from "sonner";
import type { Automation, Device, FallbackTier, HomeState, LogEntry, Member, Role } from "./types";

const STORAGE_KEY = "elly-home-state-v1";

const rooms = [
  { id: "living", name: "Living Room" },
  { id: "kitchen", name: "Kitchen" },
  { id: "bedroom", name: "Bedroom" },
  { id: "office", name: "Office" },
];

const seedDevices: Device[] = [
  {
    id: "ELLY-LT-01",
    name: "Ceiling Lights",
    type: "light",
    roomId: "living",
    on: true,
    online: true,
    watts: 28,
    brightness: 80,
    colorTemp: 4000,
  },
  {
    id: "ELLY-LT-02",
    name: "Floor Lamp",
    type: "light",
    roomId: "living",
    on: false,
    online: true,
    watts: 12,
    brightness: 60,
    colorTemp: 3000,
  },
  {
    id: "ELLY-AC-01",
    name: "Living AC",
    type: "ac",
    roomId: "living",
    on: true,
    online: true,
    watts: 1100,
    temperature: 24,
    fanSpeed: 2,
    mode: "Cool",
  },
  {
    id: "ELLY-PL-01",
    name: "TV Smart Plug",
    type: "plug",
    roomId: "living",
    on: true,
    online: true,
    watts: 95,
  },
  {
    id: "ELLY-LT-03",
    name: "Kitchen Lights",
    type: "light",
    roomId: "kitchen",
    on: true,
    online: true,
    watts: 22,
    brightness: 100,
    colorTemp: 5000,
  },
  {
    id: "ELLY-FR-01",
    name: "Refrigerator",
    type: "fridge",
    roomId: "kitchen",
    on: true,
    online: true,
    watts: 150,
  },
  {
    id: "ELLY-AP-01",
    name: "Coffee Maker",
    type: "appliance",
    roomId: "kitchen",
    on: false,
    online: true,
    watts: 800,
  },
  {
    id: "ELLY-SN-01",
    name: "Door Sensor",
    type: "sensor",
    roomId: "kitchen",
    on: true,
    online: true,
    watts: 1,
  },
  {
    id: "ELLY-AC-02",
    name: "Bedroom AC",
    type: "ac",
    roomId: "bedroom",
    on: false,
    online: true,
    watts: 950,
    temperature: 23,
    fanSpeed: 1,
    mode: "Cool",
  },
  {
    id: "ELLY-LT-04",
    name: "Bedside Lights",
    type: "light",
    roomId: "bedroom",
    on: false,
    online: true,
    watts: 9,
    brightness: 40,
    colorTemp: 2700,
  },
  {
    id: "ELLY-FN-01",
    name: "Ceiling Fan",
    type: "fan",
    roomId: "bedroom",
    on: true,
    online: true,
    watts: 55,
    fanSpeed: 2,
  },
  {
    id: "ELLY-SN-02",
    name: "Motion Sensor",
    type: "sensor",
    roomId: "bedroom",
    on: true,
    online: true,
    watts: 1,
  },
  {
    id: "ELLY-LT-05",
    name: "Desk Light",
    type: "light",
    roomId: "office",
    on: true,
    online: true,
    watts: 15,
    brightness: 90,
    colorTemp: 5500,
  },
  {
    id: "ELLY-PL-02",
    name: "Workstation Plug",
    type: "plug",
    roomId: "office",
    on: true,
    online: true,
    watts: 210,
  },
  {
    id: "ELLY-WPT-01",
    name: "Wireless Power Transmitter",
    type: "wpt",
    roomId: "office",
    on: true,
    online: true,
    watts: 320,
    output: 65,
    thermal: 38,
  },
  {
    id: "ELLY-SN-03",
    name: "Temperature Sensor",
    type: "sensor",
    roomId: "office",
    on: true,
    online: false,
    watts: 1,
  },
];

const seedAutomations: Automation[] = [
  {
    id: "au-1",
    name: "Auto Lights Off",
    type: "presence",
    description: "If no motion detected for 20 minutes → turn off lights.",
    enabled: true,
  },
  {
    id: "au-2",
    name: "Goodnight Routine",
    type: "time",
    description: "At 11:00 PM → dim bedroom lights and lower AC.",
    enabled: true,
  },
  {
    id: "au-3",
    name: "Energy Guard",
    type: "energy",
    description: "If total usage exceeds 3 kW → notify and pause non-critical plugs.",
    enabled: false,
  },
  {
    id: "au-4",
    name: "Open Door Alert",
    type: "sensor",
    description: "When door sensor opens while Away Mode is on → send alert.",
    enabled: true,
  },
];

const seedFallback: FallbackTier[] = [
  {
    key: "lan",
    label: "Primary",
    path: "Local LAN / MQTT",
    scenario: "Direct high-speed local control. Zero internet dependency.",
    status: "active",
  },
  {
    key: "ble",
    label: "Fallback 1",
    path: "Bluetooth Low Energy",
    scenario: "If Wi-Fi router crashes, control nearby critical devices over BLE.",
    status: "standby",
  },
  {
    key: "cloud",
    label: "Fallback 2",
    path: "Vendor Cloud API",
    scenario: "Last resort polling of official cloud API if local API is lost.",
    status: "standby",
  },
];

const seedMembers: Member[] = [
  {
    id: "m-1",
    name: "Sarah Mitchell",
    role: "family",
    scope: "all",
    roomIds: [],
    deviceIds: [],
    note: "Full home access",
  },
  {
    id: "m-2",
    name: "Baby Noah",
    role: "family",
    scope: "devices",
    roomIds: [],
    deviceIds: ["ELLY-LT-04", "ELLY-FN-01"],
    note: "Nursery only, bedside light & fan",
  },
  {
    id: "m-3",
    name: "Liam (Guest)",
    role: "guest",
    scope: "rooms",
    roomIds: ["living"],
    deviceIds: [],
    note: "Living room access during stay",
  },
  {
    id: "m-4",
    name: "Emma (Guest)",
    role: "guest",
    scope: "rooms",
    roomIds: ["kitchen", "living"],
    deviceIds: [],
    note: "Kitchen & living room",
  },
];

function seedState(): HomeState {
  return {
    rooms,
    devices: seedDevices,
    automations: seedAutomations,
    role: "owner",
    cameraEnabled: false,
    cameraPrivacy: true,
    cameraMotionAlerts: true,
    cameraRecording: false,
    fallback: seedFallback,
    members: seedMembers,
    logs: [
      {
        id: "initial-log-0",
        time: "System Start",
        source: "system",
        text: "ELLY Home Automation online. 16 devices registered.",
      },
    ],
  };
}

function timeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function log(text: string, source: LogEntry["source"]): LogEntry {
  return { id: Math.random().toString(36).slice(2), time: timeNow(), source, text };
}

type Action =
  | { type: "TOGGLE_DEVICE"; id: string }
  | { type: "UPDATE_DEVICE"; id: string; patch: Partial<Device> }
  | { type: "ALL_OFF" }
  | { type: "ALL_ON" }
  | { type: "NIGHT_MODE" }
  | { type: "AWAY_MODE" }
  | { type: "ENERGY_SAVER" }
  | { type: "EMERGENCY" }
  | { type: "TOGGLE_AUTOMATION"; id: string }
  | { type: "ADD_AUTOMATION"; automation: Automation }
  | { type: "SET_ROLE"; role: Role }
  | {
      type: "PATCH_CAMERA";
      patch: Partial<
        Pick<
          HomeState,
          "cameraEnabled" | "cameraPrivacy" | "cameraMotionAlerts" | "cameraRecording"
        >
      >;
    }
  | { type: "FAILOVER"; key: string }
  | { type: "RESTORE_NETWORK" }
  | { type: "ADD_MEMBER"; member: Member }
  | { type: "UPDATE_MEMBER"; id: string; patch: Partial<Member> }
  | { type: "REMOVE_MEMBER"; id: string }
  | { type: "LOG"; entry: LogEntry }
  | { type: "HYDRATE"; state: HomeState };

function pushLog(state: HomeState, entry: LogEntry): HomeState {
  return { ...state, logs: [entry, ...state.logs].slice(0, 60) };
}

function reducer(state: HomeState, action: Action): HomeState {
  switch (action.type) {
    case "TOGGLE_DEVICE": {
      const d = state.devices.find((x) => x.id === action.id);
      if (!d) return state;
      const devices = state.devices.map((x) => (x.id === action.id ? { ...x, on: !x.on } : x));
      return pushLog(
        { ...state, devices },
        log(`${d.name} turned ${!d.on ? "ON" : "OFF"}`, "manual"),
      );
    }
    case "UPDATE_DEVICE": {
      const devices = state.devices.map((x) =>
        x.id === action.id ? { ...x, ...action.patch } : x,
      );
      return { ...state, devices };
    }
    case "ALL_OFF": {
      const devices = state.devices.map((x) =>
        x.type === "sensor" || x.type === "fridge" ? x : { ...x, on: false },
      );
      return pushLog(
        { ...state, devices },
        log("Turn Off All, non-critical devices powered down", "manual"),
      );
    }
    case "ALL_ON": {
      const devices = state.devices.map((x) => (x.type === "sensor" ? x : { ...x, on: true }));
      return pushLog({ ...state, devices }, log("Turn On All, devices powered up", "manual"));
    }
    case "NIGHT_MODE": {
      const devices = state.devices.map((x) => {
        if (x.type === "light") return { ...x, on: x.roomId === "bedroom", brightness: 25 };
        if (x.type === "ac") return { ...x, temperature: 24 };
        return x;
      });
      return pushLog({ ...state, devices }, log("Night Mode activated", "manual"));
    }
    case "AWAY_MODE": {
      const devices = state.devices.map((x) =>
        x.type === "sensor" || x.type === "fridge" ? x : { ...x, on: false },
      );
      return pushLog(
        { ...state, devices, cameraEnabled: true, cameraPrivacy: false, cameraMotionAlerts: true },
        log("Away Mode activated, security armed", "manual"),
      );
    }
    case "ENERGY_SAVER": {
      const devices = state.devices.map((x) => {
        if (x.type === "light") return { ...x, brightness: Math.min(x.brightness ?? 60, 50) };
        if (x.type === "ac") return { ...x, temperature: Math.max(x.temperature ?? 24, 26) };
        if (x.type === "plug" && x.name.toLowerCase().includes("tv")) return { ...x, on: false };
        return x;
      });
      return pushLog({ ...state, devices }, log("Energy Saver Mode applied", "manual"));
    }
    case "EMERGENCY": {
      const devices = state.devices.map((x) => (x.type === "fridge" ? x : { ...x, on: false }));
      return pushLog(
        { ...state, devices },
        log("EMERGENCY SHUTDOWN executed, power cut to all non-critical devices", "system"),
      );
    }
    case "TOGGLE_AUTOMATION": {
      const a = state.automations.find((x) => x.id === action.id);
      const automations = state.automations.map((x) =>
        x.id === action.id ? { ...x, enabled: !x.enabled } : x,
      );
      return pushLog(
        { ...state, automations },
        log(`Automation "${a?.name}" ${a?.enabled ? "disabled" : "enabled"}`, "manual"),
      );
    }
    case "ADD_AUTOMATION":
      return pushLog(
        { ...state, automations: [action.automation, ...state.automations] },
        log(`Automation "${action.automation.name}" created`, "manual"),
      );
    case "SET_ROLE":
      return pushLog(
        { ...state, role: action.role },
        log(`Active role switched to ${action.role}`, "system"),
      );
    case "PATCH_CAMERA":
      return { ...state, ...action.patch };
    case "FAILOVER": {
      const idx = state.fallback.findIndex((f) => f.key === action.key);
      const fallback = state.fallback.map((f, i) => {
        if (i < idx) return { ...f, status: "down" as const };
        if (i === idx) return { ...f, status: "active" as const };
        return { ...f, status: "standby" as const };
      });
      const tier = state.fallback[idx];
      return pushLog({ ...state, fallback }, log(`Failover → routing via ${tier?.path}`, "system"));
    }
    case "RESTORE_NETWORK": {
      const fallback = state.fallback.map((f, i) => ({
        ...f,
        status: (i === 0 ? "active" : "standby") as FallbackTier["status"],
      }));
      return pushLog(
        { ...state, fallback },
        log("Network restored, primary local route re-established", "system"),
      );
    }
    case "ADD_MEMBER":
      return pushLog(
        { ...state, members: [action.member, ...state.members] },
        log(`Member "${action.member.name}" added (${action.member.role})`, "manual"),
      );
    case "UPDATE_MEMBER": {
      const members = state.members.map((m) =>
        m.id === action.id ? { ...m, ...action.patch } : m,
      );
      return pushLog({ ...state, members }, log(`Member access updated`, "manual"));
    }
    case "REMOVE_MEMBER": {
      const m = state.members.find((x) => x.id === action.id);
      return pushLog(
        { ...state, members: state.members.filter((x) => x.id !== action.id) },
        log(`Member "${m?.name}" removed`, "manual"),
      );
    }
    case "LOG":
      return pushLog(state, action.entry);
    case "HYDRATE":
      return action.state;
    default:
      return state;
  }
}

interface Ctx {
  state: HomeState;
  dispatch: React.Dispatch<Action>;
  totalWatts: number;
  activeCount: number;
  alerts: string[];
  canEdit: boolean;
  runVoiceCommand: (text: string, opts?: { silent?: boolean }) => boolean;
}

const HomeContext = createContext<Ctx | null>(null);

import { useState } from "react";

export function HomeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, seedState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dispatch({ type: "HYDRATE", state: { ...seedState(), ...JSON.parse(raw) } });
      }
    } catch {
      /* ignore */
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, isHydrated]);

  const totalWatts = useMemo(
    () => state.devices.filter((d) => d.on).reduce((s, d) => s + d.watts, 0),
    [state.devices],
  );
  const activeCount = useMemo(() => state.devices.filter((d) => d.on).length, [state.devices]);

  const alerts = useMemo(() => {
    const a: string[] = [];
    state.devices.forEach((d) => {
      if (!d.online) a.push(`${d.name} is offline`);
      if (d.type === "wpt" && (d.thermal ?? 0) > 55)
        a.push(`${d.name} thermal warning (${d.thermal}°C)`);
    });
    if (totalWatts > 3000) a.push(`High total load: ${(totalWatts / 1000).toFixed(2)} kW`);
    return a;
  }, [state.devices, totalWatts]);

  const canEdit = state.role !== "guest";

  const runVoiceCommand = (text: string, opts?: { silent?: boolean }): boolean => {
    const t = text.toLowerCase().trim();
    if (!t) return false;
    if (!opts?.silent) dispatch({ type: "LOG", entry: log(`🎙️ "${text}"`, "voice") });

    if (t.includes("emergency")) {
      toast.warning("High-risk command, confirm Emergency Shutdown from the dashboard.");
      return true;
    }
    if (t.includes("energy") && t.includes("saver")) {
      dispatch({ type: "ENERGY_SAVER" });
      toast.success("ELLY: Energy Saver Mode activated.");
      return true;
    }
    if (t.includes("night")) {
      dispatch({ type: "NIGHT_MODE" });
      toast.success("ELLY: Night Mode activated.");
      return true;
    }
    if (t.includes("away")) {
      dispatch({ type: "AWAY_MODE" });
      toast.success("ELLY: Away Mode activated.");
      return true;
    }

    const wantsOff = /\b(off|shut|disable|power down|deactivate)\b/.test(t);
    const wantsOn = !wantsOff && /\b(on|enable|power up|start|activate|switch on)\b/.test(t);

    // Set AC / temperature
    const tempMatch = t.match(/(\d{2})\s*(?:degree|degrees|°|c)?/);
    if (
      t.includes("ac") ||
      t.includes("temperature") ||
      t.includes("degree") ||
      t.includes("air con")
    ) {
      const room = state.rooms.find((r) => t.includes(r.name.toLowerCase().split(" ")[0]));
      const ac = state.devices.find((d) => d.type === "ac" && (!room || d.roomId === room.id));
      if (ac && tempMatch) {
        const temp = parseInt(tempMatch[1], 10);
        dispatch({ type: "UPDATE_DEVICE", id: ac.id, patch: { temperature: temp, on: true } });
        dispatch({ type: "LOG", entry: log(`${ac.name} set to ${temp}°C`, "voice") });
        toast.success(`ELLY: ${ac.name} set to ${temp}°C.`);
        return true;
      }
    }

    if (wantsOn || wantsOff) {
      const hasAll = t.includes("all") || t.includes("everything");
      const typeWord: Device["type"] | null = t.includes("light")
        ? "light"
        : t.includes("ac") || t.includes("air con")
          ? "ac"
          : t.includes("fan")
            ? "fan"
            : t.includes("fridge") || t.includes("refriger")
              ? "fridge"
              : t.includes("plug") || t.includes("tv")
                ? "plug"
                : null;
      const room = state.rooms.find((r) => t.includes(r.name.toLowerCase().split(" ")[0]));

      // "turn on/off everything"
      if (hasAll && !typeWord && !room) {
        dispatch({ type: wantsOn ? "ALL_ON" : "ALL_OFF" });
        toast.success(`ELLY: All devices turned ${wantsOn ? "on" : "off"}.`);
        return true;
      }

      let targets = state.devices.filter((d) => d.type !== "sensor");
      if (typeWord) targets = targets.filter((d) => d.type === typeWord);
      if (room) targets = targets.filter((d) => d.roomId === room.id);

      // try matching a specific device by name when nothing else matched
      if (!typeWord && !room) {
        targets = state.devices.filter((d) =>
          d.name
            .toLowerCase()
            .split(/\s+/)
            .some((w) => w.length > 2 && t.includes(w)),
        );
      }

      if (targets.length > 0) {
        targets.forEach((d) =>
          dispatch({ type: "UPDATE_DEVICE", id: d.id, patch: { on: wantsOn } }),
        );
        const scope =
          targets.length === 1
            ? targets[0].name
            : `${targets.length} ${typeWord ? typeWord + "s" : "devices"}${room ? ` in ${room.name}` : ""}`;
        dispatch({ type: "LOG", entry: log(`${scope} turned ${wantsOn ? "ON" : "OFF"}`, "voice") });
        toast.success(`ELLY: ${scope} turned ${wantsOn ? "on" : "off"}.`);
        return true;
      }
    }

    if (!opts?.silent) {
      toast.error("ELLY: Sorry, I couldn't map that command to a device.");
      dispatch({ type: "LOG", entry: log("Intent unresolved, no matching device", "system") });
    }
    return false;
  };

  const value: Ctx = { state, dispatch, totalWatts, activeCount, alerts, canEdit, runVoiceCommand };
  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

export function useHome() {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error("useHome must be used within HomeProvider");
  return ctx;
}
