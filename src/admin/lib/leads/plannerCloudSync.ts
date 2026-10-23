import { supabase } from "@/utils/supabase";

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
