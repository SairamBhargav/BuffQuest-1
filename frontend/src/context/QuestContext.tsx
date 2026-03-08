"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

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

const API_BASE = "http://127.0.0.1:8000/api";

const fetchOpts = (method: string, body?: any) => {
  const opts: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };
  if (body) {
    opts.body = JSON.stringify(body);
  }
  return opts;
};

export function QuestProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      // Fetch User
      const userRes = await fetch(`${API_BASE}/users/me`, fetchOpts("GET"));
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(normalizeUser(userData));
      } else {
        setUser(null);
      }

      // Fetch Quests
      const questsRes = await fetch(`${API_BASE}/quests/?limit=100`, fetchOpts("GET"));
      if (questsRes.ok) {
        const questsData = await questsRes.json();
        setQuests(questsData.map(normalizeQuest));
      }

      // Fetch Leaderboard (if exists, fallback to empty)
      const lbRes = await fetch(`${API_BASE}/leaderboard/`, fetchOpts("GET")).catch(() => null);
      if (lbRes && lbRes.ok) {
        const lbData = await lbRes.json();
        setLeaderboard(lbData);
      } else {
        // Fallback mock leaderboard if missing route
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
  }, []);

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

      const res = await fetch(`${API_BASE}/quests/`, fetchOpts("POST", backendPayload));
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
  }, [user, refreshData]);

  const claimQuest = useCallback(async (id: string) => {
    try {
      await fetch(`${API_BASE}/quests/${id}/claim`, fetchOpts("POST"));
      await refreshData();
    } catch (e) {
      console.error("Failed to claim quest", e);
    }
  }, [refreshData]);

  const completeQuest = useCallback(async (id: string) => {
    try {
      await fetch(`${API_BASE}/quests/${id}/complete`, fetchOpts("POST"));
      await refreshData();
    } catch (e) {
      console.error("Failed to complete quest", e);
    }
  }, [refreshData]);

  const verifyQuest = useCallback(async (id: string) => {
    try {
      await fetch(`${API_BASE}/quests/${id}/verify`, fetchOpts("POST"));
      await fetch(`${API_BASE}/quests/${id}/reward`, fetchOpts("POST"));
      await refreshData();
    } catch (e) {
      console.error("Failed to verify & reward quest", e);
    }
  }, [refreshData]);

  const cancelQuest = useCallback(async (id: string) => {
    try {
      await fetch(`${API_BASE}/quests/${id}/cancel`, fetchOpts("POST"));
      await refreshData();
    } catch (e) {
      console.error("Failed to cancel quest", e);
    }
  }, [refreshData]);

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
