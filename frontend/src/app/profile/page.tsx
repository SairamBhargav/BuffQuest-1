"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ProfilePage() {
  return (
    <main className="w-full min-h-[100dvh] bg-[#0a0f1a] text-slate-100 overflow-y-auto pb-10" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="relative w-full">
        
        {/* Antigravity Header */}
        <div className="sticky top-0 z-20 liquid-glass-dark px-6 py-5 flex items-center border-b border-white/10 rounded-b-[32px]">
          <Link href="/" className="text-2xl hover:scale-110 active:scale-90 transition-transform -ml-2 mr-4 bg-white/10 w-10 h-10 flex items-center justify-center rounded-full">
            ⬅️
          </Link>
          <h1 className="text-xl font-black tracking-wide drop-shadow-md">Ralphie's Profile</h1>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-8 mt-2">
          
          {/* Stats Cards with Bouncy Physics */}
          <section className="grid grid-cols-2 gap-4">
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="liquid-glass-dark p-6 rounded-[40px] flex flex-col items-center justify-center text-center shadow-xl"
            >
              <span className="text-4xl mb-2 inner-glow-text drop-shadow-[0_0_12px_rgba(255,214,10,0.8)]">💰</span>
              <span className="text-3xl font-black text-white drop-shadow-md tracking-tight">250</span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Credits</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="liquid-glass-dark p-6 rounded-[40px] flex flex-col items-center justify-center text-center shadow-xl"
            >
              <span className="text-4xl mb-2 inner-glow-text drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">🔥</span>
              <span className="text-3xl font-black text-white drop-shadow-md tracking-tight">12</span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Notoriety</span>
            </motion.div>
          </section>

          {/* Active Quests Section */}
          <section>
            <h2 className="text-lg font-black text-white mb-4 flex items-center space-x-3 drop-shadow-sm px-2">
              <span>Active Quests</span>
              <span className="bg-yellow-400 text-yellow-900 text-xs px-3 py-1 rounded-[20px] font-black tracking-widest">1</span>
            </h2>
            <div className="space-y-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="liquid-glass-dark p-5 rounded-[40px] shadow-lg border-l-4 border-yellow-400 border-opacity-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-[1.1rem]">Need Calc 2 Notes</h3>
                  <span className="font-black text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-[20px] shadow-sm tracking-tight border border-yellow-400/20">25 💰</span>
                </div>
                <p className="text-sm text-slate-400 flex items-center gap-1 mb-4 font-medium tracking-wide">
                  <span>📍</span> Duane Physics
                </p>
                <div className="flex gap-3">
                  <motion.button whileTap={{ scale: 0.9 }} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-black py-3 rounded-[24px] transition-colors border border-white/10 uppercase tracking-wider">Chat</motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} className="flex-1 squishy-btn text-yellow-900 text-sm font-black py-3 rounded-[24px] uppercase tracking-wider">Complete</motion.button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Leaderboard Snippet */}
          <section>
            <h2 className="text-lg font-black text-white mb-4 px-2 drop-shadow-sm">Campus Leaderboard</h2>
            <div className="liquid-glass-dark rounded-[40px] overflow-hidden shadow-xl border border-white/10">
              <motion.div whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }} className="flex items-center p-5 border-b border-white/5 transition-colors">
                <span className="font-black text-yellow-400 w-8 text-lg text-center drop-shadow-md">1</span>
                <span className="text-3xl mr-4 drop-shadow-md">👑</span>
                <span className="font-bold text-white flex-1 text-lg">Chip</span>
                <span className="font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-[20px] border border-purple-500/20 tracking-tight">89 🔥</span>
              </motion.div>
              <motion.div whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }} className="flex items-center p-5 border-b border-white/5 bg-white/5 transition-colors">
                <span className="font-black text-slate-400 w-8 text-lg text-center drop-shadow-md">2</span>
                <span className="text-3xl mr-4 drop-shadow-md">🧑‍🎓</span>
                <span className="font-bold text-white flex-1 text-lg tracking-wide">Ralphie <span className="text-slate-500 text-sm ml-1">(You)</span></span>
                <span className="font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-[20px] border border-purple-500/20 tracking-tight">12 🔥</span>
              </motion.div>
              <motion.div whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }} className="flex items-center p-5 transition-colors">
                <span className="font-black text-orange-400 w-8 text-lg text-center drop-shadow-md">3</span>
                <span className="text-3xl mr-4 drop-shadow-md">🥷</span>
                <span className="font-bold text-white flex-1 text-lg">Anonymous</span>
                <span className="font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-[20px] border border-purple-500/20 tracking-tight">8 🔥</span>
              </motion.div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
