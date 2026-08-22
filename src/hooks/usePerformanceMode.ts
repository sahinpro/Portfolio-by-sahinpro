"use client";

import { DESKTOP_LAYOUT_BREAKPOINT } from "@/constants/styles";
import { useSyncExternalStore } from "react";

export type PerformanceMode = {
  reducedMotion: boolean;
  isTouch: boolean;
  isLowPower: boolean;
  /** Fine pointer + hover + desktop width + motion allowed. WebGL/spotlights may run. */
  richDesktopEffects: boolean;
  /** Skip particles, WebGL, cursor follow, char-level text, typing, large blur. */
  simpleVisuals: boolean;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const HOVER = "(hover: hover)";
const FINE_POINTER = "(pointer: fine)";
const DESKTOP = `(min-width: ${DESKTOP_LAYOUT_BREAKPOINT}px)`;

const SERVER_SNAPSHOT: PerformanceMode = {
  reducedMotion: false,
  isTouch: true,
  isLowPower: false,
  richDesktopEffects: false,
  simpleVisuals: true,
};

function readDeviceMemoryGb(): number | undefined {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return typeof memory === "number" && memory > 0 ? memory : undefined;
}

function readMode(): PerformanceMode {
  const reducedMotion = window.matchMedia(REDUCED_MOTION).matches;
  const hover = window.matchMedia(HOVER).matches;
  const fine = window.matchMedia(FINE_POINTER).matches;
  const desktop = window.matchMedia(DESKTOP).matches;
  const isTouch = !hover || !fine;
  const memoryGb = readDeviceMemoryGb();
  const isLowPower = isTouch && memoryGb !== undefined && memoryGb <= 4;
  const simpleVisuals = reducedMotion || isTouch || isLowPower;
  const richDesktopEffects = desktop && hover && fine && !reducedMotion && !isLowPower;

  return {
    reducedMotion,
    isTouch,
    isLowPower,
    richDesktopEffects,
    simpleVisuals,
  };
}

let cachedSnapshot: PerformanceMode | null = null;

function sameMode(a: PerformanceMode, b: PerformanceMode): boolean {
  return (
    a.reducedMotion === b.reducedMotion &&
    a.isTouch === b.isTouch &&
    a.isLowPower === b.isLowPower &&
    a.richDesktopEffects === b.richDesktopEffects &&
    a.simpleVisuals === b.simpleVisuals
  );
}

function subscribe(onStoreChange: () => void): () => void {
  const media = [
    window.matchMedia(REDUCED_MOTION),
    window.matchMedia(HOVER),
    window.matchMedia(FINE_POINTER),
    window.matchMedia(DESKTOP),
  ];
  const onChange = (): void => {
    cachedSnapshot = null;
    onStoreChange();
  };
  media.forEach((mq) => mq.addEventListener("change", onChange));
  return () => {
    media.forEach((mq) => mq.removeEventListener("change", onChange));
  };
}

function getSnapshot(): PerformanceMode {
  const next = readMode();
  if (cachedSnapshot && sameMode(cachedSnapshot, next)) return cachedSnapshot;
  cachedSnapshot = next;
  return next;
}

function getServerSnapshot(): PerformanceMode {
  return SERVER_SNAPSHOT;
}

export function usePerformanceMode(): PerformanceMode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
