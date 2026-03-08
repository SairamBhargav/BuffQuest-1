"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyCheckInModal({
  isOpen,
  onClose,
}: DailyCheckInModalProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckIn = async () => {
    setIsProcessing(true);
    // Simulate geolocation & biometric check
    await new Promise(r => setTimeout(r, 2500));
    setIsProcessing(false);
    setIsCheckedIn(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
        >
          <div className="w-full max-w-sm liquid-glass-dark p-10 rounded-[60px] border border-white/20 shadow-2xl text-center relative overflow-hidden">
             {/* Animating bg pulse */}
             {!isCheckedIn && (
               <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
             )}

             <div className="relative z-10">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl border border-white/10 shadow-inner">
                    {isCheckedIn ? "✅" : "📍"}
                  </div>
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight mb-2">Daily Presence</h2>
                <p className="text-slate-400 font-medium text-sm mb-10 leading-relaxed px-4">
                  {isCheckedIn 
                    ? "Presence verified! You've earned +5 Credits for attending your session today."
                    : "Tap to verify your presence at Duane Physics and claim your daily participation 💰."
                  }
                </p>

                {isCheckedIn ? (
                  <motion.button 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    onClick={onClose}
                    className="w-full bg-white/10 text-white font-black py-5 rounded-[32px] uppercase tracking-widest border border-white/20"
                  >
                    Done
                  </motion.button>
                ) : (
                  <motion.button 
                    onClick={handleCheckIn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isProcessing}
                    className="w-full squishy-btn text-yellow-900 font-black py-5 rounded-[32px] uppercase tracking-widest shadow-xl flex justify-center items-center"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                         <div className="w-4 h-4 border-2 border-yellow-900/30 border-t-yellow-900 rounded-full animate-spin" />
                         <span>Verifying...</span>
                      </div>
                    ) : (
                      "Check In"
                    )}
                  </motion.button>
                )}

                <button 
                  onClick={onClose}
                  className="mt-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                  Skip for Now
                </button>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
