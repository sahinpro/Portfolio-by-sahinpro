import { getSupabaseServiceClient } from "../lib/supabaseService";
import { buildDigestModel, resolveDigestAnchor } from "./dailyDigest";
import { recordNotificationDelivery } from "./notificationLog";
import {
  buildDigestHtml,
  buildDigestPlainText,
  buildDigestSubject,
  sendDailyOutreachDigestEmail,
} from "./outreachEmail";
import {
  claimReminderSlot,
  getReminderClaimClient,
  releaseReminderSlot,
} from "./reminderClaim";
import {
  interpretScheduleConfigJson,
  sanitizeScheduleConfig,
  type ScheduleConfigLoad,
} from "./scheduleConfig";
import {
  OUTREACH_DIGEST_CLAIM_LABEL,
  OUTREACH_DIGEST_CLAIM_ZONE,
  SITE_SETTING_PLANNER_ZONES_KEY,
  SITE_SETTING_SCHEDULE_CONFIG_KEY,
  type DigestModel,
} from "./types";
import { resolveNotificationZones, sanitizePlannerZones } from "./zonesConfig";

export type OutreachDigestPreview = {
  subject: string;
  text: string;
  html: string;
};

export type OutreachDigestResult = {
  checkedAt: string;
  /** Bangladesh calendar date the digest is claimed/rendered against. */
  bdDate: string;
  /** Number of eligible windows in the next-24h horizon. */
  windowCount: number;
  /** The one combined digest email was sent. */
  sent: boolean;
  /** Nothing was sent (no eligible windows, already claimed today, or fail-safe). */
  skipped: boolean;
  reason?: string;
  resendId?: string;
  failed?: string;
  warnings: string[];
  schedule?: { days: number[]; startMinutes: number };
  /** Populated only in `dryRun`/preview — renders without any send. */
  preview?: OutreachDigestPreview;
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

/**
 * Load the schedule setting without ever silently falling back to defaults on a
 * failure: `error`/`invalid` outcomes must stop the run, while a genuinely
 * missing setting (fresh install) may use the documented defaults.
 */
async function loadScheduleConfigFromDb(): Promise<ScheduleConfigLoad> {
  const client = getSupabaseServiceClient();
  if (!client) {
    return {
      status: "error",
      reason: "Supabase service client is unavailable (missing env keys)",
    };
  }

  const { data, error } = await client
    .from("site_settings")
    .select("value")
    .eq("key", SITE_SETTING_SCHEDULE_CONFIG_KEY)
    .maybeSingle();

  if (error) {
    console.error("[outreach-digest] schedule lookup failed", {
      code: error.code,
      message: error.message,
    });
    return {
      status: "error",
      reason: `site_settings query failed: ${error.message}`,
    };
  }

  return interpretScheduleConfigJson(data?.value ?? null);
}

function digestDeliveryRow(
  model: DigestModel,
  status: "sent" | "failed",
  resendId: string | null,
  errorMessage: string | null,
) {
  return {
    iana_timezone: OUTREACH_DIGEST_CLAIM_ZONE,
    local_date: model.bdDateKey,
    window_start: OUTREACH_DIGEST_CLAIM_LABEL,
    market_id: "daily-digest",
    zone_city: `Daily digest (${model.total} window${model.total === 1 ? "" : "s"})`,
    status,
    resend_id: resendId,
    error_message: errorMessage,
  };
}

/**
 * The single daily outreach digest.
 *
 * Replaces the old every-tick per-city/per-timezone reminder loop. It resolves
 * the enabled targets + schedule (same loaders as before), builds one combined
 * model covering `[now, now + 24h)`, and — guarded by an atomic, database-backed
 * daily claim — sends exactly ONE email per Bangladesh calendar day. It NEVER
 * messages prospects; the recipient is the owner's own notification address.
 */
export async function runDailyOutreachDigest(
  now: Date = new Date(),
  options: { dryRun?: boolean } = {},
): Promise<OutreachDigestResult> {
  const dryRun = options.dryRun === true;
  const result: OutreachDigestResult = {
    checkedAt: now.toISOString(),
    bdDate: "",
    windowCount: 0,
    sent: false,
    skipped: false,
    warnings: [],
  };

  // Preview renders without sending, so it must not require send credentials.
  if (!dryRun) {
    if (!process.env.RESEND_API_KEY?.trim()) {
      result.warnings.push("RESEND_API_KEY is not configured");
      result.skipped = true;
      result.reason = "RESEND_API_KEY is not configured";
      return result;
    }
    if (!process.env.CONTACT_NOTIFICATION_TO_EMAIL?.trim()) {
      result.warnings.push("CONTACT_NOTIFICATION_TO_EMAIL is not configured");
      result.skipped = true;
      result.reason = "CONTACT_NOTIFICATION_TO_EMAIL is not configured";
      return result;
    }

    // Scheduling guard. The digest is designed to fire at 08:00 Asia/Dhaka,
    // but the ACTIVE production scheduler is still `*/3 * * * *` (see
    // docs/MONOREPO_CUTOVER_RUNBOOK.md §4). Without this check, the very
    // first tick after Bangladesh midnight (~00:03 BD) would build a model
    // anchored to a still-FUTURE 08:00, acquire today's daily claim and ship
    // the email ~8h early — and the real 08:00 tick would then see the claim
    // already taken and skip. Refuse until `now` reaches today's 08:00 BD
    // anchor: no DB reads, no claim acquisition, no provider call and no
    // release/modification of an existing claim. Dry-run/preview is exempt so
    // the admin test route still renders on demand at any hour.
    const digestAnchor = resolveDigestAnchor(now);
    if (now.getTime() < digestAnchor.getTime()) {
      result.skipped = true;
      result.reason =
        "Digest not due yet — before today's 08:00 Asia/Dhaka anchor";
      return result;
    }
  }

  const [plannerZones, scheduleLoad] = await Promise.all([
    loadPlannerZonesFromDb(),
    loadScheduleConfigFromDb(),
  ]);

  // Fail-safe: a broken or unreachable schedule config must never send on
  // fallback defaults. Only a genuinely missing setting uses documented
  // defaults; the daily claim makes a later successful run still once-per-day.
  if (scheduleLoad.status === "error" || scheduleLoad.status === "invalid") {
    result.skipped = true;
    result.reason = `Schedule config unavailable (${scheduleLoad.status}): ${scheduleLoad.reason}`;
    result.warnings.push(`${result.reason} — no digest sent`);
    return result;
  }

  const schedule = scheduleLoad.config;
  result.schedule = {
    days: schedule.days,
    startMinutes: schedule.startMinutes,
  };

  if (scheduleLoad.status === "missing") {
    result.warnings.push(
      "No saved schedule found — using documented defaults (Tue–Thu 09:30 local per zone)",
    );
  }

  if (!schedule.days || schedule.days.length === 0) {
    result.skipped = true;
    result.reason = "Schedule has no weekdays selected";
    result.warnings.push(`${result.reason} — skipping`);
    return result;
  }

  const zones = resolveNotificationZones(
    plannerZones,
    process.env.OUTREACH_NOTIFICATION_ZONES,
  );

  // Anchor the model to the scheduled 08:00 Asia/Dhaka instant for this
  // Bangladesh date (not the raw tick time) so a claim-released retry later in
  // the same day rebuilds a byte-identical payload — which is what makes the
  // daily Resend idempotency key actually dedupe instead of double-sending.
  const model = buildDigestModel(zones, resolveDigestAnchor(now), schedule);
  result.bdDate = model.bdDateKey;
  result.windowCount = model.total;

  if (dryRun) {
    result.preview = {
      subject: buildDigestSubject(model, true),
      text: buildDigestPlainText(model, true),
      html: buildDigestHtml(model, true),
    };
    result.skipped = true;
    result.reason = "preview (dry-run) — nothing sent";
    return result;
  }

  // No eligible window in the horizon → skip cleanly (never send an empty
  // digest, never claim the day so a same-day re-run after config changes can
  // still surface windows).
  if (model.total === 0) {
    result.skipped = true;
    result.reason = "No eligible windows in the next 24 hours";
    return result;
  }

  // Atomic daily claim keyed on (synthetic digest zone, Bangladesh calendar
  // date). Concurrent runs for the same day cannot both win.
  const claimClient = getReminderClaimClient();
  if (!claimClient) {
    result.skipped = true;
    result.reason = "Claim client unavailable";
    result.warnings.push(
      "Supabase service client unavailable — cannot claim daily digest slot; skipping (fail-safe, no send)",
    );
    return result;
  }

  const claim = await claimReminderSlot(claimClient, {
    ianaTimezone: OUTREACH_DIGEST_CLAIM_ZONE,
    localDate: model.bdDateKey,
    windowStart: OUTREACH_DIGEST_CLAIM_LABEL,
  });
  if (claim.status === "error") {
    result.skipped = true;
    result.reason = `Claim lookup failed: ${claim.reason}`;
    result.warnings.push(`${result.reason} — skipping (fail-safe, no send)`);
    return result;
  }
  if (claim.status === "duplicate") {
    result.skipped = true;
    result.reason =
      "Daily digest already claimed/sent for this Bangladesh date";
    return result;
  }

  try {
    const { id } = await sendDailyOutreachDigestEmail(model);
    await recordNotificationDelivery(
      digestDeliveryRow(model, "sent", id, null),
    );
    result.sent = true;
    result.resendId = id;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    result.failed = message;
    // Provider failure: record FAILED (not a false success) and release the
    // daily claim so a later tick today can retry the digest.
    await recordNotificationDelivery(
      digestDeliveryRow(model, "failed", null, message.slice(0, 500)),
    );
    const releaseError = await releaseReminderSlot(
      claimClient,
      OUTREACH_DIGEST_CLAIM_ZONE,
      model.bdDateKey,
    );
    if (releaseError) {
      result.warnings.push(
        `Daily claim release failed: ${releaseError} — no retry today (fail-safe against double send)`,
      );
    }
  }

  return result;
}

/**
 * Render the digest model for a preview WITHOUT claiming or sending anything.
 * Used by the admin `outreach-notifications/test` route. A corrupted schedule
 * falls back to documented defaults here (a preview is inert and never hits the
 * production daily claim), unlike the real run which refuses to send.
 */
export async function buildDigestForPreview(
  now: Date = new Date(),
): Promise<DigestModel> {
  const [plannerZones, scheduleLoad] = await Promise.all([
    loadPlannerZonesFromDb(),
    loadScheduleConfigFromDb(),
  ]);
  const schedule =
    scheduleLoad.status === "ok" || scheduleLoad.status === "missing"
      ? scheduleLoad.config
      : sanitizeScheduleConfig(null);
  const zones = resolveNotificationZones(
    plannerZones,
    process.env.OUTREACH_NOTIFICATION_ZONES,
  );
  return buildDigestModel(zones, now, schedule);
}
