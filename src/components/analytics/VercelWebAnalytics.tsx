"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/**
 * Match `/admin`, `/admin/leads`, `/admin/login`, and any nested `/admin/...`
 * route robustly, whether `event.url` is an absolute URL or a path. Falls back
 * to a substring test if URL parsing ever fails so admin routes are never
 * leaked to analytics on an unexpected value.
 */
function isExcludedPath(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const { pathname } = new URL(url, window.location.origin);
    return pathname === "/admin" || pathname.startsWith("/admin/");
  } catch {
    const path = url.split("?")[0].split("#")[0];
    return /(^|\/)admin(\/|$)/.test(path);
  }
}

function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  return isExcludedPath(event.url) ? null : event;
}

/**
 * Vercel Web Analytics via the supported Next.js integration. This component is
 * rendered exactly once (from `PublicLayoutShell`), and `Analytics` itself
 * guards against duplicate script injection. `beforeSend` cancels every
 * `/admin/*` pageview/custom event while public pages keep reporting.
 */
export function VercelWebAnalytics(): JSX.Element {
  return <Analytics beforeSend={beforeSend} />;
}
