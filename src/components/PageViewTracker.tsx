import { deferUntilIdle } from "@/lib/deferUntilIdle";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const DEDUPE_MS = 2600;

/**
 * Records public route views (skips `/admin`). Mount once inside the router.
 */
export function PageViewTracker(): null {
  const location = useLocation();
  const lastRef = useRef({ key: "", t: 0 });

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    if (path.startsWith("/admin")) return;

    const now = Date.now();
    if (lastRef.current.key === path && now - lastRef.current.t < DEDUPE_MS) {
      return;
    }
    lastRef.current = { key: path, t: now };

    return deferUntilIdle(() => {
      void import("@/lib/recordPageView").then(({ recordPageView }) =>
        recordPageView(path || "/"),
      );
    }, 4500);
  }, [location.pathname, location.search]);

  return null;
}
