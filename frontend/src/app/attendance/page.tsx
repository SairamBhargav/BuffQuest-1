"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AttendanceOnboarding() {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const nextStep = () => setStep(prev => prev + 1);

  const handleUpload = async () => {
    setIsUploading(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsUploading(false);
    nextStep();
  };

  return (
    <main className="w-full min-h-[100dvh] bg-[#0a0f1a] text-slate-100 flex flex-col p-6 overflow-hidden" style={{ paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }}>
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
           <Link href="/profile" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl hover:scale-110 active:scale-90 transition-transform">⬅️</Link>
           <div className="flex gap-1">
             {[1, 2, 3].map(s => (
               <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-yellow-400' : 'w-2 bg-white/10'}`} />
             ))}
           </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="flex-1 flex flex-col justify-center"
            >
              <span className="text-6xl mb-6 block">🎓</span>
              <h1 className="text-4xl font-black tracking-tighter leading-none mb-4">Verify Your <br /><span className="text-yellow-400">Student Status</span></h1>
              <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10 max-w-[280px]">
                To post bounties or claim high-tier rewards, we need to confirm you're a current Buff. 
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                className="w-full squishy-btn text-yellow-900 font-black py-5 rounded-[32px] uppercase tracking-widest shadow-2xl"
              >
                Get Started
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="flex-1 flex flex-col justify-center"
            >
              <h2 className="text-2xl font-black mb-2">Upload Your Schedule</h2>
              <p className="text-slate-400 font-medium mb-8">Take a screenshot of your weekly portal schedule.</p>
              
              <div 
                onClick={handleUpload}
                className="aspect-square w-full bg-white/5 border-2 border-dashed border-white/20 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400/50 transition-colors group mb-10"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-4">
                     <div className="w-10 h-10 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                     <span className="font-black text-yellow-400 uppercase tracking-widest text-xs">Analyzing PDF...</span>
                  </div>
                ) : (
                  <>
                    <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📄</span>
                    <span className="font-black text-white/40 uppercase tracking-widest text-xs">Select Files or Photo</span>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center mb-8 border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                <span className="text-6xl">🎉</span>
              </div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">Access Granted</h2>
              <p className="text-slate-400 font-medium mb-12">Your schedule has been verified. You're now a certified BuffHunter!</p>
              
              <Link href="/" className="w-full">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full squishy-btn text-yellow-900 font-black py-5 rounded-[32px] uppercase tracking-widest shadow-2xl"
                >
                  Return to Campus
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
