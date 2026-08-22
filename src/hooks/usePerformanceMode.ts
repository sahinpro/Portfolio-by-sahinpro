"use client";

import {
  PERF_MEDIA_QUERIES,
  SERVER_PERFORMANCE_SNAPSHOT,
  readPerformanceSnapshot,
  samePerformanceSnapshot,
  type PerformanceSnapshot,
} from "@/lib/performanceLevel";
import { useSyncExternalStore } from "react";

export type { PerfLevel, PerformanceSnapshot as PerformanceMode } from "@/lib/performanceLevel";

let cachedSnapshot: PerformanceSnapshot | null = null;

function subscribe(onStoreChange: () => void): () => void {
  const media = PERF_MEDIA_QUERIES.map((query) => window.matchMedia(query));
  const onChange = (): void => {
    cachedSnapshot = null;
    onStoreChange();
  };
  media.forEach((mq) => mq.addEventListener("change", onChange));
  return () => {
    media.forEach((mq) => mq.removeEventListener("change", onChange));
  };
}

function getSnapshot(): PerformanceSnapshot {
  const next = readPerformanceSnapshot();
  if (cachedSnapshot && samePerformanceSnapshot(cachedSnapshot, next)) {
    return cachedSnapshot;
  }
  cachedSnapshot = next;
  return next;
}

function getServerSnapshot(): PerformanceSnapshot {
  return SERVER_PERFORMANCE_SNAPSHOT;
}

export function usePerformanceMode(): PerformanceSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
