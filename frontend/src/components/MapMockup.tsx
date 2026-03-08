"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import Link from "next/link";
import CreateQuestModal from "./CreateQuestModal";
import ActiveQuestChat from "./ActiveQuestChat";
import AttendanceDrawer from "./AttendanceDrawer";
import "mapbox-gl/dist/mapbox-gl.css";
import { useQuests, Quest } from "@/context/QuestContext";
import { useToast } from "@/context/ToastContext";

const CU_BOULDER_COORDS = {
  longitude: -105.2705,
  latitude: 40.0076,
  zoom: 14.5,
};

const CU_BOULDER_BOUNDS: [[number, number], [number, number]] = [
  [-105.280, 39.991],
  [-105.235, 40.017],
];

export default function MapMockup() {
  const { quests, user, claimQuest, getActiveQuests } = useQuests();
  const { addToast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

  // Active quest chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatQuest, setActiveChatQuest] = useState<Quest | null>(null);
  const [chatRole, setChatRole] = useState<"creator" | "hunter">("hunter");

  const activeQuests = getActiveQuests();

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const isTokenMissing = !token || token === "YOUR_MAPBOX_TOKEN_HERE";

  const getLightPreset = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 8) return "dawn";
    if (hour >= 8 && hour < 17) return "day";
    if (hour >= 17 && hour < 19) return "dusk";
    return "night";
  };

  const lightPreset = getLightPreset();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const isLightMap = lightPreset === "day" || lightPreset === "dawn";
  const glassChip = isLightMap
    ? "bg-black/50 backdrop-blur-[15px] border border-white/10 shadow-lg text-white"
    : "bg-white/60 backdrop-blur-[15px] border border-white/40 shadow-lg text-slate-900";
  const chipLabel = isLightMap
    ? "text-white/70"
    : "text-slate-500";

  const openQuests = quests.filter(q => q.status === 'open');

  const handleClaim = (quest: Quest) => {
    claimQuest(quest.id);
    setSelectedQuest(null);
    addToast(`Quest claimed: "${quest.title}"`, "success");

    // Open the chat session for the newly claimed quest
    setTimeout(() => {
      const updatedQuest = { ...quest, status: "claimed" as const, hunterId: user.id };
      setActiveChatQuest(updatedQuest);
      setChatRole("hunter");
      setIsChatOpen(true);
    }, 500);
  };

  const openActiveQuestChat = (quest: Quest) => {
    setActiveChatQuest(quest);
    setChatRole(quest.creatorId === user.id ? "creator" : "hunter");
    setIsChatOpen(true);
  };

  return (
    <div className="relative w-full h-full bg-gray-900">
      {isTokenMissing && (
        <div className="absolute z-50 top-4 left-1/2 -translate-x-1/2 liquid-glass-red text-red-300 px-6 py-3 rounded-2xl shadow-lg font-bold flex flex-col items-center">
          <span>Mapbox Token Missing!</span>
          <span className="text-sm font-normal text-red-300/70">
            Please add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
          </span>
        </div>
      )}

      {/* ─── Map Overlay Header ─── */}
      <div className="absolute z-10 top-0 left-0 w-full p-4 sm:p-6 pointer-events-none flex justify-between items-start" style={{ paddingTop: 'max(var(--sat), 1rem)' }}>
        <div className="flex gap-2 sm:gap-4 mt-1 sm:mt-2 flex-wrap">
          {/* Credits Chip */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${glassChip} pointer-events-auto px-3 py-2 sm:px-5 sm:py-3 rounded-[40px] font-black flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base`}
          >
            <span className="tracking-tight">{user.credits} <span className={`text-[10px] sm:text-xs ${chipLabel} font-bold uppercase tracking-widest pl-0.5 sm:pl-1`}>Credits</span></span>
          </motion.div>

          {/* Notoriety Chip */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${glassChip} pointer-events-auto px-3 py-2 sm:px-5 sm:py-3 rounded-[40px] font-black flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base`}
          >
            <span className="tracking-tight">{user.notoriety} <span className={`text-[10px] sm:text-xs ${chipLabel} font-bold uppercase tracking-widest pl-0.5 sm:pl-1`}>Notoriety</span></span>
          </motion.div>
        </div>

        {/* Right Side: Attendance + Profile */}
        <div className="flex gap-2 sm:gap-3 mt-1 sm:mt-2 shrink-0">
          {/* Attendance Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAttendanceOpen(true)}
            className={`${glassChip} pointer-events-auto h-11 w-11 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-transform relative`}
          >
            🎓
            {/* Green online dot */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-black/50 orb-pulse-green" />
          </motion.button>

          {/* Profile Avatar */}
          <Link 
            href="/profile" 
            className={`${glassChip} pointer-events-auto h-11 w-11 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-2xl sm:text-3xl hover:scale-105 active:scale-90 transition-transform relative shrink-0`}
          >
            🧑‍🎓
          </Link>
        </div>
      </div>

      {/* ─── Active Quest Indicator (if any) ─── */}
      <AnimatePresence>
        {activeQuests.length > 0 && !isChatOpen && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute z-10 top-20 sm:top-24 left-4 right-4 pointer-events-none flex justify-center"
            style={{ paddingTop: 'var(--sat)' }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => openActiveQuestChat(activeQuests[0])}
              className="pointer-events-auto liquid-glass-dark px-5 py-3 rounded-[28px] flex items-center gap-3 shadow-xl max-w-sm w-full"
            >
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-white font-black text-sm truncate">{activeQuests[0].title}</p>
                <p className="text-slate-400 text-xs font-medium">
                  {activeQuests[0].status === "claimed" ? "In Progress" : "Awaiting Verification"} · {activeQuests[0].bounty} 💰
                </p>
              </div>
              <span className="text-yellow-400 font-black text-xs uppercase tracking-widest shrink-0">Open</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mapbox ─── */}
      <Map
        reuseMaps
        mapboxAccessToken={isTokenMissing ? "" : token}
        initialViewState={{
          longitude: CU_BOULDER_COORDS.longitude,
          latitude: CU_BOULDER_COORDS.latitude,
          zoom: 15,
          pitch: 60,
          bearing: -17.6,
        }}
        maxBounds={CU_BOULDER_BOUNDS}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/standard"
        maxPitch={85}
        minZoom={14}
        maxZoom={20}
        logoPosition="bottom-left"
        attributionControl={true}
        onLoad={(e: any) => {
          const map = e.target;
          try {
            map.setConfigProperty('basemap', 'lightPreset', lightPreset);
          } catch (e) {}
          
          map.on('style.load', () => {
            map.setConfigProperty('basemap', 'lightPreset', lightPreset);
          });
        }}
      >
        {/* ─── Quest Markers ─── */}
        {openQuests.map((quest) => (
          <Marker
            key={quest.id}
            longitude={quest.longitude}
            latitude={quest.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedQuest(quest);
            }}
          >
            <div 
              className="cursor-pointer flex flex-col items-center group relative pt-4 hover:scale-110 active:scale-95 transition-transform duration-200"
            >
              {/* Hover Label */}
              <div className="absolute -top-6 bg-yellow-400 text-yellow-900 font-black px-3 py-1 rounded-[20px] text-xs shadow-xl border-2 border-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 whitespace-nowrap">
                +{quest.bounty} 💰
              </div>
              
              {/* Orb */}
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className="absolute inset-0 rounded-full bg-yellow-400 orb-pulse"></div>
                <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),_0_4px_8px_rgba(255,214,10,0.5)] border-2 border-white z-10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/80"></div>
                </div>
              </div>
            </div>
          </Marker>
        ))}

        {/* ─── Quest Popup ─── */}
        <AnimatePresence>
          {selectedQuest && (
            <Popup
              longitude={selectedQuest.longitude}
              latitude={selectedQuest.latitude}
              anchor="bottom"
              offset={24}
              onClose={() => setSelectedQuest(null)}
              closeOnClick={false}
              closeButton={false}
              className="liquid-popup"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="liquid-glass p-5 text-slate-900 w-72 rounded-[32px]"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-extrabold text-[1.1rem] leading-tight tracking-tight text-slate-800 drop-shadow-sm flex-1">{selectedQuest.title}</h3>
                  <button onClick={() => setSelectedQuest(null)} className="text-slate-400 hover:text-slate-600 bg-white/40 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs backdrop-blur-sm shrink-0 ml-2">✕</button>
                </div>

                <p className="text-xs text-slate-500 mb-2 font-medium">📍 {selectedQuest.building}</p>

                {selectedQuest.description && (
                  <p className="text-sm text-slate-600 mb-3 leading-relaxed line-clamp-3">{selectedQuest.description}</p>
                )}
                
                <p className="text-yellow-600 font-black mb-4 flex items-center gap-1 text-sm bg-yellow-500/10 w-max px-3 py-1 rounded-xl">
                  <span className="drop-shadow-sm">💰</span> {selectedQuest.bounty} Credits
                </p>
                <motion.button 
                  whileTap={{ scale: 0.94 }}
                  className="w-full squishy-btn text-yellow-900 font-black py-3 rounded-[24px] uppercase tracking-wider text-sm border-2 border-white/60"
                  onClick={() => handleClaim(selectedQuest)}
                >
                  Claim Quest
                </motion.button>
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>

      {/* ─── Bottom Action Buttons ─── */}
      <div className="absolute z-10 bottom-6 sm:bottom-8 left-0 w-full pointer-events-none flex items-start justify-center" style={{ paddingBottom: 'var(--sab)' }}>
        <motion.div 
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.9, y: 2 }}
          className="pointer-events-auto"
        >
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="squishy-btn text-yellow-900 px-6 py-4 sm:px-8 sm:py-5 rounded-[40px] font-black text-base sm:text-[1.1rem] uppercase tracking-widest border-2 border-white/80 flex items-center gap-2 sm:gap-3 whitespace-nowrap"
          >
            <span className="text-xl sm:text-2xl drop-shadow-sm inner-glow-text text-white">✚</span> POST QUEST
          </button>
        </motion.div>
      </div>

      {/* ─── Modals & Drawers ─── */}
      <CreateQuestModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      <AttendanceDrawer
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
      />

      <ActiveQuestChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        quest={activeChatQuest}
        role={chatRole}
      />
    </div>
  );
}
