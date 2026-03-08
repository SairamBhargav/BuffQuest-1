"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questData: any) => void;
}

export default function CreateQuestModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateQuestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bounty, setBounty] = useState(10);
  const [buildingZone, setBuildingZone] = useState("Norlin Library");

  const MOCK_ZONES = [
    "Norlin Library",
    "Duane Physics",
    "UMC",
    "Engineering Center",
    "C4C",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || bounty <= 0) return;
    
    onSubmit({
      title,
      description,
      buildingZone,
      bounty,
    });
    
    // Reset form
    setTitle("");
    setDescription("");
    setBounty(10);
    setBuildingZone("Norlin Library");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full sm:w-[500px] max-h-[90vh] overflow-y-auto liquid-glass-dark rounded-t-[40px] sm:rounded-[40px] border-b-0 sm:border-b pointer-events-auto"
            style={{ paddingBottom: 'max(var(--sab), 2rem)' }}
          >
            {/* Handle Bar (Mobile) */}
            <div className="w-full flex justify-center pt-4 pb-2 sm:hidden absolute top-0 left-0">
              <div className="w-12 h-1.5 bg-white/30 rounded-full" />
            </div>

            <div className="p-6 pt-10 sm:pt-8 w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-2">
                  <span className="text-yellow-400">✚</span> Post Quest
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <label className="text-xs font-black tracking-widest text-slate-400 uppercase ml-2">Quest Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Need Coffee to Norlin"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 transition-all font-medium"
                    required
                    maxLength={120}
                  />
                </div>

                {/* Building Zone */}
                <div className="space-y-2">
                  <label className="text-xs font-black tracking-widest text-slate-400 uppercase ml-2">Location Zone</label>
                  <select
                    value={buildingZone}
                    onChange={(e) => setBuildingZone(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 transition-all font-medium appearance-none cursor-pointer"
                  >
                    {MOCK_ZONES.map(zone => (
                      <option key={zone} value={zone} className="bg-slate-900">{zone}</option>
                    ))}
                  </select>
                </div>

                {/* Bounty Slider/Input */}
                <div className="space-y-2 bg-yellow-500/10 p-5 rounded-[24px] border border-yellow-500/20">
                  <label className="text-xs font-black tracking-widest text-yellow-500/80 uppercase flex justify-between items-center w-full">
                    <span>Reward Bounty</span>
                    <span className="text-yellow-400 text-lg font-black tracking-tighter">{bounty} 💰</span>
                  </label>
                  <div className="flex items-center gap-4 pt-2">
                    <button 
                      type="button"
                      onClick={() => setBounty(Math.max(5, bounty - 5))}
                      className="w-10 h-10 rounded-full bg-black/40 text-yellow-500 font-bold hover:bg-black/60 flex items-center justify-center shrink-0 border border-white/5 active:scale-90 transition-transform"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={bounty}
                      onChange={(e) => setBounty(Number(e.target.value))}
                      className="w-full accent-yellow-400 h-2 bg-black/40 rounded-lg appearance-none cursor-pointer"
                    />
                    <button 
                      type="button"
                      onClick={() => setBounty(Math.min(100, bounty + 5))}
                      className="w-10 h-10 rounded-full bg-black/40 text-yellow-500 font-bold hover:bg-black/60 flex items-center justify-center shrink-0 border border-white/5 active:scale-90 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="space-y-2">
                  <label className="text-xs font-black tracking-widest text-slate-400 uppercase ml-2">Description / Instructions</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details about the quest..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 transition-all font-medium min-h-[100px] resize-none"
                    required
                    maxLength={2000}
                  />
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full squishy-btn text-yellow-900 font-black py-4 rounded-[28px] uppercase tracking-widest text-lg border-2 border-white/60 shadow-xl mt-4"
                >
                  Deploy Quest
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
