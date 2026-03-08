"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuests, Quest, api } from "@/context/QuestContext";
import { useToast } from "@/context/ToastContext";
import { authClient } from "@/lib/auth-client";

interface Message {
  id: string;
  sender_id: string;
  quest_id: string;
  text: string;
  created_at: string;
}

interface ActiveQuestChatProps {
  isOpen: boolean;
  onClose: () => void;
  quest: Quest | null;
  role: "creator" | "hunter";
}

export default function ActiveQuestChat({ isOpen, onClose, quest, role }: ActiveQuestChatProps) {
  const { completeQuest, verifyQuest, cancelQuest, user } = useQuests();
  const { addToast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showReward, setShowReward] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!quest || !isOpen) return;
    try {
      const session = await authClient.getSession();
      const token = session?.data?.session?.token;
      if (!token) return;

      const res = await api.get<Message[]>(`/quests/${quest.id}/messages`);
      setMessages(res.data);
    } catch (e) {
      console.error("Failed to fetch messages", e);
    }
  }, [quest, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !quest) return;

    const currentText = inputText;
    setInputText("");
    
    try {
      const session = await authClient.getSession();
      const token = session?.data?.session?.token;
      if (!token) return;

      await api.post(
        `/quests/${quest.id}/messages`,
        { text: currentText }
      );
      fetchMessages();
    } catch (e) {
      console.error("Failed to send message", e);
      addToast("Failed to send message", "error");
    }
  };

  const handleComplete = () => {
    if (!quest) return;
    completeQuest(quest.id);
    addToast("Quest marked as completed! Awaiting creator verification.", "info");
  };

  const handleVerify = () => {
    if (!quest) return;
    verifyQuest(quest.id);
    setShowReward(true);
    addToast(`+${quest.bounty} credits earned! 🎉`, "reward");
    setTimeout(() => {
      setShowReward(false);
      onClose();
    }, 2500);
  };

  const handleCancel = () => {
    if (!quest) return;
    cancelQuest(quest.id);
    addToast("Quest cancelled. Credits refunded.", "info");
    onClose();
  };

  if (!quest) return null;

  const isChatLocked = quest.status === "verified" || quest.status === "cancelled";

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
          />

          {/* Chat Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 w-full h-[85dvh] z-[101] liquid-glass-dark rounded-t-[40px] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-[40px]">
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-white text-lg drop-shadow-sm truncate">{quest.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      quest.status === "claimed" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" :
                      quest.status === "completed" ? "bg-yellow-400 shadow-[0_0_8px_rgba(255,214,10,0.8)]" :
                      "bg-slate-500"
                    }`} />
                    {quest.status === "claimed" && "In Progress"}
                    {quest.status === "completed" && "Awaiting Verification"}
                    {quest.status === "verified" && "Verified ✓"}
                  </p>
                  <span className="text-xs text-yellow-400 font-black bg-yellow-400/10 px-2 py-0.5 rounded-full">
                    {quest.bounty} 💰
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors shrink-0 ml-3"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isYou = msg.sender_id === user?.id;
                const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg.id}
                    className={`flex flex-col ${isYou ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-lg ${
                        isYou
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm font-bold"
                          : "bg-gradient-to-br from-pink-500/90 to-pink-600/90 text-white rounded-tl-sm font-medium"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1 px-1">
                      {timeStr}
                    </span>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />

              {/* Reward Burst Animation */}
              <AnimatePresence>
                {showReward && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <div className="text-6xl mb-3 animate-reward-burst">🎉</div>
                    <span className="text-2xl font-black text-yellow-400 glow-gold">+{quest.bounty} Credits!</span>
                    <span className="text-sm font-bold text-slate-400 mt-1">Quest Complete</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons Area */}
            {!isChatLocked && (
              <div className="px-6 py-3 border-t border-white/10 bg-black/10 flex gap-3">
                {role === "hunter" && quest.status === "claimed" && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleComplete}
                    className="flex-1 squishy-btn text-yellow-900 font-black py-3 rounded-[24px] uppercase tracking-wider text-sm"
                  >
                    Mark Completed
                  </motion.button>
                )}
                {role === "creator" && quest.status === "completed" && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVerify}
                    className="flex-1 squishy-btn text-yellow-900 font-black py-3 rounded-[24px] uppercase tracking-wider text-sm"
                  >
                    Verify & Reward
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="px-5 py-3 rounded-[24px] bg-white/10 text-slate-400 font-black uppercase tracking-wider text-sm hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            )}

            {/* Input Area */}
            {!isChatLocked && (
              <div className="p-4 sm:p-6 border-t border-white/10 bg-black/20" style={{ paddingBottom: 'calc(var(--sab) + 1.5rem)' }}>
                <form onSubmit={handleSend} className="relative flex items-center">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-full py-4 pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-300 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all font-black text-xl"
                  >
                    ↑
                  </button>
                </form>
              </div>
            )}

            {/* Locked Chat State */}
            {isChatLocked && (
              <div className="p-6 border-t border-white/10 bg-black/20 text-center" style={{ paddingBottom: 'calc(var(--sab) + 1.5rem)' }}>
                <p className="text-slate-500 font-bold text-sm">This quest session has ended.</p>
              </div>
            )}
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
