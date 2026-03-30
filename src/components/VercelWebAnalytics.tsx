import { Analytics } from "@vercel/analytics/react";

/** Vercel dashboard analytics; admin charts stay on Supabase `page_views` (no Vercel metrics API). */
export function VercelWebAnalytics(): JSX.Element | null {
  if (!import.meta.env.PROD) return null;
  return <Analytics />;
}
