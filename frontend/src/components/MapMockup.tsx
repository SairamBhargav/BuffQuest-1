"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import Link from "next/link";
import "mapbox-gl/dist/mapbox-gl.css";

const CU_BOULDER_COORDS = {
  longitude: -105.2705,
  latitude: 40.0076,
  zoom: 14.5,
};

// Mock Quests for the UI prototype
const MOCK_QUESTS = [
  {
    id: "q1",
    title: "Coffee Run to Norlin",
    bounty: 15,
    longitude: -105.273,
    latitude: 40.0085,
  },
  {
    id: "q2",
    title: "Need Calc 2 Notes",
    bounty: 25,
    longitude: -105.267,
    latitude: 40.006,
  },
  {
    id: "q3",
    title: "Return library book",
    bounty: 10,
    longitude: -105.272,
    latitude: 40.005,
  },
];

export default function MapMockup() {
  const [isClient, setIsClient] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<any>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const isTokenMissing = !token || token === "YOUR_MAPBOX_TOKEN_HERE";

  // Determine light preset based on current hour
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

  return (
    <div className="relative w-full h-full bg-gray-900">
      {isTokenMissing && (
        <div className="absolute z-50 top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold flex flex-col items-center">
          <span>Mapbox Token Missing!</span>
          <span className="text-sm font-normal text-red-100">
            Please add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
          </span>
        </div>
      )}

      {/* Map Overlay Header */}
      <div className="absolute z-10 top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start">
        <div className="flex gap-4 mt-2">
          {/* Liquid Glass Stats Cards */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="liquid-glass pointer-events-auto px-5 py-3 rounded-[40px] font-black shadow-lg flex items-center gap-2"
          >
            <span className="text-yellow-400 text-xl inner-glow-text drop-shadow-[0_0_8px_rgba(255,214,10,0.8)]">💰</span> 
            <span className="text-slate-800 tracking-tight">250 <span className="text-xs text-slate-500 font-bold uppercase tracking-widest pl-1">Credits</span></span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="liquid-glass pointer-events-auto px-5 py-3 rounded-[40px] font-black shadow-lg flex items-center gap-2"
          >
            <span className="text-purple-500 text-xl inner-glow-text drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">🔥</span> 
            <span className="text-slate-800 tracking-tight">12 <span className="text-xs text-slate-500 font-bold uppercase tracking-widest pl-1">Notoriety</span></span>
          </motion.div>
        </div>

        {/* Squishy Profile Avatar */}
        <Link 
          href="/profile" 
          className="liquid-glass pointer-events-auto h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-3xl hover:scale-105 active:scale-90 transition-transform mt-2 relative border-white/60"
        >
          🧑‍🎓
        </Link>
      </div>

      <Map
        mapboxAccessToken={token}
        initialViewState={CU_BOULDER_COORDS}
        mapStyle="mapbox://styles/mapbox/standard"
        style={{ width: "100%", height: "100%" }}
        pitch={60}
        bearing={-20}
        maxPitch={85}
        minZoom={12.5}
        maxZoom={20}
        logoPosition="bottom-left"
        attributionControl={true}
        maxBounds={[
          [-105.3100, 39.9800], // Southwest Coordinates
          [-105.2200, 40.0300]  // Northeast Coordinates
        ]}
        onLoad={(e) => {
          const map = e.target;
          map.setConfigProperty('basemap', 'lightPreset', lightPreset);
        }}
      >
        {/* Render Quest Markers */}
        {MOCK_QUESTS.map((quest) => (
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
            <motion.div 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="cursor-pointer flex flex-col items-center group relative pt-4"
            >
              {/* Dynamic Bounding Hover Label */}
              <div className="absolute -top-6 bg-yellow-400 text-yellow-900 font-black px-3 py-1 rounded-[20px] text-xs shadow-xl border-2 border-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                +{quest.bounty} 💰
              </div>
              
              {/* Pulse Orb Generation */}
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className="absolute inset-0 rounded-full bg-yellow-400 orb-pulse"></div>
                <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),_0_4px_8px_rgba(255,214,10,0.5)] border-2 border-white z-10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/80"></div>
                </div>
              </div>
            </motion.div>
          </Marker>
        ))}

        {/* Enhanced Liquid Glass Popup */}
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
                className="liquid-glass p-5 text-slate-900 w-64 rounded-[32px]"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-extrabold text-[1.1rem] leading-tight tracking-tight text-slate-800 drop-shadow-sm">{selectedQuest.title}</h3>
                  <button onClick={() => setSelectedQuest(null)} className="text-slate-400 hover:text-slate-600 bg-white/40 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs backdrop-blur-sm">✕</button>
                </div>
                
                <p className="text-yellow-600 font-black mb-4 flex items-center gap-1 text-sm bg-yellow-500/10 w-max px-3 py-1 rounded-xl">
                  <span className="drop-shadow-sm">💰</span> {selectedQuest.bounty} Credits
                </p>
                <motion.button 
                  whileTap={{ scale: 0.94 }}
                  className="w-full squishy-btn text-yellow-900 font-black py-3 rounded-[24px] uppercase tracking-wider text-sm border-2 border-white/60"
                  onClick={() => alert("Antigravity Claim Sequence Initiated!")}
                >
                  Claim Quest
                </motion.button>
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>

      {/* Thumb Zone Drawer Action Area */}
      <div className="absolute z-10 bottom-0 left-0 w-full h-32 liquid-glass-dark rounded-t-[40px] border-t border-white/10 pointer-events-none flex items-start justify-center pt-6">
        {/* Floating Action Bubble */}
        <motion.div 
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.9, y: 2 }}
          className="pointer-events-auto"
        >
          <button className="squishy-btn text-yellow-900 px-8 py-5 rounded-[40px] font-black text-[1.1rem] uppercase tracking-widest border-2 border-white/80 flex items-center gap-3">
            <span className="text-2xl drop-shadow-sm inner-glow-text text-white">✚</span> POST QUEST
          </button>
        </motion.div>
      </div>
    </div>
  );
}
