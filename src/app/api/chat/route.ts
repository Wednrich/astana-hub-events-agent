import { NextRequest, NextResponse } from "next/server";
import type { City, HubEvent } from "@/types";
import { ALL_CITIES, CITY_LABELS } from "@/types";
import { getCityEventsContext, getEventsByCity } from "@/data/eventLoader";
import { mockTeam } from "@/data/mockData";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Track providers that got rate-limited (429) — skip them for the rest of this request cycle */
const RATE_LIMITED_PROVIDERS = new Set<ChatSource>();

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
  "тараз": "Taraz",
  "taraz": "Taraz",
  "орал": "Oral",
  "oral": "Oral",
  "уральск": "Oral",
  "актау": "Aktau",
  "aktau": "Aktau",
  "атырау": "Atyrau",
  "atyrau": "Atyrau",
  "жамбыл": "Taraz",
  "zhambyl": "Taraz",
  "конаев": "Alatau",
  "konaev": "Alatau",
};

const EN_TO_CITY: Record<string, City> = Object.fromEntries(
  ALL_CITIES.map((c) => [c.toLowerCase(), c])
);

type Intent = "EVENTS" | "TEAM" | "GENERAL" | "MIXED";

function detectIntent(input: string): Intent {
  const lower = input.toLowerCase();

  // Check for city mention
  const hasCity = [...Object.keys(RU_TO_CITY), ...Object.keys(EN_TO_CITY)].some(
    (keyword) => lower.includes(keyword)
  );

  // Event-related keywords
  const eventKeywords = [
    "событ", "мероприят", "event", "меро", "ивент", "ивенты",
    "ближайш", "календар", "расписан", "афиш", "что проходит",
    "когда", "где проходит", "дата", "встреч", "форум", "хакатон",
    "митап", "лекци", "воркшоп", "тренинг", "курс",
  ];

  // Team-related keywords
  const teamKeywords = [
    "команд", "контакт", "связ", "директор", "сотрудник",
    "руководител", "менеджер", "специалист", "кто работает",
    "спикер", "организатор", "куратор", "лидер",
    "email", "телефон", "почт", "написать", "связаться",
    "staff", "team", "people", "contact",
  ];

  const isEvent = eventKeywords.some((kw) => lower.includes(kw));
  const isTeam = teamKeywords.some((kw) => lower.includes(kw));

  if (isEvent && hasCity) return "MIXED";
  if (isTeam && hasCity) return "MIXED";
  if (isEvent) return "EVENTS";
  if (isTeam) return "TEAM";
  return "GENERAL";
}

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

type ChatSource = "groq" | "deepseek" | "openrouter" | "local";

type ChatResponse = {
  city: City;
  cityLabel: string;
  reply: string;
  events: HubEvent[];
  team: typeof mockTeam[City];
  source: ChatSource;
  intent: Intent;
  providerErrors?: { provider: ChatSource; error: string }[];
  timestamp: number;
};

function localReply(input: string, city: City): string {
  const lower = input.toLowerCase();
  const events = getEventsByCity(city);
  const team = mockTeam[city] ?? [];
  const label = CITY_LABELS[city];

  // Hub-specific event queries
  if (
    lower.includes("событ") ||
    lower.includes("мероприят") ||
    lower.includes("event")
  ) {
    if (events.length === 0)
      return `Город: ${label}\n\nВ настоящее время нет запланированных событий в этом городе.`;
    const topThreeEvents = events.slice(0, 3);
    if (topThreeEvents.length === 0) {
      return `Город: ${label}\n\nНет ближайших событий`;
    }
    const eventList = topThreeEvents.map((e, i) => `${i + 1}. ${e.title} ${e.date}`).join("\n");
    return `Город: ${label}\n\nБлижайшие события:\n${eventList}`;
  }

  // Hub-specific team/contact queries
  if (
    lower.includes("команд") ||
    lower.includes("контакт") ||
    lower.includes("связ")
  ) {
    if (team.length === 0)
      return `Город: ${label}\n\nИнформация о команде в этом городе находится на обновлении.`;
    const teamList = team
      .map((m, i) => `${i + 1}. ${m.name} - ${m.role} (${m.contact})`)
      .join("\n");
    return `Город: ${label}\n\nКоманда:\n${teamList}`;
  }

  // Greeting
  if (lower.includes("привет") || lower.includes("hello") || lower.includes("hi")) {
    const topThreeEvents = events.slice(0, 3);
    if (topThreeEvents.length === 0) {
      return `Привет! Я помощник Astana Hub. Спросите меня о событиях, команде или других интересующих вас вопросах.`;
    }
    const eventList = topThreeEvents.map((e, i) => `${i + 1}. ${e.title} ${e.date}`).join("\n");
    return `Привет! Вот ближайшие события в городе ${label}:\n${eventList}`;
  }

  // Thanks
  if (lower.includes("спасибо") || lower.includes("thanks")) {
    return "Всегда пожалуйста! 😊";
  }

  // City switching
  if (lower.includes("другой город")) {
    return `Сейчас выбран город ${label}. Хотите переключить город?`;
  }

  // For general questions, return a helpful fallback instead of error
  return "Я помощник Astana Hub. Я могу помочь с информацией о событиях и команде в выбранном городе. Спросите меня о событиях, контактах или других вопросах!";
}

function systemPrompt(city: City, intent: Intent): string {
  const eventsContext = getCityEventsContext(city, 15);
  const team = mockTeam[city] ?? [];
  const teamList = team
    .map((m) => `- ${m.name}, ${m.role}: ${m.contact}`)
    .join("\n");
  const cityLabel = CITY_LABELS[city];

  // GENERAL intent: open prompt, no context restrictions
  if (intent === "GENERAL") {
    return [
      `Ты — Hub Events Agent, дружелюбный русскоязычный ассистент международной техноплатформы Astana Hub.`,
      `Текущий выбранный город пользователя: ${cityLabel}.`,
      `Твоя основная специализация — помогать с информацией о Astana Hub: события, команда, контакты.`,
      `НО ты также можешь отвечать на любые общие вопросы пользователя, используя свои знания.`,
      ``,
      `=== ДАННЫЕ ASTANA HUB (справочно) ===`,
      `СОБЫТИЯ В ${cityLabel}:`,
      eventsContext || "— пока нет событий в этом городе —",
      ``,
      `КОМАНДА ${cityLabel}:`,
      teamList || "— пока нет данных о команде —",
      ``,
      `=== ПРАВИЛА ===`,
      `1. Если пользователь спрашивает о событиях, команде или контактах Astana Hub — ИСПОЛЬЗУЙ ТОЛЬКО данные выше. Не выдумывай события или людей.`,
      `2. Если данных о событиях/команде нет в списке — скажи: "Нет данных по этому запросу."`,
      `3. Если пользователь задаёт общий вопрос (не про Astana Hub) — отвечай свободно, как обычный AI-ассистент. Используй свои знания.`,
      `4. Отвечай на русском языке, обычным текстом.`,
      `5. Будь дружелюбным и полезным.`,
    ].join("\n");
  }

  // EVENTS / TEAM / MIXED intent: strict context-based prompt
  return [
    `Ты — Hub Events Agent, дружелюбный русскоязычный ассистент международной техноплатформы Astana Hub.`,
    `Текущий выбранный город пользователя: ${CITY_LABELS[city]}.`,
    `Твоя задача — помогать находить ближайшие события и знакомить с командой Astana Hub в выбранном городе.`,
    ``,
    `=== ДАННЫЕ ASTANA HUB (справочно) ===`,
    `СОБЫТИЯ В ${cityLabel}:`,
    eventsContext || "— пока нет событий в этом городе —",
    ``,
    `КОМАНДА ${cityLabel}:`,
    teamList || "— пока нет данных о команде —",
    ``,
    `Ты — Hub Events Agent, ассистент Astana Hub.`,
`Отвечай ТОЛЬКО текстом.`,
`Запрещено: JSON, HTML, markdown, теги, эмодзи, служебные подписи.`,
`Если данных нет — скажи: "Нет данных по этому запросу."`,
    ``,
    `Правила для текста внутри поля reply:`,
    `- Отвечай ТОЛЬКО на русском языке.`,
    `- НЕ галлюцинируй события, даты или людей. Используй только предоставленный контекст.`,
    `- Если информация отсутствует, ответь: "Нет данных по этому запросу."`,
    `- Максимум 2-5 коротких предложений.`,
    `- Без списков, если явно не попросят.`,
    `- Без markdown, HTML, тегов внутри текста.`,
    `- Если пользователь упоминает другой город, НЕ переключайся автоматически. Скажи: "Сейчас выбран город ${CITY_LABELS[city]}. Хотите переключить город?"`,
    `- Если пользователь здоровается, дай 2-3 ближайших события.`,
    `- Если пользователь спрашивает о событиях, суммируй только из списка событий.`,
    `- Если пользователь спрашивает о команде, покажи только список команды.`,
    `- Если пользователь задает общие вопросы, придерживайся контекста Astana Hub.`,
    `- Никогда не добавляй внешние знания.`,
    `- Никогда не приукрашивай.`,
    `- Строго придерживайся предоставленных данных.`,
  ].join("\n");
}

/**
 * Minimal sanitization: only remove system artifacts like <think> tags and JSON leakage.
 * Does NOT remove valid words (AI, assistant, etc.)
 */
function sanitizeLLMResponse(text: string): string {
  if (!text) return text;

  let cleanText = text;

  // 1. Remove internal system tags (<think>, <debug>, <log>, etc.)
  cleanText = cleanText.replace(/<think[\s\S]*?<\/think>/gi, "");
  cleanText = cleanText.replace(/<debug[\s\S]*?<\/debug>/gi, "");
  cleanText = cleanText.replace(/<log[\s\S]*?<\/log>/gi, "");
  cleanText = cleanText.replace(/<meta[\s\S]*?<\/meta>/gi, "");
  cleanText = cleanText.replace(/<sub[\s\S]*?<\/sub>/gi, "");

  // 2. Decode HTML entities
  cleanText = cleanText
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'");

  // 3. Remove markdown code blocks (they can contain JSON)
  cleanText = cleanText.replace(/```[\s\S]*?```/g, "");
  cleanText = cleanText.replace(/`[^`]+`/g, "");

  // 4. Remove any remaining HTML/XML tags
  cleanText = cleanText.replace(/<[^>]+>/g, "");

  // 5. Clean up whitespace
  cleanText = cleanText
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();

  return cleanText;
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
    cache: "no-store",
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
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty response from provider");
  return content;
}

async function callDeepSeek(
  messages: { role: "system" | "user" | "assistant"; content: string }[]
): Promise<string> {
  const client = new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY!,
  });

  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";
  const thinkingEnabled = process.env.DEEPSEEK_THINKING_ENABLED !== "false";
  const reasoningEffort = process.env.DEEPSEEK_REASONING_EFFORT || "high";

  const completion = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.4,
    max_tokens: 500,
    ...(model === "deepseek-v4-pro" && thinkingEnabled
      ? {
          thinking: { type: "enabled" } as const,
          reasoning_effort: reasoningEffort as "high" | "medium" | "low",
        }
      : {}),
    stream: false,
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty response from DeepSeek");
  return content;
}

export async function POST(req: NextRequest) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const message = body.message?.trim();
  const requestedCity = body.city ?? "Astana";

  if (!message || message.length < 2) {
    return NextResponse.json({ error: "Поле 'message' обязательно и должно содержать не менее 2 символов" }, { status: 400 });
  }
  if (!isValidCity(requestedCity)) {
    return NextResponse.json(
      { error: `Неизвестный город: ${requestedCity}` },
      { status: 400 }
    );
  }

  const intent = detectIntent(message);
  const city = detectCity(message, requestedCity);
  const eventsForCity = getEventsByCity(city);
  const teamForCity = mockTeam[city] ?? [];

  console.log(`[INTENT DETECTED] "${message}" → ${intent} (city: ${CITY_LABELS[city]})`);

  const system = systemPrompt(city, intent);
  const messages = [
    { role: "system" as const, content: system },
    ...((body.history ?? []).map((m) => ({
      role: (m.role === "agent" ? "assistant" : "user") as "user" | "assistant",
      content: m.content,
    }))),
    { role: "user" as const, content: message },
  ];

  let reply: string | null = null;
  let source: ChatSource = "local";
  const providerErrors: { provider: ChatSource; error: string }[] = [];

  console.log('--- AI Provider Key Check ---');
  console.log(`Groq Key available: ${!!process.env.GROQ_API_KEY}`);
  console.log(`DeepSeek Key available: ${!!process.env.DEEPSEEK_API_KEY}`);
  console.log(`OpenRouter Key available: ${!!process.env.OPENROUTER_API_KEY}`);
  console.log('-----------------------------');

  // Smart provider chain: primary → secondary → backup
  const providerChain: { name: ChatSource, enabled: boolean, call: () => Promise<string> }[] = [
    {
      name: 'deepseek',
      enabled: !!process.env.DEEPSEEK_API_KEY,
      call: () => callDeepSeek(messages),
    },
    {
      name: 'openrouter',
      enabled: !!process.env.OPENROUTER_API_KEY,
      call: () => callOpenAICompatible(
        process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
        process.env.OPENROUTER_API_KEY!,
        process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free",
        messages,
        {
          "HTTP-Referer": process.env.OPENROUTER_REFERER || "http://localhost:3000",
          "X-Title": process.env.OPENROUTER_TITLE || "Hub Events Agent",
        }
      ),
    },
    {
      name: 'groq',
      enabled: !!process.env.GROQ_API_KEY,
      call: () => callOpenAICompatible(process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1", process.env.GROQ_API_KEY!, process.env.GROQ_MODEL || "llama-3.1-70b-versatile", messages),
    },
  ];

  console.log('=== PROVIDER CHAIN ===');
  console.log(`DeepSeek: ${providerChain[0].enabled ? 'PRIMARY' : 'DISABLED'}`);
  console.log(`OpenRouter: ${providerChain[1].enabled ? 'SECONDARY' : 'DISABLED'}`);
  console.log(`Groq: ${providerChain[2].enabled ? 'BACKUP' : 'DISABLED'}`);
  console.log('======================');

  for (const provider of providerChain) {
    if (reply) break;
    if (!provider.enabled) {
      console.log(`[${provider.name}] SKIPPED: provider disabled (no API key)`);
      continue;
    }
    if (RATE_LIMITED_PROVIDERS.has(provider.name)) {
      console.log(`[${provider.name}] SKIPPED: rate-limited (429)`);
      providerErrors.push({ provider: provider.name, error: "HTTP 429 — rate limited, skipped for this cycle" });
      continue;
    }

    try {
      console.log(`[${provider.name}] >>> ATTEMPTING`);
      if (provider.name === 'deepseek') {
        console.log(`[deepseek] Model: ${process.env.DEEPSEEK_MODEL || "deepseek-v4-pro"}, Base URL: ${process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"}`);
      } else if (provider.name === 'groq') {
        console.log(`[groq] Base URL: ${process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"}, Model: ${process.env.GROQ_MODEL || "llama-3.3-70b-versatile"}`);
      } else if (provider.name === 'openrouter') {
        console.log(`[openrouter] Base URL: ${process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"}, Model: ${process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo"}`);
      }

      reply = await provider.call();
      source = provider.name;
      console.log(`[${provider.name}] ✓ SUCCESS. Response preview: ${reply.substring(0, 200)}`);
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      const isRateLimit = err.includes("HTTP 429") || err.includes("429") || err.toLowerCase().includes("rate limit");
      
      console.error(`[${provider.name}] ✗ FAILED`);
      console.error(`[${provider.name}] FAILURE REASON: ${err}`);
      console.error(`[${provider.name}] STATUS CODE: ${isRateLimit ? '429 (Rate Limited)' : 'See error message above'}`);
      
      providerErrors.push({ provider: provider.name, error: err });

      if (isRateLimit) {
        console.error(`[${provider.name}] ⛔ RATE LIMITED (429). Skipping for this request cycle.`);
        RATE_LIMITED_PROVIDERS.add(provider.name);
      }
    }
  }

  if (!reply) {
    console.log('⚠ ALL AI PROVIDERS FAILED. Falling back to local reply.');
    console.log(`Provider errors: ${JSON.stringify(providerErrors)}`);
    reply = localReply(message, city);
    source = "local";
  }

  reply = sanitizeLLMResponse(reply || "");

  const response: ChatResponse = {
    city,
    cityLabel: CITY_LABELS[city],
    reply,
    events: eventsForCity,
    team: teamForCity,
    source,
    intent,
    timestamp: Date.now(),
  };

  if (providerErrors.length > 0) {
    response.providerErrors = providerErrors;
  }

  return NextResponse.json(response);
}