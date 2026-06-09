import { NextRequest, NextResponse } from "next/server";
import type { City, HubEvent } from "@/types";
import { ALL_CITIES, CITY_LABELS } from "@/types";
import { getCityEventsContext, getEventsByCity } from "@/data/eventLoader";
import { mockTeam } from "@/data/mockData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RU_TO_CITY: Record<string, City> = {
  "астана": "Astana",
  "алматы": "Almaty",
  "шымкент": "Shymkent",
  "костанай": "Qostanai",
  "қостанай": "Qostanai",
  "павлодар": "Pavlodar",
  "семей": "Semey",
  "туркестан": "Turkistan",
  "талдыкорган": "Taldykorgan",
  "жезказган": "Zhezkazgan",
  "өскемен": "Oskemen",
  "усть-каменогорск": "Oskemen",
  "петропавловск": "Petropavl",
  "петропавл": "Petropavl",
  "алатау": "Alatau",
};

const EN_TO_CITY: Record<string, City> = Object.fromEntries(
  ALL_CITIES.map((c) => [c.toLowerCase(), c])
);

function detectCity(input: string, fallback: City): City {
  const lower = input.toLowerCase();
  for (const [key, city] of Object.entries(RU_TO_CITY)) {
    if (lower.includes(key)) return city;
  }
  for (const [key, city] of Object.entries(EN_TO_CITY)) {
    if (lower.includes(key)) return city;
  }
  return fallback;
}

function isValidCity(c: string): c is City {
  return (ALL_CITIES as string[]).includes(c);
}

type ChatBody = {
  message: string;
  city?: City;
  history?: { role: "user" | "agent"; content: string }[];
};

type ChatResponse = {
  city: City;
  cityLabel: string;
  reply: string;
  events: HubEvent[];
  team: typeof mockTeam[City];
  source: "openai" | "groq" | "gemini" | "openrouter" | "local";
  timestamp: number;
};

function localReply(input: string, city: City): string {
  const lower = input.toLowerCase();
  const events = getEventsByCity(city);
  const team = mockTeam[city] ?? [];
  const label = CITY_LABELS[city];

  if (
    lower.includes("событ") ||
    lower.includes("мероприят") ||
    lower.includes("event")
  ) {
    if (events.length === 0)
      return `В городе ${label} пока нет актуальных событий. Загляни позже 🌟`;
    const list = events
      .slice(0, 5)
      .map(
        (e, i) =>
          `${i + 1}. ${e.title} — ${e.date}${e.time ? " в " + e.time : ""}`
      )
      .join("\n");
    return `Ближайшие события в ${label}:\n\n${list}\n\nХочешь узнать подробности о каком-то из них?`;
  }
  if (
    lower.includes("команд") ||
    lower.includes("контакт") ||
    lower.includes("связ")
  ) {
    if (team.length === 0)
      return `Команда Astana Hub в ${label} скоро появится в базе — а пока можешь подписаться на их Instagram.`;
    const list = team
      .map((m) => `• ${m.name} — ${m.role} (${m.contact})`)
      .join("\n");
    return `Команда Astana Hub в ${label}:\n\n${list}`;
  }
  if (lower.includes("привет") || lower.includes("hello") || lower.includes("hi")) {
    return `Привет! 👋 Я AI-агент Astana Hub. Я знаю события и команду в городах: ${ALL_CITIES.map((c) => CITY_LABELS[c]).join(", ")}. Что тебя интересует?`;
  }
  if (lower.includes("спасибо") || lower.includes("thanks")) {
    return "Всегда пожалуйста! 😊";
  }
  return `Я могу помочь с информацией о событиях и команде Astana Hub в городе ${label}. Попробуй спросить: «Какие события в ${label}?» или «Расскажи о команде».`;
}

function systemPrompt(city: City): string {
  const eventsContext = getCityEventsContext(city, 15);
  const team = mockTeam[city] ?? [];
  const teamList = team
    .map((m) => `- ${m.name}, ${m.role}: ${m.contact}`)
    .join("\n");

  return [
    `Ты — Hub Events Agent, дружелюбный русскоязычный AI-ассистент международной техноплатформы Astana Hub.`,
    `Текущий выбранный город пользователя: ${CITY_LABELS[city]}.`,
    `Твоя задача — помогать находить ближайшие события и знакомить с командой Astana Hub в выбранном городе.`,
    ``,
    `БАЗА СОБЫТИЙ (${CITY_LABELS[city]}, последние 15):`,
    eventsContext || "— пока нет событий в этом городе —",
    ``,
    `БАЗА КОМАНДЫ (${CITY_LABELS[city]}):`,
    teamList || "— пока нет данных о команде —",
    ``,
    `Правила:`,
    `- Отвечай ТОЛЬКО на русском языке, кратко и по делу (2–6 предложений).`,
    `- Используй только факты из базы выше. Ничего не выдумывай.`,
    `- Если пользователь спрашивает про другой город — упомяни, что сейчас выбран ${CITY_LABELS[city]}, и предложи переключить.`,
    `- Если пользователь здоровается, перечисли 2–3 ближайших события.`,
    `- В конце можешь задать один уточняющий вопрос.`,
  ].join("\n");
}

async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  extraHeaders: Record<string, string> = {}
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 500,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI-compat API ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI-compat: empty response");
  return content;
}

async function callGemini(
  apiKey: string,
  model: string,
  system: string,
  userMessage: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini: empty response");
  return text;
}

export async function POST(req: NextRequest) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  const requestedCity = body.city ?? "Astana";

  if (!message) {
    return NextResponse.json({ error: "Поле 'message' обязательно" }, { status: 400 });
  }
  if (!isValidCity(requestedCity)) {
    return NextResponse.json(
      { error: `Неизвестный город: ${requestedCity}` },
      { status: 400 }
    );
  }

  const city = detectCity(message, requestedCity);
  const eventsForCity = getEventsByCity(city);
  const teamForCity = mockTeam[city] ?? [];

  const system = systemPrompt(city);
  const messages = [
    { role: "system" as const, content: system },
    ...((body.history ?? []).map((m) => ({
      role: (m.role === "agent" ? "assistant" : "user") as "user" | "assistant",
      content: m.content,
    }))),
    { role: "user" as const, content: message },
  ];

  let reply: string | null = null;
  let source: ChatResponse["source"] = "local";

  if (!reply && process.env.OPENAI_API_KEY) {
    try {
      reply = await callOpenAICompatible(
        "https://api.openai.com/v1",
        process.env.OPENAI_API_KEY,
        process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages
      );
      source = "openai";
    } catch (e) {
      console.error("OpenAI failed:", e);
    }
  }

  if (!reply && process.env.GROQ_API_KEY) {
    try {
      reply = await callOpenAICompatible(
        process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
        process.env.GROQ_API_KEY,
        process.env.GROQ_MODEL || "llama-3.1-70b-versatile",
        messages
      );
      source = "groq";
    } catch (e) {
      console.error("Groq failed:", e);
    }
  }

  if (!reply && process.env.OPENROUTER_API_KEY) {
    try {
      reply = await callOpenAICompatible(
        process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
        process.env.OPENROUTER_API_KEY,
        process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free",
        messages,
        {
          "HTTP-Referer": process.env.OPENROUTER_REFERER || "http://localhost:3000",
          "X-Title": process.env.OPENROUTER_TITLE || "Hub Events Agent",
        }
      );
      source = "openrouter";
    } catch (e) {
      console.error("OpenRouter failed:", e);
    }
  }

  if (!reply && process.env.GEMINI_API_KEY) {
    try {
      reply = await callGemini(
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_MODEL || "gemini-1.5-flash",
        system,
        message
      );
      source = "gemini";
    } catch (e) {
      console.error("Gemini failed:", e);
    }
  }

  if (!reply) {
    reply = localReply(message, city);
    source = "local";
  }

  const response: ChatResponse = {
    city,
    cityLabel: CITY_LABELS[city],
    reply,
    events: eventsForCity,
    team: teamForCity,
    source,
    timestamp: Date.now(),
  };

  return NextResponse.json(response);
}
