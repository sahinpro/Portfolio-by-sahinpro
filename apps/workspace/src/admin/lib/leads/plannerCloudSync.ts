import { supabase } from "@sahinpro/shared/supabase";

export type OutreachScheduleConfig = {
  days: number[];
  startMinutes: number;
  graceMinutes: number;
  updatedAt: string;
};

/**
 * Persist Outreach Time Planner zone picks to Supabase so server cron can read them.
 * Best-effort: failures do not block local IndexedDB saves.
 */
export async function syncPlannerZonesToCloud(
  outreachZones: Record<string, string>,
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return;

  await fetch("/api/admin/outreach-planner-zones", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ outreachZones }),
  });
}

/** Fetch the server-side schedule config. Returns null on any failure. */
export async function fetchScheduleConfigFromCloud(): Promise<OutreachScheduleConfig | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
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
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
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
