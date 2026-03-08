"use client";

import { QuestProvider } from "@/context/QuestContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QuestProvider>
      {children}
    </QuestProvider>
  );
}
