import type { Event, TeamMember, City } from "@/types";

// Minimal mock for TeamMember only — events are now in events.json
export const mockTeam: Record<City, TeamMember[]> = {
  Astana: [
    { name: "Алишер Калиев", role: "Директор", contact: "@alisher_hub" },
    { name: "Дана Нурланова", role: "Менеджер", contact: "@dana_hub" },
  ],
  Almaty: [
    { name: "Команда Almaty Hub", role: "Hub Team", contact: "@almaty_hub" },
  ],
  Shymkent: [
    { name: "Команда Shymkent Hub", role: "Hub Team", contact: "@shymkent__hub" },
  ],
  Qostanai: [
    { name: "Дамир Мнайдаров", role: "Директор", contact: "@qostanai.hub" },
  ],
  Pavlodar: [
    { name: "Команда Pavlodar Hub", role: "Hub Team", contact: "@pavlodar.hub" },
  ],
  Semey: [
    { name: "Команда Semey Hub", role: "Hub Team", contact: "@semey.hub" },
  ],
  Turkistan: [
    { name: "Команда Turkistan Hub", role: "Hub Team", contact: "@turkistan.hub" },
  ],
  Taldykorgan: [
    { name: "Команда Jetisu Digital", role: "Hub Team", contact: "@jetisu_digital" },
  ],
  Zhezkazgan: [
    { name: "Алибек Каратаев", role: "Директор Ulytau Hub", contact: "@ulytau.hub" },
  ],
  Oskemen: [
    { name: "Команда Oskemen Hub", role: "Hub Team", contact: "@oskemen.hub" },
  ],
  Petropavl: [
    { name: "Команда SKO Hub", role: "Hub Team", contact: "@sko_hub" },
  ],
  Alatau: [
    { name: "Команда Alatau Hub", role: "Hub Team", contact: "@alatau.hub" },
  ],
};

// Empty placeholder so legacy imports still compile (events are now in events.json)
export const mockEvents: Record<City, Event[]> = {
  Astana: [], Almaty: [], Shymkent: [], Qostanai: [], Pavlodar: [],
  Semey: [], Turkistan: [], Taldykorgan: [], Zhezkazgan: [], Oskemen: [],
  Petropavl: [], Alatau: [],
};

export const cities: City[] = [
  "Astana", "Almaty", "Shymkent", "Qostanai", "Pavlodar", "Semey",
  "Turkistan", "Taldykorgan", "Zhezkazgan", "Oskemen", "Petropavl", "Alatau",
];
