"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { label: "Map", icon: "🗺️", path: "/" },
  { label: "Feed", icon: "📱", path: "/feed" },
  { label: "Leaderboard", icon: "🏆", path: "/leaderboard" },
  { label: "Profile", icon: "🧑‍🎓", path: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 px-6 pb-8 pointer-events-none" style={{ paddingBottom: 'calc(var(--sab) + 1.5rem)' }}>
      <div className="max-w-md mx-auto liquid-glass-dark rounded-[40px] p-2 flex justify-between items-center shadow-2xl border border-white/10 pointer-events-auto backdrop-blur-[20px]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link key={item.path} href={item.path} className="relative flex-1 group">
              <div className="flex flex-col items-center justify-center py-2 relative z-10 transition-transform active:scale-90">
                <span className={`text-2xl mb-1 ${isActive ? "drop-shadow-[0_0_8px_rgba(255,214,10,0.8)]" : "opacity-60 grayscale-[0.5] group-hover:grayscale-0 group-hover:opacity-100"} transition-all duration-300`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-white" : "text-slate-500"} transition-colors duration-300`}>
                  {item.label}
                </span>
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-white/10 rounded-[32px] border border-white/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
