import { cn } from "@/lib/utils";

/** Shared project card / popup frame tokens. */
export const projectCardShell =
  "relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#111]";

export const projectCardInnerFrame =
  "pointer-events-none absolute inset-[7px] z-20 rounded-[1.35rem] border border-white/10";

export const projectCardGlassMask =
  "linear-gradient(to top, black 0%, black 55%, rgba(0, 0, 0, 0.6) 72%, transparent 100%)";

export const projectCardGlassGradient =
  "pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[52%] bg-gradient-to-t from-[rgba(10,14,20,0.82)] via-[rgba(10,14,20,0.55)] via-45% to-transparent";

export const projectCardGlassBlur =
  "pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[300px] bg-gradient-to-t from-white/[0.06] via-white/[0.03] via-50% to-transparent max-md:backdrop-blur-md md:backdrop-blur-[22px]";

export const projectCardActionBtn =
  "flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/80 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-black/60 hover:text-white";

export const modalShell = cn(
  projectCardShell,
  "flex max-h-[min(90vh,880px)] flex-col isolate shadow-2xl shadow-black/60",
);

export const modalHeroHeight = " bg-[#111] h-[20rem] lg:h-[32rem]";

export const layoutSpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 32,
};
