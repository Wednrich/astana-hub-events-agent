"use client";

import { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full animate-fade-in-up gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--icon-color)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="h-4 w-4"
          >
            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-6.568a4.47 4.47 0 00-1.5-3.272c-.173-.166-.358-.318-.557-.453C2.453 9.913 2 8.965 2 8c0-2.086 1.394-3.872 3.013-4.342z" />
          </svg>
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

      {isUser && (
        <div
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: "var(--bg-user-msg)",
            border: "1px solid var(--icon-color)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
            style={{ color: "var(--icon-color)" }}
          >
            <path
              fillRule="evenodd"
              d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
