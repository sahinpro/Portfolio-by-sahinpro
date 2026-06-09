"use client";

import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { PublicSiteGate } from "@/components/layout/PublicSiteGate";
import { VercelWebAnalytics } from "@/components/analytics/VercelWebAnalytics";
import { Suspense, type ReactNode } from "react";

export function PublicLayoutShell({ children }: { children: ReactNode }): JSX.Element {
  return (
    <PublicSiteGate>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <VercelWebAnalytics />
      {children}
    </PublicSiteGate>
  );
}
