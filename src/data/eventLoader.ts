import rawEvents from "./events.json";
import type { City, EventFormat, HubEvent, HubEventPost } from "@/types";

// Validate that every city in the JSON matches our City union
function isValidCity(c: string): c is City {
  return [
    "Astana", "Almaty", "Shymkent", "Qostanai", "Pavlodar", "Semey",
    "Turkistan", "Taldykorgan", "Zhezkazgan", "Oskemen", "Petropavl", "Alatau",
  ].includes(c);
}

const posts: HubEventPost[] = (rawEvents as HubEventPost[]).filter((p) =>
  isValidCity(p.city)
);

/** Split the first line of the caption (used as a title). */
function extractTitle(caption: string): string {
  // Use the first non-empty line, but ignore emoji-only lines if next line is more meaningful
  const lines = caption
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return "Событие Astana Hub";
  // Pick first line that has at least 4 letters (skip pure emoji lines)
  const meaningful = lines.find((l) => /[A-Za-zА-Яа-яҰқғҮұІіЁёӨөҚқҒғ]{4,}/.test(l));
  return (meaningful ?? lines[0]).slice(0, 120);
}

/** Take the first paragraph (1–3 lines) of the caption as a short description. */
function extractDescription(caption: string): string {
  const lines = caption
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  // Skip the title line
  const body = lines.slice(1).join(" ");
  // Truncate to a reasonable card length
  return body.length > 320 ? body.slice(0, 320) + "…" : body;
}

/** Detect event format (online / offline / hybrid) from caption text. */
function detectFormat(caption: string): EventFormat {
  const lower = caption.toLowerCase();
  const online =
    lower.includes("онлайн") ||
    lower.includes("online") ||
    lower.includes("zoom") ||
    lower.includes("google meet") ||
    lower.includes("webinar") ||
    lower.includes("вебинар");
  const offline =
    lower.includes("офлайн") ||
    lower.includes("offline") ||
    lower.includes("📍") ||
    /\bкөшесі\b|\bкөше\b|\bулиц|\bhouse\b|\bhub\b|\bхаб\b/i.test(lower);
  if (online && offline) return "hybrid";
  if (online) return "online";
  return "offline";
}

/** Try to find an address-like fragment in the caption (street, hub address, etc.). */
function extractAddress(caption: string, city: City): string {
  // Look for "📍" or "Мекенжай" or "Адрес" or "Место"
  const lines = caption.split("\n");
  for (const l of lines) {
    const t = l.trim();
    if (
      /^(📍|📌|мекенжай|адрес|место|орны|орналасқан|хаб\b)/i.test(t)
    ) {
      return t.replace(/^(📍|📌)\s*/, "").slice(0, 140);
    }
  }
  // Fallback: Hub Instagram
  return `Astana Hub · ${city}`;
}

/** Format ISO date as "15 июня 2026". */
function formatDateRu(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function formatTimeRu(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function postToHubEvent(post: HubEventPost): HubEvent {
  return {
    id: post.id,
    city: post.city,
    username: post.username,
    hubUrl: post.hubUrl,
    url: post.url,
    title: extractTitle(post.caption),
    description: extractDescription(post.caption),
    format: detectFormat(post.caption),
    address: extractAddress(post.caption, post.city),
    date: formatDateRu(post.date),
    time: formatTimeRu(post.date),
  };
}

export function getAllEvents(): HubEvent[] {
  return posts.map(postToHubEvent);
}

export function getEventsByCity(city: City): HubEvent[] {
  return posts.filter((p) => p.city === city).map(postToHubEvent);
}

/** Aggregate caption text for all events of a city (used in the chat system prompt). */
export function getCityEventsContext(city: City, max = 15): string {
  return getEventsByCity(city)
    .slice(0, max)
    .map((e) => `- [${e.date}] ${e.title}\n  ${e.description.slice(0, 200)}`)
    .join("\n");
}
