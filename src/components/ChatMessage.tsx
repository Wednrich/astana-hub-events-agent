"use client";

import { Message } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import Image from "next/image";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const { theme } = useTheme();

  return (
    <div
      className={`flex w-full animate-fade-in-up gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
  <div className="mt-1 shrink-0">
    <Image
      src={
        theme === "dark"
          ? "/astana_hub_dark_logo.jpg"
          : "/astana_hub_light_logo.jpg"
      }
      alt="Astana Hub"
      width={32}
      height={32}
      className="rounded-full"
    />
  </div>
)}

      <div
        className={`max-w-[80%] break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%] ${
          isUser ? "rounded-tr-sm" : "rounded-tl-sm"
        }`}
        style={{
          backgroundColor: isUser
            ? "var(--bg-user-msg)"
            : "var(--bg-agent-msg)",
          color: "var(--text-primary)",
          boxShadow: isUser ? "none" : "var(--card-shadow)",
          borderLeft: !isUser ? "3px solid var(--icon-color)" : "none",
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
