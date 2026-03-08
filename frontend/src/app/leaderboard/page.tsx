"use client";

import React from "react";
import { motion } from "framer-motion";

const ME = { name: "Ralphie", ranking: 2, score: 12, avatar: "🧑‍🎓" };

const LEADERS = [
  { name: "Chip", score: 89, color: "text-yellow-400", avatar: "👑", bg: "bg-yellow-400/10", border: "border-yellow-400/30" },
  { name: "Ralphie", score: 12, color: "text-purple-400", avatar: "🧑‍🎓", bg: "bg-purple-500/10", border: "border-purple-500/30", isMe: true },
  { name: "SkoBuffs", score: 8, color: "text-orange-400", avatar: "🐃", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  { name: "Flatirons4Life", score: 5, color: "text-slate-400", avatar: "⛰️", bg: "bg-slate-500/10", border: "border-slate-500/30" },
  { name: "BuffFanatic", score: 3, color: "text-slate-500", avatar: "🍕", bg: "bg-slate-700/10", border: "border-slate-700/30" },
];

export default function LeaderboardPage() {
  return (
    <main className="w-full min-h-[100dvh] bg-[#0a0f1a] text-slate-100 overflow-y-auto pb-32" style={{ paddingTop: 'var(--sat)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 liquid-glass-dark px-6 py-5 flex flex-col border-b border-white/10 rounded-b-[32px]">
        <h1 className="text-xl font-black tracking-wide drop-shadow-md">Campus Prestige</h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Live Rankings • CU Boulder</p>
      </div>

      <div className="p-6">
        {/* Your Rank Card */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="liquid-glass-dark p-8 rounded-[50px] mb-10 text-center border-2 border-purple-500/20 shadow-[0_20px_40px_rgba(168,85,247,0.15)] bg-gradient-to-b from-purple-500/5 to-transparent"
        >
          <span className="text-5xl mb-2 block drop-shadow-lg">{ME.avatar}</span>
          <h2 className="text-3xl font-black tracking-tighter mb-1">Rank #{ME.ranking}</h2>
          <p className="text-purple-400 font-black uppercase tracking-widest text-xs">{ME.score} Notoriety Points</p>
          <div className="mt-4 flex justify-center">
            <div className="bg-white/5 px-6 py-1.5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
               Top 5% on Campus
            </div>
          </div>
        </motion.div>

        {/* Leaders List */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-4 mb-2">Global Ranking</h3>
          {LEADERS.map((user, idx) => (
            <motion.div 
              key={user.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className={`liquid-glass-dark flex items-center p-5 rounded-[40px] shadow-xl border ${user.isMe ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/5'}`}
            >
              <span className={`w-8 font-black text-2xl text-center mr-4 ${user.color} drop-shadow-md`}>{idx + 1}</span>
              <span className="text-4xl mr-5 filter drop-shadow-md">{user.avatar}</span>
              <div className="flex-1">
                <span className="font-black text-white text-lg block tracking-tight">
                    {user.name} {user.isMe && <span className="text-[10px] text-slate-500 opacity-60 ml-1">(YOU)</span>}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest opacity-60`}>Level {Math.floor(user.score / 10) + 1} Buff</span>
              </div>
              <div className={`${user.bg} ${user.border} border px-4 py-1.5 rounded-[20px] shadow-inner`}>
                <span className={`font-black ${user.color} tracking-tight text-lg`}>{user.score} 🔥</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
