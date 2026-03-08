"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuests } from "@/context/QuestContext";

interface Message {
  id: string;
  sender: "you" | "other";
  text: string;
  timestamp: string;
}

export default function ActiveQuestChat() {
  const { 
    quests, 
    isChatOpen, 
    closeChat, 
    activeQuestId,
    setIsCompletionOpen,
    setIsVerificationOpen 
  } = useQuests();
  const activeQuest = quests.find((q) => q.id === activeQuestId);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: "other",
      text: "Hey! I can grab those notes for you. Are you on campus?",
      timestamp: "10:42 AM",
    },
    {
      id: "m2",
      sender: "you",
      text: "Yeah I'm sitting in the UMC right now by the fountain.",
      timestamp: "10:45 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "you",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    // Auto-reply mock
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "other",
          text: "Got it, I'll be there in 5 minutes! 🏃‍♂️💨",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isChatOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChat}
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
              <div>
              <h2 className="text-xl font-black text-white leading-tight drop-shadow-md">{activeQuest?.title || "Quest Chat"}</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chatting with Hunter</span>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Hunter Action: Complete */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCompletionOpen(true)}
                className="w-10 h-10 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center text-xl shadow-lg border border-white/20"
                title="Mark as Complete"
              >
                ✅
              </motion.button>

              {/* Creator Action: Verify */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsVerificationOpen(true)}
                className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center text-xl shadow-lg border border-white/20"
                title="Verify Proof"
              >
                ⭐
              </motion.button>

              <button 
                onClick={closeChat}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isYou = msg.sender === "you";
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg.id}
                    className={`flex flex-col ${
                      isYou ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-lg ${
                        isYou
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 rounded-tr-sm font-bold"
                          : "bg-white/10 text-white rounded-tl-sm font-medium border border-white/5 backdrop-blur-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              className="p-4 sm:p-6 border-t border-white/10 bg-black/20"
              style={{ paddingBottom: "calc(var(--sab) + 1.5rem)" }}
            >
              <form
                onSubmit={handleSend}
                className="relative flex items-center"
              >
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
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
