"use client";

import { useState } from "react";
import { Header } from "../components/Header";
import { ChatContainer } from "../components/ChatContainer";
import { EventsSection } from "../components/EventsSection";
import { AgentAvatar, AgentState } from "../components/AgentAvatar";
import { Message, City, HubEvent, CITY_LABELS } from "../types";

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
  const [agentState, setAgentState] = useState<AgentState>("idle");

  const handleSend = async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setAgentState("thinking");

    const history = [...messages, userMsg]
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      setAgentState("responding");
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

      // Display clean message without any metadata or source tags
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: data.reply,
        timestamp: data.timestamp,
      };
      setMessages((prev) => [...prev, agentMsg]);

      if (data.city && data.city !== selectedCity) {
        setSelectedCity(data.city);
      }

      setAgentState("ready");
      setTimeout(() => setAgentState("idle"), 1500);
    } catch {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content:
          "Не удалось связаться с агентом. Попробуй ещё раз через пару секунд 🙏",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setAgentState("idle");
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

      <main className="mx-auto w-full max-w-7xl animate-theme-fade px-4 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex-1">
              <ChatContainer
                messages={messages}
                onSend={handleSend}
                isLoading={isLoading}
              />
            </div>

            <div className="flex justify-center lg:w-64 lg:justify-start">
              <div
                className="rounded-2xl border p-6"
                style={{
                  backgroundColor: "var(--bg-agent-msg)",
                  borderColor: "var(--border-color)",
                  boxShadow: "var(--card-shadow)",
                }}
              >
                <AgentAvatar state={agentState} />
              </div>
            </div>
          </div>
        </div>

        <EventsSection city={selectedCity} />
      </main>
    </div>
  );
}
