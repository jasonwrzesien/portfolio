"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import IntroductionModal from "@/components/IntroductionModal";
import SpriteDialog from "@/components/SpriteDialog";
import {
  formatSavedAt,
  listSaveSlots,
  loadGameStateFromSlot,
  sanitizeSlot,
  saveGameStateToSlot,
  type SaveSlot,
} from "@/lib/gameSave";

export default function Home() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSpriteDialog, setShowSpriteDialog] = useState(false);
  const [activeDialogIndex, setActiveDialogIndex] = useState(0);
  const [dialogInitialIndex, setDialogInitialIndex] = useState(0);
  const [dialogRenderKey, setDialogRenderKey] = useState(0);
  const [isStartPressed, setIsStartPressed] = useState(false);
  const [isTransitionFading, setIsTransitionFading] = useState(false);
  const [isStartPulseIn, setIsStartPulseIn] = useState(false);
  const [slotMode, setSlotMode] = useState<"save" | "load" | null>(null);
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>(() =>
    typeof window === "undefined" ? [] : listSaveSlots(),
  );
  const [slotStatus, setSlotStatus] = useState("");

  const holdTimeoutRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);

  const showIntro = !isDismissed;
  const dialogMessages = [
    "Hello!",
    "My name is Jason Wrzesien.",
    "This is a game where you get to learn more about me.",
    "Each mini-game represents something I love or know how to build.",
    "Some levels might even challenge you a little.",
    "The better you play, the more you discover.",
    "Ready to go?",
    "Let's play!",
  ];

  const isPlayEnabled = activeDialogIndex >= dialogMessages.length - 1;
  const areSaveLoadLocked = showSpriteDialog && !isPlayEnabled;
  const isPreStart = showIntro || showSpriteDialog;

  const refreshSaveSlots = () => {
    setSaveSlots(listSaveSlots());
  };

  const clearTransitionTimers = () => {
    if (holdTimeoutRef.current) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (fadeTimeoutRef.current) {
      window.clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
  };

  const handleCloseIntro = () => {
    setIsDismissed(true);
    setShowSpriteDialog(true);
    setDialogInitialIndex(0);
    setActiveDialogIndex(0);
    setDialogRenderKey((previous) => previous + 1);
    setIsStartPressed(false);
    setIsTransitionFading(false);
    setSlotStatus("");
  };

  useEffect(() => {
    return () => {
      clearTransitionTimers();
    };
  }, []);

  useEffect(() => {
    if (!isPlayEnabled || isStartPressed) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setIsStartPulseIn((previous) => !previous);
    }, 500);

    return () => window.clearInterval(intervalId);
  }, [isPlayEnabled, isStartPressed]);

  const handleStartPress = () => {
    if (!isPlayEnabled || isStartPressed) {
      return;
    }

    setIsStartPressed(true);

    holdTimeoutRef.current = window.setTimeout(() => {
      setIsTransitionFading(true);
    }, 500);

    fadeTimeoutRef.current = window.setTimeout(() => {
      setShowSpriteDialog(false);
    }, 1650);
  };

  const openSlotPanel = (mode: "save" | "load") => {
    setSlotMode((previous) => (previous === mode ? null : mode));
    refreshSaveSlots();
    setSlotStatus("");
  };

  const applyLoadedState = (slot: number) => {
    const loaded = loadGameStateFromSlot(sanitizeSlot(slot));

    if (!loaded) {
      setSlotStatus("Selected slot is empty");
      return;
    }

    clearTransitionTimers();

    const clampedDialogIndex = Math.max(
      0,
      Math.min(loaded.activeDialogIndex, dialogMessages.length - 1),
    );

    setIsDismissed(loaded.isDismissed);
    setShowSpriteDialog(loaded.showSpriteDialog);
    setActiveDialogIndex(clampedDialogIndex);
    setDialogInitialIndex(clampedDialogIndex);
    setDialogRenderKey((previous) => previous + 1);
    setIsStartPressed(loaded.isStartPressed);
    setIsTransitionFading(loaded.isTransitionFading);
    setIsStartPulseIn(false);
    setSlotStatus(`Loaded Slot ${slot}`);
    setSlotMode(null);
  };

  const saveCurrentStateToSlot = (slot: number) => {
    saveGameStateToSlot(sanitizeSlot(slot), {
      isDismissed,
      showSpriteDialog,
      activeDialogIndex,
      isStartPressed,
      isTransitionFading,
    });

    refreshSaveSlots();
    setSlotStatus(`Saved to Slot ${slot}`);
    setSlotMode(null);
  };

  const handleSlotClick = (slot: number) => {
    if (slotMode === "save") {
      saveCurrentStateToSlot(slot);
      return;
    }

    if (slotMode === "load") {
      applyLoadedState(slot);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 p-6">
      {isPreStart ? (
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="/backgrounds/intro-background.png"
            alt=""
            fill
            priority
            sizes="100vw"
            draggable={false}
            className="select-none object-fill"
          />
          <div className="prestart-vignette absolute inset-0" />
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-28 top-1/2 -translate-y-1/2">
            <div className="h-14 w-14 rounded-full border-2 border-zinc-900 bg-amber-700" />
            <div className="absolute left-1/2 top-[-18px] h-4 w-4 -translate-x-1/2 rounded-full bg-yellow-200" />
            <div className="absolute left-[56px] top-1/2 h-[3px] w-[130px] -translate-y-1/2 bg-zinc-900" />
            <div className="absolute left-[186px] top-1/2 h-14 w-14 -translate-y-1/2 rounded-full border-2 border-zinc-900 bg-amber-700" />
          </div>
        </div>
      )}

      <div className="fixed left-4 top-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => openSlotPanel("save")}
          disabled={areSaveLoadLocked}
          className="border-2 border-zinc-900 bg-zinc-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-900 shadow-[2px_2px_0_#111] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => openSlotPanel("load")}
          disabled={areSaveLoadLocked}
          className="border-2 border-zinc-900 bg-zinc-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-900 shadow-[2px_2px_0_#111] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Load
        </button>
        <p className="self-center text-xs font-bold text-zinc-700">{slotStatus}</p>
      </div>

      {slotMode ? (
        <div className="fixed left-1/2 top-16 z-30 w-[min(96vw,52rem)] -translate-x-1/2 border-4 border-zinc-900 bg-zinc-100 p-4 shadow-[8px_8px_0_#111]">
          <p className="mb-3 text-center text-sm font-black uppercase tracking-[0.12em] text-zinc-900">
            {slotMode === "save" ? "Choose A Slot To Save" : "Choose A Slot To Load"}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {saveSlots.map(({ slot, state }) => (
              <button
                key={slot}
                type="button"
                onClick={() => handleSlotClick(slot)}
                className="min-h-24 border-2 border-zinc-900 bg-white p-3 text-left shadow-[4px_4px_0_#111] transition hover:bg-zinc-50"
              >
                <p className="text-xs font-black uppercase tracking-wide text-zinc-900">
                  Slot {slot}
                </p>
                <p className="mt-2 text-[11px] font-semibold text-zinc-700">
                  {state ? formatSavedAt(state.savedAt) : "Empty"}
                </p>
                <p className="mt-1 text-[11px] text-zinc-600">
                  {state
                    ? `Dialog ${state.activeDialogIndex + 1} | ${state.showSpriteDialog ? "Dialog" : "Main"}`
                    : "No data"}
                </p>
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setSlotMode(null)}
              className="border-2 border-zinc-900 bg-zinc-100 px-4 py-1 text-xs font-bold uppercase tracking-wide text-zinc-900 shadow-[2px_2px_0_#111]"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {showIntro ? (
        <div className="fixed inset-0 z-10 grid place-items-center bg-black/30 p-4">
          <IntroductionModal onClose={handleCloseIntro} />
        </div>
      ) : null}

      {showSpriteDialog ? (
        <div
          className={`transition-opacity duration-700 ${
            isTransitionFading ? "opacity-0" : "opacity-100"
          }`}
        >
          {!isPlayEnabled ? (
            <div className="pointer-events-none fixed inset-0 z-[5] bg-zinc-700/12" />
          ) : null}

          <div className="fixed inset-0 z-10 grid place-items-center pointer-events-none translate-x-0 translate-y-32 sm:translate-x-2 sm:translate-y-34">
            <button
              type="button"
              onClick={handleStartPress}
              disabled={!isPlayEnabled || isStartPressed}
              className="pointer-events-auto select-none outline-none transition enabled:hover:scale-[1.02] focus:outline-none focus-visible:outline-none disabled:cursor-default disabled:pointer-events-none"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <Image
                src={
                  !isPlayEnabled
                    ? "/buttons/red-start-button.png"
                    : isStartPressed || isStartPulseIn
                    ? "/buttons/green-start-button-in.png"
                    : "/buttons/green-start-button.png"
                }
                alt="Start"
                width={260}
                height={92}
                priority
                draggable={false}
                className="h-auto w-[100px] sm:w-[100px]"
              />
            </button>
          </div>

          <SpriteDialog
            key={dialogRenderKey}
            messages={dialogMessages}
            onStepChange={setActiveDialogIndex}
            initialIndex={dialogInitialIndex}
            isAdvanceEnabled={!isPlayEnabled}
          />
        </div>
      ) : null}
    </main>
  );
}
