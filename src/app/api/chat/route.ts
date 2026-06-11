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

type ChatSource = "openai" | "groq" | "gemini" | "openrouter" | "local";

type ChatResponse = {
  city: City;
  cityLabel: string;
  reply: string;
  events: HubEvent[];
  team: typeof mockTeam[City];
  source: ChatSource;
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

function systemPrompt(city: City): string {
  const eventsContext = getCityEventsContext(city, 15);
  const team = mockTeam[city] ?? [];
  const teamList = team
    .map((m) => `- ${m.name}, ${m.role}: ${m.contact}`)
    .join("\n");

  return [
    `Ты — Hub Events Agent, дружелюбный русскоязычный ассистент международной техноплатформы Astana Hub.`,
    `Текущий выбранный город пользователя: ${CITY_LABELS[city]}.`,
    ``,
    `БАЗА СОБЫТИЙ (${CITY_LABELS[city]}, последние 15):`,
    eventsContext || "— пока нет событий в этом городе —",
    ``,
    `БАЗА КОМАНДЫ (${CITY_LABELS[city]}):`,
    teamList || "— пока нет данных о команде —",
    ``,
    `ИНСТРУКЦИИ:`,
    ``,
    `1. ПРИОРИТЕТЫ ОТВЕТОВ:`,
    `   - Если вопрос о событиях, командах или контактах Astana Hub → используй предоставленные данные выше.`,
    `   - Если вопрос содержит вопросы о городе, месторасположении, датах, связанных с Hub → используй контекст.`,
    `   - Если вопрос общего характера (AI, программирование, наука, технология и т.д.) → отвечай нормально как помощник.`,
    ``,
    `2. ПРАВИЛА ОТВЕТОВ:`,
    `   - Отвечай ТОЛЬКО на русском языке.`,
    `   - Максимум 2-5 коротких предложений.`,
    `   - Отвечай ТОЛЬКО текстом (без JSON, HTML, markdown, тегов, эмодзи).`,
    `   - Без списков, если явно не попросят.`,
    `   - Без markdown, HTML, тегов внутри текста.`,
    `   - Без служебных подписей, имен моделей, логов.`,
    ``,
    `3. ДЛЯ ВОПРОСОВ О HUB:`,
    `   - Используй ТОЛЬКО предоставленные данные о событиях и команде.`,
    `   - НЕ галлюцинируй события, даты или людей.`,
    `   - Если информация отсутствует в базе Hub → скажи: "К сожалению, в базе нет информации по этому запросу. Свяжитесь с командой Hub для получения подробностей."`,
    ``,
    `4. ДЛЯ ОБЩИХ ВОПРОСОВ:`,
    `   - Ты можешь использовать общие знания для ответа.`,
    `   - Помни, что ты ассистент Astana Hub, поэтому будь полезен и дружелюбен.`,
    ``,
    `5. СПЕЦИАЛЬНЫЕ СЛУЧАИ:`,
    `   - Если пользователь здоровается → дай 2-3 ближайших события или приветствие.`,
    `   - Если пользователь упоминает другой город → скажи: "Сейчас выбран город ${CITY_LABELS[city]}. Хотите переключить город?"`,
    `   - Если пользователь спрашивает о другом городе → предложи переключить.`,
  ].join("\n");
}

/**
 * STRICT output sanitization layer
 * Removes ALL metadata, system artifacts, HTML/XML tags, and debug content
 */
function sanitizeLLMResponse(text: string): string {
  if (!text) return text;

  let cleanText = text;

  // 1. Remove HTML/XML tags with content (like <sub>, <think>, <debug>, etc.)
  cleanText = cleanText.replace(/<sub[\s\S]*?<\/sub>/gi, "");
  cleanText = cleanText.replace(/<think[\s\S]*?<\/think>/gi, "");
  cleanText = cleanText.replace(/<debug[\s\S]*?<\/debug>/gi, "");
  cleanText = cleanText.replace(/<meta[\s\S]*?<\/meta>/gi, "");
  cleanText = cleanText.replace(/<log[\s\S]*?<\/log>/gi, "");
  
  // 2. Decode HTML entities before further cleaning
  cleanText = cleanText
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // 3. Remove code blocks (markdown style)
  cleanText = cleanText.replace(/```[\s\S]*?```/g, "");
  cleanText = cleanText.replace(/`[^`]+`/g, "");

  // 4. Remove JSON objects (likely debug/metadata)
  cleanText = cleanText.replace(/\{[\s\S]*?\}/g, (match) => {
    try {
      JSON.parse(match);
      return ""; // It's valid JSON, remove it
    } catch {
      return match; // Not JSON, keep it
    }
  });

  // 5. Remove ANY remaining HTML/XML tags
  cleanText = cleanText.replace(/<[^>]+>/g, "");

  // 6. Remove model/provider identifiers and system terms
  const bannedTerms = [
    "Groq",
    "OpenAI",
    "Gemini",
    "OpenRouter",
    "assistant",
    "Hub Events Agent",
    "model:",
    "provider:",
    "source:",
  ];
  for (const term of bannedTerms) {
    cleanText = cleanText.replace(new RegExp(term, "gi"), "");
  }

  // 7. Remove "AI" only as standalone word (preserve names like "Aizada")
  cleanText = cleanText.replace(/\bAI\b/gi, "");

  // 8. Remove emoji brackets commonly used as tags (🧠, 🔧, ⚙️, etc.)
  const emojiTags = ["🧠", "🔧", "⚙️", "🤖", "💭", "📝", "🎯"];
  for (const emoji of emojiTags) {
    cleanText = cleanText.replace(new RegExp(emoji, "g"), "");
  }

  // 9. Remove common debug/log prefixes
  cleanText = cleanText.replace(/^(DEBUG|LOG|INFO|ERROR|WARN):\s*/gim, "");
  
  // 10. Clean up multiple spaces, newlines, and trim
  cleanText = cleanText
    .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines
    .replace(/\s+/g, " ") // Multiple spaces to single space
    .replace(/\s*\n\s*/g, "\n") // Clean spaces around newlines
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

async function callGemini(
  apiKey: string,
  model: string,
  system: string,
  userMessage: string
): Promise<string> {
  // Gemini API supports two auth methods:
  //   1) ?key=API_KEY  (for standard API keys like AIzaSy...)
  //   2) Authorization: Bearer TOKEN  (for OAuth access tokens like ya29.... or gcloud ADC tokens)
  // Detect which one we have:
  const looksLikeApiKey = /^AIza[0-9A-Za-z_-]{35}$/.test(apiKey);
  const url = looksLikeApiKey
    ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!looksLikeApiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("empty response from Gemini");
  return text;
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
  let source: ChatSource = "local";
  const providerErrors: { provider: ChatSource; error: string }[] = [];

  // For debugging, let's see which keys are available
  console.log('--- AI Provider Key Check ---');
  console.log(`OpenAI Key available: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`Groq Key available: ${!!process.env.GROQ_API_KEY}`);
  console.log(`OpenRouter Key available: ${!!process.env.OPENROUTER_API_KEY}`);
  console.log(`Gemini Key available: ${!!process.env.GEMINI_API_KEY}`);
  console.log('-----------------------------');

  const providerChain: { name: ChatSource, enabled: boolean, call: () => Promise<string> }[] = [
    {
      name: 'openai',
      enabled: !!process.env.OPENAI_API_KEY,
      call: () => callOpenAICompatible("https://api.openai.com/v1", process.env.OPENAI_API_KEY!, process.env.OPENAI_MODEL || "gpt-4o-mini", messages),
    },
    {
      name: 'groq',
      enabled: !!process.env.GROQ_API_KEY,
      call: () => callOpenAICompatible(process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1", process.env.GROQ_API_KEY!, process.env.GROQ_MODEL || "llama-3.1-70b-versatile", messages),
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
      name: 'gemini',
      enabled: !!process.env.GEMINI_API_KEY,
      call: () => callGemini(process.env.GEMINI_API_KEY!, process.env.GEMINI_MODEL || "gemini-1.5-flash", system, message as string),
    },
  ];

  for (const provider of providerChain) {
    if (provider.enabled && !reply) {
      try {
        console.log(`Attempting to call provider: ${provider.name}`);
        // Log the actual API call details (excluding sensitive API keys)
        if (provider.name === 'openai') {
          console.log(`OpenAI API Call: Model - ${process.env.OPENAI_MODEL || "gpt-4o-mini"}`);
        } else if (provider.name === 'groq') {
          console.log(`Groq API Call: Base URL - ${process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"}, Model - ${process.env.GROQ_MODEL || "llama-3.3-70b-versatile"}`);
        } else if (provider.name === 'openrouter') {
          console.log(`OpenRouter API Call: Base URL - ${process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"}, Model - ${process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo"}`);
        } else if (provider.name === 'gemini') {
          console.log(`Gemini API Call: Model - ${process.env.GEMINI_MODEL || "gemini-1.5-flash"}`);
        }

        reply = await provider.call();
        source = provider.name;
        console.log(`Successfully received reply from ${provider.name}. Reply: ${reply.substring(0, 100)}...`);
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        console.error(`Provider ${provider.name} failed:`, err);
        providerErrors.push({ provider: provider.name, error: err });
      }
    }
  }
console.log("ENV TEST:", process.env.OPENAI_API_KEY);
  if (!reply) {
    console.log('All AI providers failed. Falling back to local reply.');
    reply = localReply(message, city);
    source = "local";
  } else {
    let cleanReply = reply.trim();

    if (cleanReply.startsWith("```json")) {
      cleanReply = cleanReply.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleanReply.startsWith("```")) {
      cleanReply = cleanReply.replace(/^```/, "").replace(/```$/, "").trim();
    }

    if (cleanReply.startsWith("{") && cleanReply.endsWith("}")) {
      try {
        const data = JSON.parse(cleanReply);
        if (data && typeof data.reply === "string") {
          reply = data.reply;
        }
      } catch {
        // Plain text response; keep raw reply without logging parse failure.
      }
    }
  }

  reply = sanitizeLLMResponse(reply || "");

  const response: ChatResponse = {
    city,
    cityLabel: CITY_LABELS[city],
    reply,
    events: eventsForCity,
    team: teamForCity,
    source,
    timestamp: Date.now(),
  };

  if (providerErrors.length > 0) {
    response.providerErrors = providerErrors;
  }

  return NextResponse.json(response);
}
