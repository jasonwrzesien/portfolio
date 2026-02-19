import { Press_Start_2P } from "next/font/google";

type IntroductionModalProps = {
  onClose: () => void;
};

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

export default function IntroductionModal({ onClose }: IntroductionModalProps) {
  return (
    <div className="arcade-intro-box mx-auto w-full max-w-md p-8">
      <h2
        className={`${pressStart2P.className} text-cursor mx-auto max-w-[22ch] text-center text-[var(--arcade-gold)] text-lg uppercase tracking-[0.18em]`}
      >
        INTRODUCTION
      </h2>
      <p className="text-cursor mx-auto mt-4 max-w-[46ch] text-center text-sm leading-relaxed text-zinc-200">
        Welcome to the game.
      </p>
      <p className="text-cursor mx-auto mt-3 max-w-[46ch] text-center text-sm leading-relaxed text-zinc-200">
        Explore a world of arcade-style challenges where every level you beat
        unlocks the next part of the experience. Along the way, you&apos;ll run
        into puzzles and mini-games that range from quick wins to &ldquo;okay wait
        this is actually hard.&rdquo;
      </p>
      <p className="text-cursor mx-auto mt-3 max-w-[46ch] text-center text-sm leading-relaxed text-zinc-200">
        Some stages will test your logic, some your speed, and some your
        ability to keep going when things get frustrating. Don&apos;t worry if you
        fail a few times - retries are part of the fun.
      </p>
      <p className="text-cursor mx-auto mt-3 max-w-[46ch] text-center text-sm font-semibold leading-relaxed text-zinc-100">
        Only rule is HAVE FUN!
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mx-auto mt-6 block border-2 border-[var(--arcade-gold)] bg-zinc-900 px-5 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[var(--arcade-gold)] shadow-[2px_2px_0_#000] transition hover:bg-zinc-800"
      >
        Continue
      </button>
    </div>
  );
}
