import { supabase } from "@sahinpro/shared/supabase";

export type OutreachScheduleConfig = {
  days: number[];
  startMinutes: number;
  graceMinutes: number;
  updatedAt: string;
};

/** Everything the Outreach Time Planner persists — all of it lives in Supabase. */
export type PlannerPreferences = {
  /** Market id → IANA time zone the user picked for it. */
  outreachZones: Record<string, string>;
  /** "all" or a market id. */
  marketFilter: string;
  expanded: boolean;
};

async function bearerToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * Read the planner's saved zone picks and UI preferences from Supabase
 * (`site_settings`, served by the admin-only planner-zones route).
 * Returns null when signed out or on any failure — the planner then falls back
 * to its defaults rather than reading any browser-local store.
 */
export async function fetchPlannerPreferencesFromCloud(): Promise<PlannerPreferences | null> {
  const token = await bearerToken();
  if (!token) return null;

  const res = await fetch("/api/admin/outreach-planner-zones", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;

  const json = (await res.json()) as {
    outreachZones?: Record<string, string>;
    prefs?: { marketFilter?: string; expanded?: boolean };
  };
  return {
    outreachZones: json.outreachZones ?? {},
    marketFilter: json.prefs?.marketFilter ?? "all",
    expanded: json.prefs?.expanded !== false,
  };
}

/**
 * Persist the planner's zone picks and UI preferences to Supabase.
 * Throws on network/permission failure so the caller can surface it —
 * there is no browser-local fallback anymore.
 */
export async function savePlannerPreferencesToCloud(
  prefs: PlannerPreferences,
): Promise<void> {
  const token = await bearerToken();
  if (!token) throw new Error("Sign in again to save planner preferences.");

  const res = await fetch("/api/admin/outreach-planner-zones", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      outreachZones: prefs.outreachZones,
      prefs: { marketFilter: prefs.marketFilter, expanded: prefs.expanded },
    }),
  });
  if (!res.ok) {
    throw new Error(`Planner preference save failed (${res.status}).`);
  }
}

/** Fetch the server-side schedule config. Returns null on any failure. */
export async function fetchScheduleConfigFromCloud(): Promise<OutreachScheduleConfig | null> {
  const token = await bearerToken();
  if (!token) return null;

  const res = await fetch("/api/admin/outreach-schedule", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;

  const json = (await res.json()) as { schedule?: OutreachScheduleConfig };
  return json.schedule ?? null;
}

/** Push the schedule config to Supabase so the cron can read it. */
export async function syncScheduleConfigToCloud(
  schedule: OutreachScheduleConfig,
): Promise<void> {
  const token = await bearerToken();
  if (!token) return;

  await fetch("/api/admin/outreach-schedule", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ schedule }),
  });
}
