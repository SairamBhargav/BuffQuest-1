"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import axios from "axios";
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
  buildingName: string;
  buildingZoneId: number;
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
  is_verified_student: boolean;
}

export interface BuildingZone {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  notoriety: number;
  isYou: boolean;
  avatar: string;
}

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
  // Ensure we don't accidentally append a trailing slash if we use an empty path
  // or relative path
});

api.interceptors.request.use(async (config) => {
  const session = await authClient.getSession();
  if (session?.data?.session?.token) {
    config.headers.Authorization = `Bearer ${session.data.session.token}`;
  }
  return config;
});

interface QuestContextType {
  quests: Quest[];
  user: UserProfile | null;
  buildingZones: BuildingZone[];
  leaderboard: LeaderboardEntry[];
  addQuest: (quest: { title: string; description: string; bounty: number; buildingZoneId: number }) => Promise<{ success: boolean; error?: string }>;
  claimQuest: (id: string) => void;
  completeQuest: (id: string) => void;
  verifyQuest: (id: string) => void;
  cancelQuest: (id: string) => void;
  getActiveQuests: () => Quest[];
  getMyQuests: () => Quest[];
  fetchBuildingZones: () => Promise<void>;
  attendanceCheckIn: (data: { buildingZoneId: number; className: string; scheduleImageUrl: string; classPhotoUrl: string; scheduledStartTime: string }) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export function QuestProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [buildingZones, setBuildingZones] = useState<BuildingZone[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBuildingZones = useCallback(async () => {
    console.log("DEBUG: fetchBuildingZones started");
    try {
      const res = await api.get<BuildingZone[]>("/building-zones");
      console.log("DEBUG: fetchBuildingZones success", res.data);
      setBuildingZones(res.data || []);
    } catch (e) {
      console.error("DEBUG: Failed to fetch building zones:", e);
    }
  }, []);

  const fetchState = useCallback(async () => {
    console.log("DEBUG: fetchState started");
    try {
      await fetchBuildingZones();
      console.log("DEBUG: fetchBuildingZones done");
      const questsRes = await api.get<Quest[]>("/quests").catch((e) => {
        console.error("DEBUG: quests fetch failed", e);
        return { data: [] };
      });
      console.log("DEBUG: questsRes", questsRes.data);
      setQuests(questsRes.data || []);

      console.log("DEBUG: getting session");
      const session = await authClient.getSession();
      console.log("DEBUG: session", session);
      if (session?.data?.session?.token) {
        const userRes = await api.get<UserProfile>("/users/me").catch((e) => {
          console.error("DEBUG: user/me fetch failed", e);
          return { data: null };
        });
        console.log("DEBUG: userRes", userRes.data);
        setUser(userRes.data || null);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("DEBUG: Failed to fetch initial state:", e);
    } finally {
      console.log("DEBUG: setting loading false");
      setLoading(false);
    }
  }, [fetchBuildingZones]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);


  const addQuest = useCallback(async (questData: { title: string; description: string; bounty: number; buildingZoneId: number }) => {
    try {
       const res = await api.post<Quest>("/quests", {
         title: questData.title,
         description: questData.description,
         reward_credits: questData.bounty,
         cost_credits: questData.bounty,
         reward_notoriety: 1,
         building_zone_id: questData.buildingZoneId,
       });
       setQuests((prev) => [res.data, ...prev]);
       if (user) {
         setUser((prev) => prev ? { ...prev, credits: prev.credits - questData.bounty } : prev);
       }
       return { success: true };
    } catch (error: any) {
       return { success: false, error: error.response?.data?.detail || "Failed to create quest" };
    }
  }, [user]);

  const claimQuest = useCallback(async (id: string) => {
    try {
      const res = await api.post<Quest>(`/quests/${id}/claim`);
      setQuests((prev) => prev.map((q) => (q.id === id ? res.data : q)));
    } catch (error) {
       console.error("Failed to claim quest", error);
    }
  }, []);

  const completeQuest = useCallback(async (id: string) => {
    try {
      const res = await api.post<Quest>(`/quests/${id}/complete`);
      setQuests((prev) => prev.map((q) => (q.id === id ? res.data : q)));
    } catch (error) {
       console.error("Failed to complete quest", error);
    }
  }, []);

  const verifyQuest = useCallback(async (id: string) => {
    try {
      const res = await api.post<Quest>(`/quests/${id}/verify`);
      setQuests((prev) => prev.map((q) => (q.id === id ? res.data : q)));
      fetchState(); // refresh user stats
    } catch (error) {
       console.error("Failed to verify quest", error);
    }
  }, [fetchState]);

  const cancelQuest = useCallback(async (id: string) => {
    try {
      const res = await api.post<Quest>(`/quests/${id}/cancel`);
      setQuests((prev) => prev.map((q) => (q.id === id ? res.data : q)));
      fetchState(); // refund credits
    } catch (error) {
      console.error("Failed to cancel quest", error);
    }
  }, [fetchState]);

  const attendanceCheckIn = useCallback(async (data: { buildingZoneId: number; className: string; scheduleImageUrl: string; classPhotoUrl: string; scheduledStartTime: string }) => {
    try {
      await api.post("/attendance/check-in", {
        building_zone_id: data.buildingZoneId,
        class_name: data.className,
        schedule_image_url: data.scheduleImageUrl,
        class_photo_url: data.classPhotoUrl,
        scheduled_start_time: data.scheduledStartTime,
      });
      fetchState(); // Refresh user stats (credits)
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || "Failed to submit attendance" };
    }
  }, [fetchState]);

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
    return quests.filter((q) => q.creatorId === user.id && q.status !== "cancelled" && q.status !== "verified");
  }, [quests, user]);

  return (
    <QuestContext.Provider
      value={{
        quests,
        user,
        buildingZones,
        leaderboard,
        addQuest,
        claimQuest,
        completeQuest,
        verifyQuest,
        cancelQuest,
        getActiveQuests,
        getMyQuests,
        fetchBuildingZones,
        attendanceCheckIn,
        loading,
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
