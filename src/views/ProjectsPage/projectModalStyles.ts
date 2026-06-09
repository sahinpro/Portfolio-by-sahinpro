/** Matches hero About code editor shell — 3px liquid glass frame. */
export const liquidBorderShell =
  "rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/30 to-white/50 p-[3px] shadow-2xl shadow-black/60 max-md:backdrop-blur-sm md:backdrop-blur-xl";

export const liquidBorderInner =
  "relative flex max-h-[min(90vh,880px)] flex-col overflow-hidden rounded-[calc(1.75rem-3px)] bg-[#0a0a0a] isolate";

export const modalHeroHeight =
  "h-[17.5rem] bg-[#0a0a0a] sm:h-[22rem] md:h-[26rem]";

export const layoutSpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 32,
};
