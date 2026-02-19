"use client";

import { useState, useSyncExternalStore } from "react";
import IntroductionModal from "@/components/IntroductionModal";

const INTRO_SEEN_KEY = "portfolio_intro_seen_v1";
const emptySubscribe = () => () => {};

export default function Home() {
  const [isDismissed, setIsDismissed] = useState(false);
  const isFirstVisit = useSyncExternalStore(
    emptySubscribe,
    () => localStorage.getItem(INTRO_SEEN_KEY) !== "true",
    () => false,
  );
  const showIntro = isFirstVisit && !isDismissed;

  const handleCloseIntro = () => {
    localStorage.setItem(INTRO_SEEN_KEY, "true");
    setIsDismissed(true);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      {showIntro ? (
        <div className="fixed inset-0 z-10 grid place-items-center bg-black/30 p-4">
          <IntroductionModal onClose={handleCloseIntro} />
        </div>
      ) : null}
    </main>
  );
}
