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
  "pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[300px] bg-gradient-to-t from-white/[0.06] via-white/[0.03] via-50% to-transparent md:backdrop-blur-[22px]";

export const projectCardActionBtn =
  "flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/80 transition-colors hover:border-white/25 hover:bg-black/70 hover:text-white md:bg-black/45 md:backdrop-blur-sm";

export const modalShell = cn(
  projectCardShell,
  "flex max-h-[min(90vh,880px)] flex-col isolate shadow-2xl shadow-black/60",
);

export const modalHeroHeight = " bg-[#111] h-[22rem] lg:h-[32rem]";

export const projectMorphIdsMobile = new Set([
  "project-card",
  "project-image",
] as const);

export const projectMorphIdsDesktop = new Set([
  "project-card",
  "project-image",
  "project-title",
  "project-category",
  "project-btn",
] as const);

export type ProjectMorphId =
  | "project-card"
  | "project-image"
  | "project-title"
  | "project-category"
  | "project-btn";

export const layoutSpringDesktop = {
  type: "spring" as const,
  stiffness: 320,
  damping: 32,
};

/** Snappier spring — fewer simultaneous layout targets on mobile. */
export const layoutSpringMobile = {
  type: "spring" as const,
  stiffness: 580,
  damping: 46,
  mass: 0.75,
};

export const layoutTweenReduced = {
  type: "tween" as const,
  duration: 0.15,
  ease: "easeOut" as const,
};

/** Lightweight modal enter/exit — no shared layout on mobile. */
export const mobileModalMotion = {
  initial: { opacity: 0, y: 10, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.99 },
  transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] as const },
};

/** @deprecated Use layoutSpringDesktop */
export const layoutSpring = layoutSpringDesktop;

export const morphGpuLayer = "transform-gpu [contain:layout]";
