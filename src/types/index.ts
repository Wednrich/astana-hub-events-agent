export type EventFormat = "offline" | "online" | "hybrid";

// Cities present in events.json (English names as keys; Russian labels are in CITY_LABELS)
export type City =
  | "Astana"
  | "Almaty"
  | "Shymkent"
  | "Qostanai"
  | "Pavlodar"
  | "Semey"
  | "Turkistan"
  | "Taldykorgan"
  | "Zhezkazgan"
  | "Oskemen"
  | "Petropavl"
  | "Alatau";

// Pretty labels (RU / KZ mix) for the UI
export const CITY_LABELS: Record<City, string> = {
  Astana: "Астана",
  Almaty: "Алматы",
  Shymkent: "Шымкент",
  Qostanai: "Костанай",
  Pavlodar: "Павлодар",
  Semey: "Семей",
  Turkistan: "Туркестан",
  Taldykorgan: "Талдыкорган",
  Zhezkazgan: "Жезказган",
  Oskemen: "Өскемен",
  Petropavl: "Петропавловск",
  Alatau: "Алатау",
};

// All known cities (used by header dropdown, etc.)
export const ALL_CITIES: City[] = Object.keys(CITY_LABELS) as City[];

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  format: EventFormat;
  address: string;
  description: string;
}

// Raw post from events.json (Instagram)
export interface HubEventPost {
  id: string;
  city: City;
  hubUrl: string;
  username: string;
  caption: string;
  date: string; // ISO date string
  url: string;
}

// UI-shape derived from HubEventPost (caption parsed → title/description/format/address/time)
export interface HubEvent {
  id: string;
  city: City;
  username: string;
  hubUrl: string;
  url: string;
  title: string;
  description: string;
  format: EventFormat;
  address: string;
  date: string; // ISO
  time: string; // human-friendly
}

export interface TeamMember {
  name: string;
  role: string;
  contact: string;
}

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp?: number;
}
