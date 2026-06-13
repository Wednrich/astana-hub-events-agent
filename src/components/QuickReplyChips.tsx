"use client";

import { motion } from "framer-motion";
import { QuickReplyChip } from "@/hooks/useEventChatIntegration";

interface QuickReplyChipsProps {
  chips: QuickReplyChip[];
  isVisible: boolean;
}

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.2 },
  },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 5 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const chipTapVariants = {
  tap: { scale: 0.95, opacity: 0.8 },
  hover: { scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
};

export function QuickReplyChips({
  chips,
  isVisible,
}: QuickReplyChipsProps) {
  if (!isVisible || chips.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="mb-3 flex flex-wrap gap-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {chips.map((chip) => (
        <motion.button
          key={chip.id}
          onClick={chip.action}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: "var(--bg-user-msg)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
          }}
          variants={chipVariants}
          whileHover={chipTapVariants.hover}
          whileTap={chipTapVariants.tap}
        >
          <span className="text-base">{chip.emoji}</span>
          <span>{chip.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
