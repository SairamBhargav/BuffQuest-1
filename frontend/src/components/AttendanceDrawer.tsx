"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { useQuests } from "@/context/QuestContext";

interface AttendanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type VerificationStage = "idle" | "verifying" | "success" | "failed";

export default function AttendanceDrawer({ isOpen, onClose }: AttendanceDrawerProps) {
  const { addToast } = useToast();
  const { refreshData } = useQuests();
  const [hasSchedule, setHasSchedule] = useState(false);
  const [scheduleName, setScheduleName] = useState("");
  const [stage, setStage] = useState<VerificationStage>("idle");

  const handleScheduleUpload = () => {
    // Simulate a schedule upload
    setScheduleName("Spring 2026 Schedule");
    setHasSchedule(true);
    addToast("Schedule uploaded successfully!", "success");
  };

  const handleCheckIn = async () => {
    setStage("verifying");

    try {
      const res = await fetch("http://localhost:8000/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          class_name: scheduleName || "General Class",
          schedule_image_url: "https://example.com/mock_schedule.png",
          class_photo_url: "https://example.com/mock_photo.png",
          building_zone_id: 1, // Fallback location
          scheduled_start_time: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setStage("success");
        addToast("+5 daily credits earned! 🎓", "reward");
        await refreshData();
      } else {
        const errorData = await res.json();
        setStage("failed");
        addToast(errorData.detail || "Verification failed.", "error");
      }
    } catch (e) {
      setStage("failed");
      addToast("Network error during check-in.", "error");
    }

    // Reset after delay
    setTimeout(() => {
      setStage("idle");
    }, 3000);
  };

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

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 w-full max-h-[80dvh] z-[101] liquid-glass-dark rounded-t-[40px] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10 overflow-y-auto"
            style={{ paddingBottom: 'max(var(--sab), 2rem)' }}
          >
            {/* Handle */}
            <div className="w-full flex justify-center pt-4 pb-2 sm:hidden">
              <div className="w-12 h-1.5 bg-white/30 rounded-full" />
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-2">
                    <span className="text-green-400">🎓</span> Attendance
                  </h2>
                  <p className="text-sm text-slate-400 font-medium mt-1">Earn daily credits by checking in to class</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Schedule Section */}
              <div className="liquid-glass-dark rounded-[28px] p-5 space-y-4">
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">Your Schedule</h3>
                {hasSchedule ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-green-400 text-lg">✓</span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{scheduleName}</p>
                        <p className="text-xs text-slate-500">Uploaded</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setHasSchedule(false); setScheduleName(""); }}
                      className="text-xs text-slate-500 hover:text-red-400 font-bold transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleScheduleUpload}
                    className="w-full border-2 border-dashed border-white/15 rounded-2xl py-6 flex flex-col items-center gap-2 text-slate-400 hover:border-yellow-400/30 hover:text-yellow-400 transition-all group"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">📋</span>
                    <span className="font-bold text-sm">Upload Class Schedule</span>
                    <span className="text-xs text-slate-500">Photo of your schedule or screenshot</span>
                  </motion.button>
                )}
              </div>

              {/* Check-In Section */}
              <div className="liquid-glass-dark rounded-[28px] p-5 space-y-4">
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">Daily Check-In</h3>

                {stage === "idle" && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                      Take a photo from your class to verify attendance and earn <span className="text-yellow-400 font-black">+5 credits</span> daily.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCheckIn}
                      disabled={!hasSchedule}
                      className="w-full squishy-btn text-yellow-900 font-black py-4 rounded-[28px] uppercase tracking-widest text-base border-2 border-white/60 shadow-xl disabled:opacity-40 disabled:pointer-events-none"
                    >
                      📸 Check In Now
                    </motion.button>
                    {!hasSchedule && (
                      <p className="text-xs text-center text-slate-500 font-medium">Upload your schedule first to enable check-in</p>
                    )}
                  </div>
                )}

                {stage === "verifying" && (
                  <div className="flex flex-col items-center py-8 gap-4">
                    <div className="w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full border-4 border-yellow-400/30 border-t-yellow-400 animate-spin" />
                    </div>
                    <p className="text-white font-bold text-sm">Verifying location & time...</p>
                    <p className="text-xs text-slate-500">Checking your class schedule match</p>
                  </div>
                )}

                {stage === "success" && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="flex flex-col items-center py-8 gap-3"
                  >
                    <div className="text-5xl animate-reward-burst">🎉</div>
                    <span className="text-2xl font-black text-yellow-400 glow-gold">+5 Credits!</span>
                    <span className="text-sm font-bold text-green-400">Attendance verified</span>
                  </motion.div>
                )}

                {stage === "failed" && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="flex flex-col items-center py-8 gap-3"
                  >
                    <div className="text-5xl">❌</div>
                    <span className="text-lg font-black text-red-400">Verification Failed</span>
                    <span className="text-sm text-slate-400">Ensure you are in the correct building during class time.</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
