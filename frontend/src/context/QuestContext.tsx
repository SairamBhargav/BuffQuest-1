"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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
  id: string;
  rank: number;
  name: string;
  notoriety: number;
  isYou: boolean;
  avatar: string;
  display_name?: string;
}

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
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

const getApiBase = () => {
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
  const [quests, setQuests] = useState<Quest[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiBase = getApiBase();

  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  const readJson = useCallback(async (response: Response) => {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return null;
    }
    return response.json();
  }, []);

  // Normalizer functions to map Python snake_case to React camelCase if necessary
  const normalizeQuest = (q: any): Quest => ({
    ...q,
    id: String(q.id),
    bounty: q.reward_credits || q.bounty || 0,
    building: q.building_name || q.building || "Campus Building",
    creatorId: q.creator_id || q.creatorId,
    hunterId: q.hunter_id || q.hunterId,
    createdAt: q.created_at || q.createdAt,
  });

  const normalizeUser = (u: any): UserProfile => ({
    ...u,
    isVerifiedStudent: u.is_verified_student || u.isVerifiedStudent || false,
    name: u.display_name || u.name || "Anonymous Buff",
  });

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
          if (userData && typeof userData === 'object' && userData.id) {
            setUser(normalizeUser(userData));
          } else {
            console.error("Invalid user data received", userData);
            setUser(null);
          }
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
          { id: "chip-id", rank: 1, name: "Chip", notoriety: 89, isYou: false, avatar: "👑" },
          { id: "ralphie-id", rank: 2, name: "Ralphie", notoriety: 12, isYou: true, avatar: "🧑‍🎓" },
          { id: "alex-id", rank: 3, name: "Alex", notoriety: 6, isYou: false, avatar: "🎒" }
        ]);
      }
    } catch (e) {
      console.error("Network error fetching initial QuestContext data", e);
    } finally {
      setIsLoading(false);
    }
  }, [apiBase, readJson]);

  useEffect(() => {
    if (!isSessionLoading) {
      refreshData();
    }
  }, [refreshData, isSessionLoading, session]);

  const addQuest = useCallback(async (questData: any) => {
    if (!user) return { success: false, error: "Please log in first." };
    if (user.credits < questData.bounty) {
      return { success: false, error: "Not enough credits to post this quest." };
    }

    try {
      // First hit AI Moderation Check (Next.js API route)
      const modRes = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: questData.title,
          description: questData.description,
          buildingId: questData.buildingId,
          rewardCredits: questData.bounty,
          creatorId: user.id,
          skipDb: true 
        }),
      });

      const modResult = await modRes.json();

      if (!modRes.ok) {
        return { 
          success: false, 
          error: modResult.detail || modResult.error || "Quest flagged by AI Moderation." 
        };
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
        const errorMsg = resData.detail || resData.error || "Database error creating quest.";
        return { 
          success: false, 
          error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) 
        };
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
        isLoading,
        refreshData,
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
