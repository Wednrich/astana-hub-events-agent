"use client";

import React, { useState } from 'react';
import { AgentAvatar, AgentState } from './AgentAvatar';

export const ChatContainer: React.FC = () => {
  const [agentState, setAgentState] = useState<AgentState>('idle');

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-slate-950">
      <main className="flex-1 flex flex-col p-4 md:p-6">
        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-6">
        </div>
      </main>
      <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center p-6">
        <AgentAvatar state={agentState} />
      </aside>
    </div>
  );
};