"use client";

export function TypingIndicator() {
  return (
    <div
      className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3"
      style={{ backgroundColor: "var(--bg-agent-msg)" }}
    >
      <span
        className="h-2 w-2 rounded-full animate-typing-bounce"
        style={{
          backgroundColor: "var(--icon-color)",
          animationDelay: "0s",
        }}
      />
      <span
        className="h-2 w-2 rounded-full animate-typing-bounce"
        style={{
          backgroundColor: "var(--icon-color)",
          animationDelay: "0.2s",
        }}
      />
      <span
        className="h-2 w-2 rounded-full animate-typing-bounce"
        style={{
          backgroundColor: "var(--icon-color)",
          animationDelay: "0.4s",
        }}
      />
    </div>
  );
}
