"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export type QuestStatus = "open" | "claimed" | "completed" | "verified" | "cancelled" | "rewarded";

export interface Quest {
  id: string;
  title: string;
  description: string;
  bounty: number; // For compatibility (backend expects cost_credits/reward_credits)
  cost_credits?: number;
  reward_credits?: number;
  reward_notoriety?: number;
  longitude: number;
  latitude: number;
  status: QuestStatus;
  building: string;
  building_name?: string;
  creatorId?: string;
  creator_id?: string;
  hunterId?: string;
  hunter_id?: string;
  createdAt?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  display_name?: string;
  email: string;
  credits: number;
  notoriety: number;
  isVerifiedStudent: boolean;
  is_verified_student?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  notoriety: number;
  isYou: boolean;
  avatar: string;
  display_name?: string;
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
  user: UserProfile | null;
  leaderboard: LeaderboardEntry[];
  addQuest: (quest: any) => Promise<{ success: boolean; error?: string }>;
  claimQuest: (id: string) => Promise<void>;
  completeQuest: (id: string) => Promise<void>;
  verifyQuest: (id: string) => Promise<void>;
  cancelQuest: (id: string) => Promise<void>;
  getActiveQuests: () => Quest[];
  getMyQuests: () => Quest[];
  refreshStats: () => void;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

const getApiBase = () => {
  const configuredBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configuredBase) {
    return configuredBase.replace(/\/$/, "");
  }

  return "/api/backend";
};

const fetchOpts = (method: string, body?: any) => {
  const headers: HeadersInit = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const opts: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  return opts;
};

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

  const refreshData = useCallback(async () => {
    try {
      const [userResult, questsResult, leaderboardResult] = await Promise.allSettled([
        fetch(`${apiBase}/users/me`, fetchOpts("GET")),
        fetch(`${apiBase}/quests?limit=100`, fetchOpts("GET")),
        fetch(`${apiBase}/leaderboard`, fetchOpts("GET")),
      ]);

      if (userResult.status === "fulfilled") {
        if (userResult.value.ok) {
          const userData = await readJson(userResult.value);
          setUser(userData ? normalizeUser(userData) : null);
        } else if (userResult.value.status === 401) {
          setUser(null);
        } else {
          console.error("Failed to load user profile", userResult.value.status);
          setUser(null);
        }
      } else {
        console.error("Failed to fetch user profile", userResult.reason);
        setUser(null);
      }

      if (questsResult.status === "fulfilled" && questsResult.value.ok) {
        const questsData = await readJson(questsResult.value);
        setQuests(Array.isArray(questsData) ? questsData.map(normalizeQuest) : []);
      } else if (questsResult.status === "rejected") {
        console.error("Failed to fetch quests", questsResult.reason);
      }

      if (leaderboardResult.status === "fulfilled" && leaderboardResult.value.ok) {
        const leaderboardData = await readJson(leaderboardResult.value);
        setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
      } else {
        setLeaderboard([
          { rank: 1, name: "Chip", notoriety: 89, isYou: false, avatar: "👑" },
          { rank: 2, name: "Ralphie", notoriety: 12, isYou: true, avatar: "🧑‍🎓" },
          { rank: 3, name: "Alex", notoriety: 6, isYou: false, avatar: "🎒" }
        ]);
      }
    } catch (e) {
      console.error("Network error fetching initial QuestContext data", e);
    } finally {
      setIsLoading(false);
    }
  }, [apiBase, readJson]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addQuest = useCallback(async (questData: any) => {
    if (!user) return { success: false, error: "Please log in first." };
    if (user.credits < questData.bounty) {
      return { success: false, error: "Not enough credits to post this quest." };
    }

    try {
      // First hit AI Moderation
      const modRes = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...questData, skipDb: true }),
      });
      if (!modRes.ok) {
        const modErr = await modRes.json();
        return { success: false, error: modErr.error || "Quest flagged by AI Moderation." };
      }

      // Then hit FastAPI Backend
      const backendPayload = {
        title: questData.title,
        description: questData.description,
        building_zone_id: questData.buildingId || 1, // Fallback ID
        cost_credits: questData.bounty,
        reward_credits: questData.bounty,
        reward_notoriety: 1,
        moderation_status: "approved",
      };

      const res = await fetch(`${apiBase}/quests`, fetchOpts("POST", backendPayload));
      const resData = await res.json();
      
      if (!res.ok) {
        return { success: false, error: resData.detail || "Database error creating quest." };
      }

      // Refresh data to show new quest
      await refreshData();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Network error submitting quest." };
    }
  }, [apiBase, user, refreshData]);

  const claimQuest = useCallback(async (id: string) => {
    try {
      await fetch(`${apiBase}/quests/${id}/claim`, fetchOpts("POST"));
      await refreshData();
    } catch (e) {
      console.error("Failed to claim quest", e);
    }
  }, [apiBase, refreshData]);

  const completeQuest = useCallback(async (id: string) => {
    try {
      await fetch(`${apiBase}/quests/${id}/complete`, fetchOpts("POST"));
      await refreshData();
    } catch (e) {
      console.error("Failed to complete quest", e);
    }
  }, [apiBase, refreshData]);

  const verifyQuest = useCallback(async (id: string) => {
    try {
      await fetch(`${apiBase}/quests/${id}/verify`, fetchOpts("POST"));
      await fetch(`${apiBase}/quests/${id}/reward`, fetchOpts("POST"));
      await refreshData();
    } catch (e) {
      console.error("Failed to verify & reward quest", e);
    }
  }, [apiBase, refreshData]);

  const cancelQuest = useCallback(async (id: string) => {
    try {
      await fetch(`${apiBase}/quests/${id}/cancel`, fetchOpts("POST"));
      await refreshData();
    } catch (e) {
      console.error("Failed to cancel quest", e);
    }
  }, [apiBase, refreshData]);

  const getActiveQuests = useCallback(() => {
    if (!user) return [];
    return quests.filter(
      (q) =>
        (q.status === "claimed" || q.status === "completed") &&
        (q.hunterId === user.id || q.creatorId === user.id)
    );
  }, [quests, user]);

  const getMyQuests = useCallback(() => {
    if (!user) return [];
    return quests.filter(
      (q) => q.creatorId === user.id && q.status !== "cancelled" && q.status !== "verified" && q.status !== "rewarded"
    );
  }, [quests, user]);

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
