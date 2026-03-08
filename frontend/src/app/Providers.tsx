"use client";

import { QuestProvider, useQuests } from "@/context/QuestContext";
import ActiveQuestChat from "@/components/ActiveQuestChat";
import TaskCompletionModal from "@/components/TaskCompletionModal";
import CreatorVerificationModal from "@/components/CreatorVerificationModal";
import DailyCheckInModal from "@/components/DailyCheckInModal";

function GlobalModals() {
  const { 
    activeQuestId, 
    isCompletionOpen, 
    setIsCompletionOpen, 
    isVerificationOpen, 
    setIsVerificationOpen,
    isCheckInOpen,
    setIsCheckInOpen 
  } = useQuests();
  
  return (
    <>
      {activeQuestId && (
        <>
          <TaskCompletionModal 
            questId={activeQuestId} 
            isOpen={isCompletionOpen} 
            onClose={() => setIsCompletionOpen(false)} 
          />
          <CreatorVerificationModal 
            questId={activeQuestId} 
            isOpen={isVerificationOpen} 
            onClose={() => setIsVerificationOpen(false)} 
          />
        </>
      )}
      <DailyCheckInModal 
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
      />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QuestProvider>
      {children}
      <ActiveQuestChat />
      <GlobalModals />
    </QuestProvider>
  );
}
