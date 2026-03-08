"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuests } from "@/context/QuestContext";

interface TaskCompletionModalProps {
  questId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskCompletionModal({
  questId,
  isOpen,
  onClose,
}: TaskCompletionModalProps) {
  const { quests, completeQuest } = useQuests();
  const quest = quests.find((q) => q.id === questId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState("");

  if (!quest) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    completeQuest(questId);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] liquid-glass-dark-solid flex flex-col p-6 overflow-hidden"
          style={{ paddingTop: 'max(var(--sat), 1.5rem)', paddingBottom: 'max(var(--sab), 1.5rem)' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Complete Quest</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{quest.title}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">✕</button>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto pr-2">
            {/* Camera Mockup Area */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Evidence / Proof</label>
              <div className="relative aspect-[3/4] w-full bg-black/60 rounded-[40px] border-2 border-dashed border-white/20 flex flex-col items-center justify-center group hover:border-yellow-400/50 transition-colors cursor-pointer overflow-hidden">
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📸</span>
                <span className="font-black text-white/40 uppercase tracking-widest text-xs">Tap to Open Camera</span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                   <p className="text-[10px] text-slate-500 font-medium italic">Make sure the {quest.building} building is visible in the frame.</p>
                </div>
              </div>
            </div>

            {/* Note Input */}
            <div className="space-y-3">
               <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Notes for Creator</label>
               <textarea 
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 placeholder="I left the items at the front desk!"
                 className="w-full bg-white/5 border border-white/10 rounded-[32px] p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400/50 transition-all min-h-[120px] resize-none font-medium"
               />
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-4 border-t border-white/10">
            <motion.button 
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
              className="w-full squishy-btn text-yellow-900 font-black py-5 rounded-[32px] uppercase tracking-widest shadow-2xl relative overflow-hidden"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-900/30 border-t-yellow-900 rounded-full animate-spin" />
                  <span>Uploading Proof...</span>
                </div>
              ) : (
                "Finish & Request Payout"
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
