import { getSupabaseServiceClient } from "../supabaseService";
import {
  recordNotificationDelivery,
  wasNotificationAlreadySent,
} from "./notificationLog";
import { sendOutreachWindowEmail } from "./outreachEmail";
import { SITE_SETTING_PLANNER_ZONES_KEY } from "./types";
import { sanitizePlannerZones, resolveNotificationZones } from "./zonesConfig";
import {
  findZonesOpeningNow,
  formatBangladeshWindow,
  type WindowOpenMatch,
} from "./windowScheduler";
import { formatLocalDateKey, tzParts } from "../timezone";
import type { OutreachZoneTarget } from "./types";

export type OutreachRunResult = {
  checkedAt: string;
  matches: number;
  sent: string[];
  skipped: string[];
  failed: { tz: string; error: string }[];
  warnings: string[];
};

async function loadPlannerZonesFromDb(): Promise<Record<string, string>> {
  const client = getSupabaseServiceClient();
  if (!client) return {};

  const { data, error } = await client
    .from("site_settings")
    .select("value")
    .eq("key", SITE_SETTING_PLANNER_ZONES_KEY)
    .maybeSingle();

  if (error || !data?.value) return {};

  try {
    return sanitizePlannerZones(JSON.parse(data.value));
  } catch {
    return {};
  }
}

export async function runOutreachWindowNotifications(
  now: Date = new Date(),
  options: { dryRun?: boolean } = {},
): Promise<OutreachRunResult> {
  const result: OutreachRunResult = {
    checkedAt: now.toISOString(),
    matches: 0,
    sent: [],
    skipped: [],
    failed: [],
    warnings: [],
  };

  if (!process.env.RESEND_API_KEY?.trim()) {
    result.warnings.push("RESEND_API_KEY is not configured");
    return result;
  }
  if (!process.env.CONTACT_NOTIFICATION_TO_EMAIL?.trim()) {
    result.warnings.push("CONTACT_NOTIFICATION_TO_EMAIL is not configured");
    return result;
  }

  const plannerZones = await loadPlannerZonesFromDb();
  const zones = resolveNotificationZones(
    plannerZones,
    process.env.OUTREACH_NOTIFICATION_ZONES,
  );

  const matches = findZonesOpeningNow(zones, now);
  result.matches = matches.length;

  for (const match of matches) {
    const key = `${match.zone.tz}@${match.localDate}`;
    if (options.dryRun) {
      result.skipped.push(`${key} (dry-run)`);
      continue;
    }

    const alreadySent = await wasNotificationAlreadySent(
      match.zone.tz,
      match.localDate,
    );
    if (alreadySent) {
      result.skipped.push(`${key} (already sent)`);
      continue;
    }

    try {
      const { id } = await sendOutreachWindowEmail(match);
      await recordNotificationDelivery({
        iana_timezone: match.zone.tz,
        local_date: match.localDate,
        window_start: "09:30",
        market_id: match.zone.marketId,
        zone_city: match.zone.city,
        status: "sent",
        resend_id: id,
        error_message: null,
      });
      result.sent.push(key);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Send failed";
      result.failed.push({ tz: match.zone.tz, error: message });
      await recordNotificationDelivery({
        iana_timezone: match.zone.tz,
        local_date: match.localDate,
        window_start: "09:30",
        market_id: match.zone.marketId,
        zone_city: match.zone.city,
        status: "failed",
        resend_id: null,
        error_message: message.slice(0, 500),
      });
    }
  }

  return result;
}

export function buildTestMatch(
  zone: OutreachZoneTarget,
  now: Date,
): WindowOpenMatch {
  const matches = findZonesOpeningNow([zone], now);
  if (matches[0]) return matches[0];
  const parts = tzParts(zone.tz, now);
  return {
    zone,
    localDate: formatLocalDateKey(parts),
    localTimeLabel: `${parts.weekday} ${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`,
    bdWindowLabel: formatBangladeshWindow(zone.tz, now),
  };
}
