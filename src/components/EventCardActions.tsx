"use client";

import { motion } from "framer-motion";
import { HubEvent } from "@/types";

interface EventCardActionsProps {
  event: HubEvent;
  onAskAI: (event: HubEvent) => void;
  onAddToCalendar?: (event: HubEvent) => void;
  isCompact?: boolean;
}

export function EventCardActions({
  event,
  onAskAI,
  onAddToCalendar,
  isCompact = false,
}: EventCardActionsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  const handleAddToCalendar = () => {
    if (onAddToCalendar) {
      onAddToCalendar(event);
    } else {
      // Fallback: try to open calendar or show message
      const eventDate = new Date(event.date);
      const calendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(
        event.title
      )}&dates=${eventDate.toISOString().split("T")[0]}/${eventDate.toISOString().split("T")[0]}&location=${encodeURIComponent(
        event.address
      )}`;
      window.open(calendarUrl, "_blank");
    }
  };

  return (
    <motion.div
      className={`flex flex-wrap gap-2 ${isCompact ? "mt-2" : "mt-4"}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.button
        onClick={() => onAskAI(event)}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: "var(--icon-color)",
          color: "white",
        }}
        variants={buttonVariants}
        whileHover={{ scale: 1.08, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
        whileTap={{ scale: 0.95 }}
      >
        <span>💬</span>
        <span>Ask AI</span>
      </motion.button>

      <motion.button
        onClick={handleAddToCalendar}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: "var(--bg-user-msg)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-color)",
        }}
        variants={buttonVariants}
        whileHover={{ scale: 1.08, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        whileTap={{ scale: 0.95 }}
      >
        <span>📅</span>
        <span>Add to Calendar</span>
      </motion.button>

      {event.url && (
        <motion.a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: "var(--bg-user-msg)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            textDecoration: "none",
          }}
          variants={buttonVariants}
          whileHover={{ scale: 1.08, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          <span>🔗</span>
          <span>Open Source</span>
        </motion.a>
      )}
    </motion.div>
  );
}
