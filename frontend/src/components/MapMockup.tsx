"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Map, { Marker, Popup, Source, Layer } from "react-map-gl/mapbox";
import Link from "next/link";
import CreateQuestModal from "./CreateQuestModal";
import "mapbox-gl/dist/mapbox-gl.css";
import { useQuests, Quest } from "@/context/QuestContext";

const CU_BOULDER_COORDS = {
  longitude: -105.2705,
  latitude: 40.0076,
  zoom: 14.5,
};

// Exact Bounding box from user screenshot (Main Campus, East Campus, Williams Village)
// Format: [ [westLng, southLat], [eastLng, northLat] ]
const CU_BOULDER_BOUNDS: [[number, number], [number, number]] = [
  [-105.280, 39.991], // Southwest coordinates (Broadway & Moorhead / Will Vill border)
  [-105.235, 40.017], // Northeast coordinates (Past SEEC / Colorado Ave limit)
];

const CU_BUILDINGS = [
  { name: "Norlin Library", lng: -105.273, lat: 40.0085 },
  { name: "Duane Physics", lng: -105.267, lat: 40.006 },
  { name: "UMC", lng: -105.272, lat: 40.005 },
  { name: "Engineering Center", lng: -105.263, lat: 40.0065 },
  { name: "C4C", lng: -105.265, lat: 40.002 },
];

// Geofence Polygons for Buildings
const GEOFENCES: any = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-105.274, 40.009], [-105.272, 40.009], [-105.272, 40.008], [-105.274, 40.008], [-105.274, 40.009]
        ]]
      },
      properties: { name: 'Norlin Zone' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-105.273, 40.0055], [-105.271, 40.0055], [-105.271, 40.0045], [-105.273, 40.0045], [-105.273, 40.0055]
        ]]
      },
      properties: { name: 'UMC Zone' }
    }
  ]
};

function getNearestBuilding(lng: number, lat: number) {
  let nearest = CU_BUILDINGS[0];
  let minDistance = Infinity;
  for (const b of CU_BUILDINGS) {
    const d = Math.sqrt(Math.pow(b.lng - lng, 2) + Math.pow(b.lat - lat, 2));
    if (d < minDistance) {
      minDistance = d;
      nearest = b;
    }
  }
  return nearest.name;
}

export default function MapMockup() {
  const { quests, claimQuest, openChat, setIsCheckInOpen } = useQuests();
  const [userLocation, setUserLocation] = useState<{lng: number, lat: number} | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Location Picker State
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{lng: number, lat: number} | null>(null);
  const [detectedBuilding, setDetectedBuilding] = useState<string>("Norlin Library");

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
    
    // Watch User Location
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  if (!isClient) return null;

  const isLightMap = lightPreset === "day" || lightPreset === "dawn";
  const glassChip = isLightMap
    ? "bg-black/50 backdrop-blur-[15px] border border-white/10 shadow-lg text-white"
    : "bg-white/60 backdrop-blur-[15px] border border-white/40 shadow-lg text-slate-900";
  const chipLabel = isLightMap
    ? "text-white/70"
    : "text-slate-500";

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
      <div className="absolute z-10 top-0 left-0 w-full p-4 sm:p-6 pointer-events-none flex justify-between items-start" style={{ paddingTop: 'max(var(--sat), 1rem)' }}>
        <div className="flex gap-2 sm:gap-4 mt-1 sm:mt-2 flex-wrap">
          {/* Adaptive Glass Stats Cards */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${glassChip} pointer-events-auto px-3 py-2 sm:px-5 sm:py-3 rounded-[40px] font-black flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base`}
          >
            <span className="tracking-tight">250 <span className={`text-[10px] sm:text-xs ${chipLabel} font-bold uppercase tracking-widest pl-0.5 sm:pl-1`}>Credits</span></span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${glassChip} pointer-events-auto px-3 py-2 sm:px-5 sm:py-3 rounded-[40px] font-black flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base`}
          >
            <span className="tracking-tight">12 <span className={`text-[10px] sm:text-xs ${chipLabel} font-bold uppercase tracking-widest pl-0.5 sm:pl-1`}>Notoriety</span></span>
          </motion.div>
        </div>

        {/* Squishy Profile Avatar */}
        <Link 
          href="/profile" 
          className={`${glassChip} pointer-events-auto h-11 w-11 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-2xl sm:text-3xl hover:scale-105 active:scale-90 transition-transform mt-1 sm:mt-2 relative shrink-0`}
        >
          🧑‍🎓
        </Link>
      </div>

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
        dragRotate={true}
        touchZoomRotate={true}
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
        onClick={(e) => {
          if (isPickingLocation) {
            const nearest = getNearestBuilding(e.lngLat.lng, e.lngLat.lat);
            setPickedLocation({ lng: e.lngLat.lng, lat: e.lngLat.lat });
            setDetectedBuilding(nearest);
            setIsPickingLocation(false);
            setIsCreateModalOpen(true);
          } else {
            setSelectedQuest(null);
          }
        }}
        cursor={isPickingLocation ? "crosshair" : "grab"}
      >
        {/* Visual Geofences ... */}
        <Source id="geofences" type="geojson" data={GEOFENCES}>
          <Layer
            id="geofence-fill"
            type="fill"
            paint={{
              'fill-color': '#fbbf24',
              'fill-opacity': 0.1,
            }}
          />
          <Layer
            id="geofence-outline"
            type="line"
            paint={{
              'line-color': '#fbbf24',
              'line-width': 2,
              'line-dasharray': [2, 2],
              'line-opacity': 0.3,
            }}
          />
        </Source>

        {/* User Location Marker */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div className="relative flex items-center justify-center w-6 h-6">
              <div className="absolute inset-0 bg-blue-500/40 rounded-full animate-ping" />
              <div className="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
            </div>
          </Marker>
        )}
        
        {/* Render Quest Markers ... */}
        {quests.filter(q => q.status !== 'completed').map((quest) => (
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
            <div className="cursor-pointer flex flex-col items-center group relative pt-4 hover:scale-110 active:scale-95 transition-transform duration-200">
              <div className="absolute -top-6 bg-yellow-400 text-yellow-900 font-black px-3 py-1 rounded-[20px] text-xs shadow-xl border-2 border-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                +{quest.bounty} 💰
              </div>
              
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className={`absolute inset-0 rounded-full ${quest.status === 'claimed' ? 'bg-blue-400 opacity-40' : 'bg-yellow-400 orb-pulse'}`}></div>
                <div className={`relative w-6 h-6 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border-2 border-white z-10 flex items-center justify-center ${
                  quest.status === 'claimed' 
                    ? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_4px_8px_rgba(59,130,246,0.5)]" 
                    : "bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-[0_4px_8px_rgba(255,214,10,0.5)]"
                }`}>
                  <div className={`w-2 h-2 rounded-full ${quest.status === 'claimed' ? "bg-white/40" : "bg-white/80"}`}></div>
                </div>
                {quest.status === 'claimed' && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow-sm z-20">
                    🔒
                  </div>
                )}
              </div>
            </div>
          </Marker>
        ))}

        {/* Enhanced Liquid Glass Popup ... */}
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
                {selectedQuest.status === 'open' ? (
                  <motion.button 
                    whileTap={{ scale: 0.94 }}
                    className="w-full squishy-btn text-yellow-900 font-black py-3 rounded-[24px] uppercase tracking-wider text-sm border-2 border-white/60"
                    onClick={() => {
                      claimQuest(selectedQuest.id);
                      setSelectedQuest(null);
                    }}
                  >
                    Claim Quest
                  </motion.button>
                ) : (
                  <motion.button 
                    whileTap={{ scale: 0.94 }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-3 rounded-[24px] uppercase tracking-wider text-sm shadow-lg transition-colors flex items-center justify-center gap-2"
                    onClick={() => {
                      openChat(selectedQuest.id);
                      setSelectedQuest(null);
                    }}
                  >
                    <span>💬</span> Message Creator
                  </motion.button>
                )}
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>

      {/* Floating Auxiliary Actions (Right Side) */}
      <div className="absolute z-10 bottom-36 right-6 pointer-events-none flex flex-col gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCheckInOpen(true)}
          className="pointer-events-auto w-14 h-14 rounded-full liquid-glass-dark border border-white/20 flex flex-col items-center justify-center shadow-2xl relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse group-hover:bg-blue-500/20 transition-colors" />
          <span className="text-2xl relative z-10 pt-1">📍</span>
          <span className="text-[7px] font-black text-blue-400 uppercase tracking-tighter relative z-10 pb-1">Presence</span>
        </motion.button>
      </div>

      {/* Hero Action Center (Bottom Central) */}
      <div className="absolute z-10 bottom-28 left-0 w-full pointer-events-none flex flex-col items-center" style={{ paddingBottom: 'var(--sab)' }}>
        <AnimatePresence mode="wait">
          {isPickingLocation ? (
            <motion.div
              key="picker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="pointer-events-auto liquid-glass-dark px-6 py-4 rounded-full flex items-center gap-4 text-white shadow-2xl border border-yellow-400/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-yellow-400/10 animate-pulse"></div>
              <div className="relative flex items-center gap-3">
                <span className="text-xl animate-bounce tracking-tight drop-shadow-md">👇</span>
                <span className="font-black uppercase tracking-widest text-sm text-yellow-50 drop-shadow-sm">Tap map to set location</span>
                <button 
                  onClick={() => setIsPickingLocation(false)}
                  className="ml-2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.9, y: 2 }}
              className="pointer-events-auto"
            >
              <button 
                onClick={() => setIsPickingLocation(true)}
                className="squishy-btn text-yellow-900 px-8 py-5 rounded-[40px] font-black text-lg uppercase tracking-widest border-2 border-white/80 flex items-center gap-3 shadow-[0_15px_30px_rgba(255,214,10,0.3)]"
              >
                <span className="text-2xl drop-shadow-sm inner-glow-text text-white">✚</span> POST QUEST
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quest Creation Overlay */}
      <CreateQuestModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        initialLocation={pickedLocation}
        detectedBuilding={detectedBuilding}
      />
    </div>
  );
}
