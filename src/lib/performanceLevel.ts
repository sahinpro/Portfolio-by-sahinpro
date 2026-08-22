import { DESKTOP_LAYOUT_BREAKPOINT } from "@/constants/styles";

export type PerfLevel = "high" | "medium" | "low";

export type PerformanceSnapshot = {
  level: PerfLevel;
  reducedMotion: boolean;
  isTouch: boolean;
  isLowPower: boolean;
  /** Desktop + fine pointer + hover. WebGL / spotlights / liquid borders. */
  richDesktopEffects: boolean;
  /** Not HIGH: skip WebGL, pointer systems, typing, count-up, char motion. */
  simpleVisuals: boolean;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const HOVER = "(hover: hover)";
const FINE_POINTER = "(pointer: fine)";
const DESKTOP = `(min-width: ${DESKTOP_LAYOUT_BREAKPOINT}px)`;

/** SSR + first paint: phone-like, not LOW, so iPhone glass does not flash off. */
export const SERVER_PERFORMANCE_SNAPSHOT: PerformanceSnapshot = {
  level: "medium",
  reducedMotion: false,
  isTouch: true,
  isLowPower: false,
  richDesktopEffects: false,
  simpleVisuals: true,
};

type NavigatorMemory = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

function readDeviceMemoryGb(): number | undefined {
  const memory = (navigator as NavigatorMemory).deviceMemory;
  return typeof memory === "number" && memory > 0 ? memory : undefined;
}

function readHardwareConcurrency(): number | undefined {
  const cores = navigator.hardwareConcurrency;
  return typeof cores === "number" && cores > 0 ? cores : undefined;
}

function readSaveData(): boolean {
  return (navigator as NavigatorMemory).connection?.saveData === true;
}

/**
 * HIGH — desktop fine pointer.
 * MEDIUM — typical phone (e.g. iPhone: no deviceMemory).
 * LOW — weak Android (deviceMemory ≤ 4, like Redmi 5 Plus), ≤4 cores, save-data, or reduced motion.
 */
export function readPerformanceSnapshot(): PerformanceSnapshot {
  const reducedMotion = window.matchMedia(REDUCED_MOTION).matches;
  const hover = window.matchMedia(HOVER).matches;
  const fine = window.matchMedia(FINE_POINTER).matches;
  const desktop = window.matchMedia(DESKTOP).matches;
  const isTouch = !hover || !fine;
  const memoryGb = readDeviceMemoryGb();
  const cores = readHardwareConcurrency();
  const saveData = readSaveData();
  const lowRam = memoryGb !== undefined && memoryGb <= 4;
  const lowCores = cores !== undefined && cores <= 4;
  const isLowPower = isTouch && (lowRam || lowCores || saveData);

  let level: PerfLevel;
  if (reducedMotion || isLowPower) {
    level = "low";
  } else if (desktop && hover && fine) {
    level = "high";
  } else {
    level = "medium";
  }

  return {
    level,
    reducedMotion,
    isTouch,
    isLowPower: isLowPower || reducedMotion,
    richDesktopEffects: level === "high",
    simpleVisuals: level !== "high",
  };
}

export function samePerformanceSnapshot(
  a: PerformanceSnapshot,
  b: PerformanceSnapshot,
): boolean {
  return (
    a.level === b.level &&
    a.reducedMotion === b.reducedMotion &&
    a.isTouch === b.isTouch &&
    a.isLowPower === b.isLowPower &&
    a.richDesktopEffects === b.richDesktopEffects &&
    a.simpleVisuals === b.simpleVisuals
  );
}

export const PERF_MEDIA_QUERIES = [REDUCED_MOTION, HOVER, FINE_POINTER, DESKTOP] as const;

/** Runs in <head> before paint so `data-perf` matches capabilities (no UA string). */
export const PERF_BOOT_SCRIPT = `(function(){try{var min=${DESKTOP_LAYOUT_BREAKPOINT};var hover=matchMedia("(hover: hover)").matches;var fine=matchMedia("(pointer: fine)").matches;var desktop=matchMedia("(min-width:"+min+"px)").matches;var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;var touch=!hover||!fine;var mem=navigator.deviceMemory;var cores=navigator.hardwareConcurrency;var save=navigator.connection&&navigator.connection.saveData;var lowRam=typeof mem==="number"&&mem>0&&mem<=4;var lowCores=typeof cores==="number"&&cores>0&&cores<=4;var level="medium";if(reduce||(touch&&(lowRam||lowCores||save)))level="low";else if(desktop&&hover&&fine)level="high";document.documentElement.setAttribute("data-perf",level);}catch(e){}})();`;
