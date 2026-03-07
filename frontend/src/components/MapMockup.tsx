"use client";

import React, { useState, useEffect } from "react";
import Map, { Marker, Popup, NavigationControl, GeolocateControl, Source, Layer } from "react-map-gl/mapbox";
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {isTokenMissing && (
        <div className="absolute z-50 top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold flex flex-col items-center">
          <span>Mapbox Token Missing!</span>
          <span className="text-sm font-normal text-red-100">
            Please add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
          </span>
        </div>
      )}

      {/* Map Overlay Header */}
      <div className="absolute z-10 top-0 left-0 w-full p-6 pointer-events-none">
        <h1 className="text-4xl font-black text-black drop-shadow-md pb-2">BuffQuest</h1>
        <div className="flex gap-4 mt-2">
          <div className="bg-white/90 backdrop-blur pointer-events-auto px-4 py-2 rounded-full font-bold shadow flex items-center gap-2 border border-slate-200">
            <span className="text-yellow-500">💰</span> 250 Credits
          </div>
          <div className="bg-white/90 backdrop-blur pointer-events-auto px-4 py-2 rounded-full font-bold shadow flex items-center gap-2 border border-slate-200">
            <span className="text-purple-500">🔥</span> 12 Notoriety
          </div>
        </div>
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
        maxBounds={[
          [-105.3100, 39.9800], // Southwest Coordinates
          [-105.2200, 40.0300]  // Northeast Coordinates
        ]}
        onLoad={(e) => {
          const map = e.target;
          map.setConfigProperty('basemap', 'lightPreset', 'night');
        }}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />

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
            <div className="cursor-pointer transition-transform hover:scale-110 flex flex-col items-center group">
              <div className="bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded-full text-xs shadow-md border-2 border-white translate-y-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                +{quest.bounty}
              </div>
              <div className="text-4xl filter drop-shadow">📍</div>
            </div>
          </Marker>
        ))}

        {selectedQuest && (
          <Popup
            longitude={selectedQuest.longitude}
            latitude={selectedQuest.latitude}
            anchor="top"
            onClose={() => setSelectedQuest(null)}
            closeOnClick={false}
            className="rounded-2xl overflow-hidden"
          >
            <div className="p-4 bg-white text-slate-900 w-64">
              <h3 className="font-bold text-lg leading-tight mb-1">{selectedQuest.title}</h3>
              <p className="text-yellow-600 font-bold mb-4 flex items-center gap-1">
                <span>💰</span> {selectedQuest.bounty} Credits
              </p>
              <button 
                className="w-full bg-black text-white font-bold py-2 rounded-lg hover:bg-gray-800 transition shadow block"
                onClick={() => alert("Claim Quest feature coming soon!")}
              >
                Claim Quest
              </button>
            </div>
          </Popup>
        )}
        {/* Native Mapbox v3 3D Standard Styling will automatically extrude the buildings and trees! */}
      </Map>

      {/* FAB - Create Quest */}
      <div className="absolute z-10 bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
        <button className="bg-yellow-400 text-black px-8 py-4 rounded-full font-black text-xl shadow-xl hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all border-4 border-black">
          + POST QUEST
        </button>
      </div>
    </div>
  );
}
