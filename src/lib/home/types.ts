export type DeviceType =
  | "light"
  | "plug"
  | "ac"
  | "fan"
  | "fridge"
  | "appliance"
  | "sensor"
  | "tv"
  | "wpt"; // wireless power transmitter

export type Role = "owner" | "family" | "guest";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  roomId: string;
  on: boolean;
  online: boolean;
  watts: number; // current draw when on
  // optional per-type state
  brightness?: number; // 0-100
  colorTemp?: number; // 2700-6500
  temperature?: number; // ac target C
  fanSpeed?: number; // 0-3
  mode?: string;
  output?: number; // wpt 0-100
  thermal?: number; // celsius
  assignedRoles?: Role[];
}

export interface Room {
  id: string;
  name: string;
}

export interface Automation {
  id: string;
  name: string;
  type: "time" | "condition" | "sensor" | "energy" | "presence";
  description: string;
  enabled: boolean;
}

export interface LogEntry {
  id: string;
  time: string;
  source: "manual" | "voice" | "system";
  text: string;
}

export type AccessScope = "all" | "rooms" | "devices";

export interface Member {
  id: string;
  name: string;
  role: Exclude<Role, "owner"> | "family" | "guest";
  scope: AccessScope; // all = full access, rooms = only listed rooms, devices = only listed devices
  roomIds: string[];
  deviceIds: string[];
  note?: string;
}

export type FallbackStatus = "active" | "standby" | "down";

export interface FallbackTier {
  key: string;
  label: string;
  path: string;
  scenario: string;
  status: FallbackStatus;
}

export interface HomeState {
  rooms: Room[];
  devices: Device[];
  automations: Automation[];
  logs: LogEntry[];
  role: Role;
  cameraEnabled: boolean;
  cameraPrivacy: boolean;
  cameraMotionAlerts: boolean;
  cameraRecording: boolean;
  fallback: FallbackTier[];
  members: Member[];
}
