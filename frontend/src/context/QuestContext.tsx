"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type QuestStatus = "open" | "claimed" | "completed";

export interface Quest {
  id: string;
  title: string;
  bounty: number;
  longitude: number;
  latitude: number;
  status: QuestStatus;
  building: string;
}

const INITIAL_QUESTS: Quest[] = [
  {
    id: "q1",
    title: "Coffee Run to Norlin",
    bounty: 15,
    longitude: -105.273,
    latitude: 40.0085,
    status: "open",
    building: "Norlin Library",
  },
  {
    id: "q2",
    title: "Need Calc 2 Notes",
    bounty: 25,
    longitude: -105.267,
    latitude: 40.006,
    status: "claimed",
    building: "Duane Physics",
  },
  {
    id: "q3",
    title: "Return library book",
    bounty: 10,
    longitude: -105.272,
    latitude: 40.005,
    status: "open",
    building: "UMC",
  },
];

interface QuestContextType {
  quests: Quest[];
  activeQuestId: string | null;
  isChatOpen: boolean;
  addQuest: (quest: Quest) => void;
  claimQuest: (id: string) => void;
  completeQuest: (id: string) => void;
  openChat: (questId: string) => void;
  closeChat: () => void;
  isCompletionOpen: boolean;
  setIsCompletionOpen: (open: boolean) => void;
  isVerificationOpen: boolean;
  setIsVerificationOpen: (open: boolean) => void;
  isCheckInOpen: boolean;
  setIsCheckInOpen: (open: boolean) => void;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export function QuestProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  const addQuest = (quest: Quest) => {
    setQuests((prev) => [...prev, quest]);
  };

  const claimQuest = (id: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "claimed" } : q))
    );
  };

  const completeQuest = (id: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "completed" } : q))
    );
  };

  const openChat = (id: string) => {
    setActiveQuestId(id);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <QuestContext.Provider
      value={{
        quests,
        activeQuestId,
        isChatOpen,
        addQuest,
        claimQuest,
        completeQuest,
        openChat,
        closeChat,
        isCompletionOpen,
        setIsCompletionOpen,
        isVerificationOpen,
        setIsVerificationOpen,
        isCheckInOpen,
        setIsCheckInOpen,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
}

export function useQuests() {
  const context = useContext(QuestContext);
  if (context === undefined) {
    throw new Error("useQuests must be used within a QuestProvider");
  }
  return context;
}
