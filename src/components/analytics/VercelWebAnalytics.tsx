import { env } from "@/lib/env";
import { deferUntilIdle } from "@/lib/deferUntilIdle";
import { useEffect } from "react";

/** Vercel dashboard analytics; loaded after idle so it does not block main-thread metrics. */
export function VercelWebAnalytics(): null {
  useEffect(() => {
    if (!env.isProd) return;

    return deferUntilIdle(() => {
      void import("@vercel/analytics").then(({ inject }) => {
        inject({ framework: "next" });
      });
    }, 4000);
  }, []);

  return null;
}
