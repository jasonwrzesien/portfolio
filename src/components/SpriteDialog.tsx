"use client";

import Image from "next/image";
import { Press_Start_2P } from "next/font/google";
import { useEffect, useRef, useState } from "react";

type SpriteDialogProps = {
  messages: string[];
  spriteSrc?: string;
  onStepChange?: (index: number) => void;
  initialIndex?: number;
  isAdvanceEnabled?: boolean;
};

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

export default function SpriteDialog({
  messages,
  spriteSrc = "/sprites/sprite1.png",
  onStepChange,
  initialIndex = 0,
  isAdvanceEnabled = true,
}: SpriteDialogProps) {
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, Math.min(initialIndex, messages.length - 1)),
  );
  const bubbleStackRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const nextBubbleTimeoutRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    if (!bubbleStackRef.current) {
      return;
    }

    bubbleStackRef.current.scrollTo({
      top: bubbleStackRef.current.scrollHeight,
      behavior: "auto",
    });
  };

  useEffect(() => {
    return () => {
      if (nextBubbleTimeoutRef.current) {
        window.clearTimeout(nextBubbleTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleLeftClickAdvance = (event: MouseEvent) => {
      if (!isAdvanceEnabled) {
        return;
      }

      if (event.button !== 0) {
        return;
      }

      if (nextBubbleTimeoutRef.current) {
        window.clearTimeout(nextBubbleTimeoutRef.current);
        nextBubbleTimeoutRef.current = null;
      }

      setActiveIndex((previous) => {
        if (previous >= messages.length - 1) {
          return previous;
        }

        return previous + 1;
      });
    };

    window.addEventListener("mousedown", handleLeftClickAdvance, true);

    return () =>
      window.removeEventListener("mousedown", handleLeftClickAdvance, true);
  }, [isAdvanceEnabled, messages.length]);

  useEffect(() => {
    if (!bubbleStackRef.current) {
      return;
    }

    if (shouldAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [activeIndex]);

  useEffect(() => {
    onStepChange?.(activeIndex);
  }, [activeIndex, onStepChange]);

  const handleStackScroll = () => {
    if (!bubbleStackRef.current) {
      return;
    }

    const stack = bubbleStackRef.current;
    const distanceFromBottom =
      stack.scrollHeight - stack.clientHeight - stack.scrollTop;

    shouldAutoScrollRef.current = distanceFromBottom <= 6;
  };

  const visibleBubbles = messages.slice(0, activeIndex + 1);
  const activeSpriteSrc = spriteSrc === "/sprites/sprite1.png"
    ? getSpriteForDialogIndex(activeIndex)
    : spriteSrc;

  const handleTypingComplete = (completedIndex: number) => {
    if (completedIndex !== activeIndex || completedIndex >= messages.length - 1) {
      return;
    }

    if (nextBubbleTimeoutRef.current) {
      window.clearTimeout(nextBubbleTimeoutRef.current);
    }

    nextBubbleTimeoutRef.current = window.setTimeout(() => {
      setActiveIndex((previous) =>
        previous === completedIndex ? previous + 1 : previous,
      );
    }, 1000);
  };

  const handleTypingProgress = () => {
    if (!shouldAutoScrollRef.current) {
      return;
    }

    scrollToBottom();
  };

  return (
    <div className="pointer-events-none fixed bottom-2 right-6 z-20 flex max-w-xs flex-col items-end sm:bottom-3 sm:right-8">
      <div
        ref={bubbleStackRef}
        onScroll={handleStackScroll}
        className="hide-scrollbar pointer-events-auto mb-0 min-h-30 max-h-72 translate-y-3 overflow-y-auto pr-2 pt-2 sm:translate-y-4"
      >
        <div className="flex flex-col items-end gap-2">
          {visibleBubbles.map((bubbleText, index) => {
            const isCurrent = index === activeIndex;
            const recencyDistance = activeIndex - index;
            const opacityClass =
              recencyDistance <= 1
                ? "opacity-100"
                : recencyDistance === 2
                  ? "opacity-50"
                  : "opacity-40";

            return (
              <div
                key={`${index}-${bubbleText}`}
                className={`relative border-4 border-zinc-900 bg-zinc-50 px-4 py-3 shadow-[6px_6px_0_#111] transition-opacity ${opacityClass}`}
              >
                {isCurrent ? (
                  <TypingText
                    fontClass={pressStart2P.className}
                    text={bubbleText}
                    onProgress={handleTypingProgress}
                    onComplete={() => handleTypingComplete(index)}
                  />
                ) : (
                  <p
                    className={`${pressStart2P.className} text-[10px] leading-[1.7] tracking-[0.04em] text-zinc-900`}
                  >
                    {bubbleText}
                  </p>
                )}
                {isCurrent ? (
                  <>
                    <span className="absolute -bottom-3 right-12 h-3 w-3 bg-zinc-50 shadow-[3px_3px_0_#111]" />
                    <span className="absolute -bottom-5 right-10 h-2 w-2 bg-zinc-50 shadow-[2px_2px_0_#111]" />
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <Image
        src={activeSpriteSrc}
        alt="Character sprite"
        width={180}
        height={180}
        priority
        className="translate-x-5 [image-rendering:pixelated] drop-shadow-[6px_6px_0_rgba(0,0,0,0.35)] sm:translate-x-12"
      />
    </div>
  );
}

function getSpriteForDialogIndex(index: number): string {
  if (index <= 1) {
    return "/sprites/sprite2.png";
  }

  if (index <= 3) {
    return "/sprites/sprite3.png";
  }

  if (index <= 5) {
    return "/sprites/sprite6.png";
  }

  if (index === 6) {
    return "/sprites/sprite8.png";
  }

  if (index <= 7) {
    return "/sprites/sprite3.png";
  }

  return "/sprites/sprite3.png";
}

type TypingTextProps = {
  fontClass: string;
  text: string;
  onProgress?: () => void;
  onComplete?: () => void;
};

function TypingText({ fontClass, text, onProgress, onComplete }: TypingTextProps) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setVisibleText(text.slice(0, index));
      onProgress?.();

      if (index >= text.length) {
        window.clearInterval(intervalId);
        onComplete?.();
      }
    }, 45);

    return () => window.clearInterval(intervalId);
  }, [onComplete, onProgress, text]);

  return (
    <p className={`${fontClass} text-[10px] leading-[1.7] tracking-[0.04em] text-zinc-900`}>
      {visibleText}
    </p>
  );
}
