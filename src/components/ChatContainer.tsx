"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";

interface ChatContainerProps {
  messages: Message[];
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatContainer({
  messages,
  onSend,
  isLoading,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      className="flex h-[500px] w-full flex-col overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: "var(--bg-agent-msg)",
        borderColor: "var(--border-color)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        className="border-t p-3 sm:p-4"
        style={{ borderColor: "var(--border-color)" }}
      >
        <ChatInput onSend={onSend} disabled={isLoading} />
      </div>
    </div>
  );
}
