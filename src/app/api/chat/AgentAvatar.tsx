"use client";

import React from 'react';
import { motion } from 'framer-motion';

export type AgentState = 'idle' | 'thinking' | 'responding' | 'ready';

interface AgentAvatarProps {
  state: AgentState;
}

const stateConfig: Record<AgentState, { text: string; color: string; scale: number[]; duration: number }> = {
  idle: { text: 'Ready', color: 'rgba(156, 163, 175, 0.4)', scale: [1, 1.05, 1], duration: 4 },
  thinking: { text: 'Analyzing events...', color: 'rgba(168, 85, 247, 0.8)', scale: [1, 1.15, 1], duration: 1.5 },
  responding: { text: 'Generating response...', color: 'rgba(59, 130, 246, 0.8)', scale: [1, 1.1, 1], duration: 1 },
  ready: { text: 'Response ready', color: 'rgba(34, 197, 94, 0.8)', scale: [1, 1.05, 1], duration: 2 },
};

export const AgentAvatar: React.FC<AgentAvatarProps> = ({ state }) => {
  const config = stateConfig[state];

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <motion.div
        className="relative flex items-center justify-center w-32 h-32 rounded-full bg-slate-900 border border-slate-700"
        animate={{
          scale: config.scale,
          boxShadow: [
            `0 0 10px ${config.color}`,
            `0 0 40px ${config.color}`,
            `0 0 10px ${config.color}`,
          ],
          borderColor: [
            'rgba(51, 65, 85, 1)',
            config.color,
            'rgba(51, 65, 85, 1)'
          ]
        }}
        transition={{ duration: config.duration, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="w-10 h-10 rounded-full bg-white"
          animate={{ opacity: state === 'thinking' ? [0.4, 1, 0.4] : 1, scale: state === 'responding' ? [0.8, 1.2, 0.8] : 1, backgroundColor: config.color }}
          transition={{ duration: config.duration * 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <motion.div key={state} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-sm font-medium tracking-wide text-slate-300">
        {config.text}
      </motion.div>
    </div>
  );
};