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
  | "Alatau"
  | "Oral"
  | "Aktau"
  | "Taraz"
  | "Atyrau";

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
  Oral: "Орал",
  Aktau: "Актау",
  Taraz: "Тараз",
  Atyrau: "Атырау",
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

// --- Types for SearchService (staff.json structure) ---

/** A single staff member in the central team */
export interface StaffMember {
  name: string;
  position: string;
  email: string;
}

/** A regional hub entry (with optional leader info) */
export interface RegionalHub {
  hub_name: string;
  category: string;
  title: string | null;
  leader: {
    name: string;
    position: string;
    contact_or_social: string | null;
  } | null;
}

/** The top-level shape of staff.json */
export interface StaffData {
  astana_hub_central: {
    organization: string;
    mission: string;
    team: StaffMember[];
  };
  regional_hubs_and_partners: RegionalHub[];
}

/** An Instagram post from the scraper dataset */
export interface InstagramPost {
  id: string;
  city?: string;
  hubUrl?: string;
  username?: string;
  caption?: string;
  date?: string;
  url?: string;
  [key: string]: unknown; // allow extra fields from the dataset
}