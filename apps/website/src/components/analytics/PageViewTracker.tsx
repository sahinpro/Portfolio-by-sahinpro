"use client";

import { deferUntilIdle } from "@/lib/deferUntilIdle";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const DEDUPE_MS = 2600;

/**
 * Records public route views (skips `/admin`). Mount once inside the router.
 */
export function PageViewTracker(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastRef = useRef({ key: "", t: 0 });

  useEffect(() => {
    const search = searchParams.toString();
    const path = `${pathname}${search ? `?${search}` : ""}`;
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
  }, [pathname, searchParams]);

  return null;
}
