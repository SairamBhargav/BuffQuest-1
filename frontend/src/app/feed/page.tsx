"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuests } from "@/context/QuestContext";

export default function FeedPage() {
  const { quests, claimQuest, openChat } = useQuests();
  const openQuests = quests.filter((q) => q.status === "open");

  return (
    <main className="w-full min-h-[100dvh] bg-[#0a0f1a] text-slate-100 overflow-y-auto pb-32" style={{ paddingTop: 'var(--sat)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 liquid-glass-dark px-6 py-5 flex items-center justify-between border-b border-white/10 rounded-b-[32px]">
        <h1 className="text-xl font-black tracking-wide drop-shadow-md">Campus Feed</h1>
        <div className="bg-yellow-400 text-yellow-900 text-xs px-3 py-1 rounded-[20px] font-black tracking-widest uppercase">
          {openQuests.length} Bounties
        </div>
      </div>

      <div className="p-6 space-y-4">
        {openQuests.length === 0 ? (
          <div className="liquid-glass-dark p-12 rounded-[40px] text-center shadow-lg flex flex-col items-center">
            <span className="text-5xl mb-4">🏜️</span>
            <p className="text-slate-400 font-bold">The board is currently empty.</p>
            <Link href="/" className="mt-4">
               <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white/10 text-white px-6 py-2 rounded-full font-black border border-white/20 uppercase tracking-widest text-sm text-yellow-500 shadow-md">Return to Map</motion.button>
            </Link>
          </div>
        ) : (
          openQuests.map((quest) => (
            <motion.div 
              key={quest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="liquid-glass-dark p-6 rounded-[40px] shadow-lg border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4">
                <span className="text-2xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(255,214,10,0.4)]">
                  {quest.bounty} 💰
                </span>
              </div>

              <div className="pr-12">
                <h3 className="text-xl font-black text-white mb-1 group-hover:text-yellow-400 transition-colors">{quest.title}</h3>
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1">
                  <span>📍</span> {quest.building}
                </p>
                
                <p className="text-slate-400 line-clamp-2 text-sm font-medium mb-6 leading-relaxed">
                  Help out a fellow Buff! This quest needs immediate attention near the campus center. Expect a quick payout upon completion.
                </p>

                <div className="flex gap-3">
                  <motion.button 
                    onClick={() => claimQuest(quest.id)}
                    whileTap={{ scale: 0.9 }} 
                    className="flex-1 squishy-btn text-yellow-900 text-sm font-black py-4 rounded-[24px] uppercase tracking-wider border-2 border-white/40 shadow-xl"
                  >
                    Claim Bounty
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </main>
  );
}
