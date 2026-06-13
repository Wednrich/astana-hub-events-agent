import type { Event, TeamMember, City } from "@/types";
import * as fs from "fs";
import * as path from "path";

interface StaffMember {
  name: string;
  position: string;
  email: string;
}

interface RegionalHub {
  hub_name: string;
  category: string;
  title: string | null;
  leader: {
    name: string;
    position: string;
    contact_or_social: string | null;
  } | null;
}

interface StaffData {
  astana_hub_central: {
    organization: string;
    mission: string;
    team: StaffMember[];
  };
  regional_hubs_and_partners: RegionalHub[];
}

// Map regional hub names to City enum
const HUB_TO_CITY: Record<string, City> = {
  "Astana": "Astana",
  "Almaty Hub": "Almaty",
  "Shymkent Hub": "Shymkent",
  "Qostanai IT Hub": "Qostanai",
  "Pavlodar Hub": "Pavlodar",
  "Semey": "Semey",
  "Turkistan Hub": "Turkistan",
  "Jetisu Digital": "Taldykorgan",
  "Ulytau Hub": "Zhezkazgan",
  "Oskemen Hub": "Oskemen",
  "SKO Hub": "Petropavl",
  "ALATAU HUB": "Alatau",
  "Zhambyl Hub": "Taraz", // Zhambyl hub, falls under Taraz/Zhambyl region
  "Aktau Hub": "Aktau",
  "Atyrau Hub": "Atyrau",
  "Taraz Hub": "Taraz",
  "Oral Hub": "Oral",
};

// Hub names that map to additional cities not in the City enum
const EXTRA_HUBS: string[] = [
  "AQMOLA HUB",    // Кокшетау
  "AQTOBE HUB",    // Актобе
  "Mangystau Hub", // Актау
  "Kyzylorda Hub", // Кызылорда
  "Terricon Valley", // Караганда
];

let _staffData: StaffData | null = null;

function getStaffData(): StaffData {
  if (!_staffData) {
    try {
      _staffData = JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), "src", "data", "staff.json"),
          "utf-8"
        )
      ) as StaffData;
    } catch {
      _staffData = {
        astana_hub_central: {
          organization: "Astana Hub",
          mission: "",
          team: [],
        },
        regional_hubs_and_partners: [],
      };
    }
  }
  return _staffData;
}

/**
 * Build mockTeam from real staff.json data.
 * Each known city gets its director/leader + all central team for Astana.
 */
export const mockTeam: Record<City, TeamMember[]> = buildMockTeam();

function buildMockTeam(): Record<City, TeamMember[]> {
  const data = getStaffData();
  const team: Record<City, TeamMember[]> = {
    Astana: [],
    Almaty: [],
    Shymkent: [],
    Qostanai: [],
    Pavlodar: [],
    Semey: [],
    Turkistan: [],
    Taldykorgan: [],
    Zhezkazgan: [],
    Oskemen: [],
    Petropavl: [],
    Alatau: [],
    Oral: [],
    Aktau: [],
    Taraz: [],
    Atyrau: [],
  };

  // Astana = central team (all 30+ people)
  for (const m of data.astana_hub_central.team) {
    team["Astana"].push({
      name: m.name,
      role: m.position,
      contact: m.email,
    });
  }

  // Regional hubs → fill each city
  for (const hub of data.regional_hubs_and_partners) {
    const city = HUB_TO_CITY[hub.hub_name];
    if (city && hub.leader) {
      team[city].push({
        name: hub.leader.name,
        role: hub.leader.position,
        contact: hub.leader.contact_or_social || "—",
      });
    }
  }

  return team;
}

// Empty placeholder so legacy imports still compile (events are now in events.json)
export const mockEvents: Record<City, Event[]> = {
  Astana: [], Almaty: [], Shymkent: [], Qostanai: [], Pavlodar: [],
  Semey: [], Turkistan: [], Taldykorgan: [], Zhezkazgan: [], Oskemen: [],
  Petropavl: [], Alatau: [], Oral: [], Aktau: [], Taraz: [], Atyrau: [],
};

export const cities: City[] = [
  "Astana", "Almaty", "Shymkent", "Qostanai", "Pavlodar", "Semey",
  "Turkistan", "Taldykorgan", "Zhezkazgan", "Oskemen", "Petropavl", "Alatau",
  "Oral", "Aktau", "Taraz", "Atyrau",
];
