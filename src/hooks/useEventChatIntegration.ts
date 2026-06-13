import { useState, useCallback } from "react";
import { HubEvent } from "@/types";

export interface QuickReplyChip {
  id: string;
  label: string;
  emoji: string;
  action: () => void;
}

export function useEventChatIntegration() {
  const [selectedEvent, setSelectedEvent] = useState<HubEvent | null>(null);
  const [quickReplyChips, setQuickReplyChips] = useState<QuickReplyChip[]>([]);
  const [showChips, setShowChips] = useState(false);

  /**
   * Generate quick reply suggestions based on the last assistant message
   */
  const generateQuickReplies = useCallback(
    (onChipClick: (message: string) => void) => {
      if (!selectedEvent) {
        setQuickReplyChips([]);
        setShowChips(false);
        return;
      }

      const chips: QuickReplyChip[] = [
        {
          id: "tell-more",
          label: "Tell me more",
          emoji: "👍",
          action: () => {
            onChipClick(`Tell me more about ${selectedEvent.title}`);
            setShowChips(false);
          },
        },
        {
          id: "similar",
          label: "Similar events",
          emoji: "📅",
          action: () => {
            onChipClick(
              `Show me similar events to ${selectedEvent.title} in the same format`
            );
            setShowChips(false);
          },
        },
        {
          id: "join",
          label: "How to join?",
          emoji: "🎟",
          action: () => {
            onChipClick(`How can I join ${selectedEvent.title}?`);
            setShowChips(false);
          },
        },
        {
          id: "other",
          label: "Other events",
          emoji: "👎",
          action: () => {
            onChipClick("Show me other events");
            setShowChips(false);
          },
        },
      ];

      setQuickReplyChips(chips);
      setShowChips(true);
    },
    [selectedEvent]
  );

  /**
   * Handle event card click - store event and auto-send message
   */
  const handleEventCardClick = useCallback(
    (event: HubEvent, onSendMessage: (msg: string) => void) => {
      setSelectedEvent(event);
      const message = `Tell me more about ${event.title}`;
      onSendMessage(message);
      setShowChips(true);
    },
    []
  );

  /**
   * Handle "Ask AI" button click
   */
  const handleAskAI = useCallback(
    (event: HubEvent, onSendMessage: (msg: string) => void) => {
      setSelectedEvent(event);
      const message = `Summarize this event: ${event.title}. Details: ${event.description}. Time: ${event.date} at ${event.time}. Format: ${event.format}.`;
      onSendMessage(message);
    },
    []
  );

  /**
   * Clear selected event and chips
   */
  const clearSelection = useCallback(() => {
    setSelectedEvent(null);
    setQuickReplyChips([]);
    setShowChips(false);
  }, []);

  return {
    selectedEvent,
    setSelectedEvent,
    quickReplyChips,
    showChips,
    setShowChips,
    generateQuickReplies,
    handleEventCardClick,
    handleAskAI,
    clearSelection,
  };
}
