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

const INITIAL_USER: UserProfile = {
  id: "",
  name: "Loading...",
  email: "",
  credits: 0,
  notoriety: 0,
  isVerifiedStudent: false,
};

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
  {
    id: "q3",
    title: "Return Library Book",
    description: "Need someone to return 'Intro to Algorithms' to the Norlin front desk before 5pm.",
    bounty: 10,
    longitude: -105.272,
    latitude: 40.005,
    status: "open",
    building: "UMC",
    creatorId: "user-4",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "q4",
    title: "Study Partner for Physics",
    description: "Looking for someone to study PHYS 1120 exam material at C4C for about 2 hours.",
    bounty: 20,
    longitude: -105.2635,
    latitude: 40.0043,
    status: "open",
    building: "C4C",
    creatorId: "user-5",
    createdAt: new Date(Date.now() - 900000).toISOString(),
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
  refreshStats: () => void;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export function QuestProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const { data: session } = authClient.useSession();

  const refreshStats = useCallback(() => {
    if (!session?.user) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    fetch(`${apiUrl}/api/users/${session.user.id}`, { cache: "no-store", headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" } })
      .then(res => res.json())
      .then(data => {
        if (data && !data.detail) {
          setUser(prev => ({
            ...prev,
            credits: data.credits ?? prev.credits,
            notoriety: data.notoriety ?? prev.notoriety,
          }));
        }
      })
      .catch(console.error);

    fetch(`${apiUrl}/api/leaderboard/`, { cache: "no-store", headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted: LeaderboardEntry[] = data.map((u: any, index: number) => ({
            rank: index + 1,
            name: u.name || (u.email ? u.email.split("@")[0] : "Unknown User"),
            notoriety: u.notoriety,
            isYou: session.user.id === u.id,
            avatar: index === 0 ? "👑" : index === 1 ? "🧑‍🎓" : index === 2 ? "🥷" : index === 3 ? "🎒" : "📚",
          }));
          setLeaderboard(formatted);
        }
      })
      .catch(console.error);
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      setUser(prev => ({
        ...prev,
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        isVerifiedStudent: session.user.email.endsWith("@colorado.edu"),
      }));
      refreshStats();
    } else {
      setUser(INITIAL_USER);
    }
  }, [session?.user, refreshStats]);

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
        refreshStats,
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
