"use client";

import { motion } from "framer-motion";

export type AgentState = "idle" | "thinking" | "responding" | "ready";

interface AgentAvatarProps {
  state: AgentState;
}

const stateConfig = {
  idle: {
    scale: [1, 1.05, 1],
    rotate: 0,
    glowColor: "rgba(74, 222, 128, 0.6)",
    statusText: "Ready",
    duration: 3,
  },
  thinking: {
    scale: [1, 1.1, 1],
    rotate: 360,
    glowColor: "rgba(59, 130, 246, 0.8)",
    statusText: "Analyzing events...",
    duration: 1.5,
  },
  responding: {
    scale: [1, 1.08, 1],
    rotate: 0,
    glowColor: "rgba(139, 92, 246, 0.7)",
    statusText: "Generating response...",
    duration: 2,
  },
  ready: {
    scale: [1, 1.15, 1],
    rotate: 0,
    glowColor: "rgba(34, 197, 94, 0.9)",
    statusText: "Response ready",
    duration: 0.5,
  },
};

export function AgentAvatar({ state }: AgentAvatarProps) {
  const config = stateConfig[state];

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute h-32 w-32 rounded-full blur-2xl"
          style={{
            backgroundColor: config.glowColor,
          }}
          animate={{
            scale: config.scale,
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-2"
          style={{
            backgroundColor: "var(--bg-agent-msg)",
            borderColor: config.glowColor,
            boxShadow: `0 0 20px ${config.glowColor}`,
          }}
          animate={{
            scale: config.scale,
            rotate: config.rotate,
          }}
          transition={{
            duration: config.duration,
            repeat: state === "thinking" ? Infinity : 1,
            ease: "easeInOut",
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: config.glowColor,
                boxShadow: `0 0 10px ${config.glowColor}`,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: config.glowColor,
                boxShadow: `0 0 10px ${config.glowColor}`,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p
          className="text-sm font-medium"
          style={{
            color: "var(--text-primary)",
          }}
        >
          {config.statusText}
        </p>
      </motion.div>
    </div>
  );
}
