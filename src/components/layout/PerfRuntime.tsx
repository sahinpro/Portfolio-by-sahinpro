"use client";

import { usePerformanceMode } from "@/hooks/usePerformanceMode";
import { MotionConfig } from "framer-motion";
import { useLayoutEffect, type ReactNode } from "react";

/** Syncs `data-perf` after hydrate and disables Framer Motion trees on LOW. */
export function PerfRuntime({ children }: { children: ReactNode }): JSX.Element {
  const mode = usePerformanceMode();

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-perf", mode.level);
  }, [mode.level]);

  return (
    <MotionConfig reducedMotion={mode.level === "low" ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}
