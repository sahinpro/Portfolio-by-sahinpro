import { cn } from "@/lib/utils";

/** Shared project card / popup frame tokens. */
export const projectCardShell =
  "relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#111]";

export const projectCardInnerFrame =
  "pointer-events-none absolute inset-[7px] z-20 rounded-[1.35rem] border border-white/10";

export const projectCardActionBtn =
  "flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/80 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-black/60 hover:text-white";

export const modalShell = cn(
  projectCardShell,
  "flex max-h-[min(90vh,880px)] flex-col isolate shadow-2xl shadow-black/60",
);

export const modalHeroHeight =
  "h-[17.5rem] bg-[#111] sm:h-[22rem] md:h-[26rem]";

export const layoutSpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 32,
};
