"use client";

import { Event, EventFormat } from "@/types";

interface EventCardProps {
  event: Event;
  href?: string;
}

const formatIcons: Record<EventFormat, { icon: string; label: string }> = {
  offline: { icon: "📍", label: "Офлайн" },
  online: { icon: "💻", label: "Онлайн" },
  hybrid: { icon: "🔄", label: "Гибрид" },
};

const formatColors: Record<EventFormat, string> = {
  offline: "#4ade80",
  online: "#3b82f6",
  hybrid: "#a855f7",
};

export function EventCard({ event, href }: EventCardProps) {
  const { icon, label } = formatIcons[event.format];
  const accentColor = formatColors[event.format];

  const baseClass =
    "group relative block cursor-pointer overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl";
  const baseStyle = {
    backgroundColor: "var(--bg-agent-msg)",
    borderColor: "var(--border-color)",
    boxShadow: "var(--card-shadow)",
    textDecoration: "none" as const,
  };

  const inner = (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: `${accentColor}20`,
            color: accentColor,
            border: `1px solid ${accentColor}40`,
          }}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </div>
        {href && (
          <span
            className="text-xs opacity-60 transition-opacity group-hover:opacity-100"
            style={{ color: "var(--text-primary)" }}
          >
            Instagram ↗
          </span>
        )}
      </div>

      <h3
        className="mb-2 text-lg font-bold leading-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {event.title}
      </h3>

      <p
        className="mb-3 text-sm leading-relaxed opacity-80"
        style={{ color: "var(--text-primary)" }}
      >
        {event.description}
      </p>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 shrink-0"
            style={{ color: "var(--icon-color)" }}
          >
            <path
              fillRule="evenodd"
              d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 011.5 0v1.5h9V3a.75.75 0 01.75-.75zM5.25 6.75c-.621 0-1.125.504-1.125 1.125v3.026a3 3 0 013 0v-3.026c0-.621-.504-1.125-1.125-1.125H5.25z"
              clipRule="evenodd"
            />
          </svg>
          <span style={{ color: "var(--text-primary)" }}>
            {event.date} · {event.time}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 shrink-0"
            style={{ color: "var(--icon-color)" }}
          >
            <path
              fillRule="evenodd"
              d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          <span
            className="truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {event.address}
          </span>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${accentColor}10 0%, transparent 50%)`,
        }}
      />
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
        style={baseStyle}
      >
        {inner}
      </a>
    );
  }

  return (
    <div className={baseClass} style={baseStyle}>
      {inner}
    </div>
  );
}
