"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { ChatContainer } from "@/components/ChatContainer";
import { EventsSection } from "@/components/EventsSection";
import { Message, City, HubEvent, CITY_LABELS } from "@/types";

type ChatApiSource = "openai" | "groq" | "gemini" | "openrouter" | "local";

type ChatApiResponse = {
  city: City;
  cityLabel: string;
  reply: string;
  events: HubEvent[];
  source: ChatApiSource;
  timestamp: number;
};

const SOURCE_LABEL: Record<ChatApiSource, string> = {
  openai: "OpenAI",
  groq: "Groq",
  gemini: "Gemini",
  openrouter: "OpenRouter",
  local: "локальный fallback",
};

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<City>("Astana");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "agent",
      content:
        "Привет! Я Hub Events Agent 🤖 Помогу найти ближайшие события Astana Hub в твоём городе. Выбери город в шапке или просто напиши свой город!",
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const history = [...messages, userMsg]
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          city: selectedCity,
          history,
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = (await res.json()) as ChatApiResponse;

      const tag =
        data.source === "local"
          ? ""
          : `\n\n<sub>🧠 ${SOURCE_LABEL[data.source]}</sub>`;
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: `${data.reply}${tag}`,
        timestamp: data.timestamp,
      };
      setMessages((prev) => [...prev, agentMsg]);

      if (data.city && data.city !== selectedCity) {
        setSelectedCity(data.city);
      }
    } catch {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content:
          "Не удалось связаться с агентом. Попробуй ещё раз через пару секунд 🙏",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCityChange = (city: City) => {
    setSelectedCity(city);
    const agentMsg: Message = {
      id: Date.now().toString(),
      role: "agent",
      content: `Ты выбрал ${CITY_LABELS[city]} 🌟 Здесь проходит несколько событий. Посмотри карточки ниже или спроси меня подробнее!`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, agentMsg]);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Header selectedCity={selectedCity} onCityChange={handleCityChange} />

      <main className="mx-auto w-full max-w-6xl animate-theme-fade px-4 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <ChatContainer
            messages={messages}
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>

        <EventsSection city={selectedCity} />
      </main>
    </div>
  );
}
