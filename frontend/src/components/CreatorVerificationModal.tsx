"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuests } from "@/context/QuestContext";

interface CreatorVerificationModalProps {
  questId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatorVerificationModal({
  questId,
  isOpen,
  onClose,
}: CreatorVerificationModalProps) {
  const { quests } = useQuests();
  const quest = quests.find((q) => q.id === questId);
  const [isApproving, setIsApproving] = useState(false);

  if (!quest) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    // Simulate blockchain/credit release delay
    await new Promise((resolve) => setTimeout(resolve, 2500));
    // In a real app, this would update DB to 'rewarded'
    setIsApproving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
        >
          <div className="w-full max-w-md liquid-glass-dark p-8 rounded-[50px] border border-white/20 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6">
               <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">✕</button>
            </div>

            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">🔍</span>
              <h2 className="text-2xl font-black text-white tracking-tight">Review Quest</h2>
              <p className="text-yellow-400 font-bold uppercase tracking-widest text-[10px] mt-1">{quest.title}</p>
            </div>

            {/* Proof Mockup */}
            <div className="bg-black/40 rounded-[32px] aspect-video w-full mb-6 relative overflow-hidden flex items-center justify-center border border-white/10 group">
               <span className="text-white/20 font-black uppercase tracking-widest text-xs">Proof Image Mockup</span>
               <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="bg-white/5 p-5 rounded-[24px] mb-8 border border-white/5">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Hunter's Note</p>
              <p className="text-sm font-medium text-slate-300 italic">"Items are waiting for you at the west entrance of Duane. Look for the blue bag!"</p>
            </div>

            <div className="flex gap-4">
              <button onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-[28px] uppercase tracking-widest transition-colors border border-white/10 text-sm">Reject</button>
              <motion.button 
                onClick={handleApprove}
                whileTap={{ scale: 0.95 }}
                disabled={isApproving}
                className="flex-[2] squishy-btn text-yellow-900 font-black py-4 rounded-[28px] uppercase tracking-widest shadow-xl text-sm flex justify-center items-center"
              >
                {isApproving ? "Releasing Credits..." : `Approve & Pay ${quest.bounty} 💰`}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
