"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export type QuestStatus = "open" | "claimed" | "completed" | "verified" | "cancelled";

export interface Quest {
  id: string;
  title: string;
  description: string;
  bounty: number;
  longitude: number;
  latitude: number;
  status: QuestStatus;
  building: string;
  creatorId: string;
  hunterId?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  credits: number;
  notoriety: number;
  isVerifiedStudent: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  notoriety: number;
  isYou: boolean;
  avatar: string;
}

const DEFAULT_USER: UserProfile = {
  id: "",
  name: "Loading...",
  email: "",
  credits: 0,
  notoriety: 0,
  isVerifiedStudent: false,
};

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Chip", notoriety: 89, isYou: false, avatar: "👑" },
  { rank: 2, name: "Ralphie", notoriety: 12, isYou: false, avatar: "🧑‍🎓" },
  { rank: 3, name: "Anonymous", notoriety: 8, isYou: false, avatar: "🥷" },
  { rank: 4, name: "Alex", notoriety: 6, isYou: false, avatar: "🎒" },
  { rank: 5, name: "Jordan", notoriety: 4, isYou: false, avatar: "📚" },
];

const INITIAL_QUESTS: Quest[] = [
  {
    id: "q1",
    title: "Coffee Run to Norlin",
    description: "Need a large iced coffee from Starbucks delivered to the second floor study area.",
    bounty: 15,
    longitude: -105.273,
    latitude: 40.0085,
    status: "open",
    building: "Norlin Library",
    creatorId: "user-2",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "q2",
    title: "Need Calc 2 Notes",
    description: "Missed today's lecture on series convergence. Need a photo of the notes from MATH 2300.",
    bounty: 25,
    longitude: -105.267,
    latitude: 40.006,
    status: "open",
    building: "Duane Physics",
    creatorId: "user-3",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

interface QuestContextType {
  quests: Quest[];
  user: UserProfile;
  leaderboard: LeaderboardEntry[];
  addQuest: (quest: Omit<Quest, "id" | "status" | "creatorId" | "createdAt">) => { success: boolean; error?: string };
  claimQuest: (id: string) => void;
  completeQuest: (id: string) => void;
  verifyQuest: (id: string) => void;
  cancelQuest: (id: string) => void;
  getActiveQuests: () => Quest[];
  getMyQuests: () => Quest[];
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export function QuestProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [leaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);

  const { data: session } = authClient.useSession();

  // Load user profile from backend API to ensure we have credits/notoriety
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/backend/users/me')
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setUser({
              id: data.id,
              name: data.name || session.user.name,
              email: session.user.email,
              credits: data.credits || 0,
              notoriety: data.notoriety || 0,
              isVerifiedStudent: true,
            });
          }
        })
        .catch(err => console.error("Failed to load user profile", err));
    }
  }, [session?.user?.id]);

  const addQuest = useCallback((questData: Omit<Quest, "id" | "status" | "creatorId" | "createdAt">) => {
    if (user.credits < questData.bounty) {
      return { success: false, error: "Not enough credits to post this quest." };
    }

    const newQuest: Quest = {
      ...questData,
      id: "q-" + Date.now().toString(36),
      status: "open",
      creatorId: user.id,
      createdAt: new Date().toISOString(),
    };

    setQuests((prev) => [newQuest, ...prev]);
    setUser((prev) => ({ ...prev, credits: prev.credits - questData.bounty }));
    return { success: true };
  }, [user.credits, user.id]);

  const claimQuest = useCallback((id: string) => {
    setQuests((prev) =>
      prev.map((q) =>
        q.id === id && q.status === "open"
          ? { ...q, status: "claimed" as QuestStatus, hunterId: user.id }
          : q
      )
    );
  }, [user.id]);

  const completeQuest = useCallback((id: string) => {
    setQuests((prev) =>
      prev.map((q) =>
        q.id === id && q.status === "claimed" ? { ...q, status: "completed" as QuestStatus } : q
      )
    );
  }, []);

  const verifyQuest = useCallback((id: string) => {
    setQuests((prev) => {
      const quest = prev.find((q) => q.id === id);
      if (!quest || quest.status !== "completed") return prev;
      return prev.map((q) =>
        q.id === id ? { ...q, status: "verified" as QuestStatus } : q
      );
    });
    // Award credits and notoriety to the hunter
    const quest = quests.find((q) => q.id === id);
    if (quest) {
      setUser((prev) => ({
        ...prev,
        credits: prev.credits + quest.bounty,
        notoriety: prev.notoriety + 1,
      }));
    }
  }, [quests]);

  const cancelQuest = useCallback((id: string) => {
    setQuests((prev) => {
      const quest = prev.find((q) => q.id === id);
      if (!quest || (quest.status !== "open" && quest.status !== "claimed")) return prev;
      return prev.map((q) =>
        q.id === id ? { ...q, status: "cancelled" as QuestStatus } : q
      );
    });
    // Refund credits if creator cancels their own quest
    const quest = quests.find((q) => q.id === id);
    if (quest && quest.creatorId === user.id) {
      setUser((prev) => ({ ...prev, credits: prev.credits + quest.bounty }));
    }
  }, [quests, user.id]);

  const getActiveQuests = useCallback(() => {
    return quests.filter(
      (q) =>
        (q.status === "claimed" || q.status === "completed") &&
        (q.hunterId === user.id || q.creatorId === user.id)
    );
  }, [quests, user.id]);

  const getMyQuests = useCallback(() => {
    return quests.filter((q) => q.creatorId === user.id && q.status !== "cancelled" && q.status !== "verified");
  }, [quests, user.id]);

  return (
    <QuestContext.Provider
      value={{
        quests,
        user,
        leaderboard,
        addQuest,
        claimQuest,
        completeQuest,
        verifyQuest,
        cancelQuest,
        getActiveQuests,
        getMyQuests,
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
