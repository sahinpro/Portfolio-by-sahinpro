export type OutreachZoneTarget = {
  marketId: string;
  marketName: string;
  flag: string;
  zoneId: string;
  city: string;
  tz: string;
};

/**
 * Admin-configurable outreach schedule. Days are ISO weekday indexes
 * (Sun = 0 … Sat = 6) evaluated in each prospect's local time zone.
 * `startMinutes` is minutes-from-midnight local time when the reminder fires.
 * `graceMinutes` is how long after `startMinutes` the cron may still send
 * (guards against a single missed tick, not against long downtime).
 */
export type OutreachScheduleConfig = {
  days: number[];
  startMinutes: number;
  graceMinutes: number;
  updatedAt: string;
};

/** Legacy defaults — kept so existing imports/tests continue to compile. */
export const OUTREACH_WINDOW_DAYS = [2, 3, 4] as const;
export const OUTREACH_WINDOW_START_MINUTES = 9 * 60 + 30;
export const OUTREACH_WINDOW_END_MINUTES = 11 * 60;
export const OUTREACH_WINDOW_OPEN_LABEL = "09:30";
export const OUTREACH_BD_TZ = "Asia/Dhaka";

/** How many minutes after the reminder time the cron may still fire. */
export const OUTREACH_CRON_GRACE_MINUTES = 4;

export const SITE_SETTING_PLANNER_ZONES_KEY = "outreach_planner_zones";
export const SITE_SETTING_SCHEDULE_CONFIG_KEY = "outreach_schedule_config";
export const SITE_SETTING_PLANNER_PREFS_KEY = "outreach_planner_prefs";

/**
 * Outreach Time Planner UI preferences (market filter + expanded/collapsed),
 * stored in `site_settings` so the planner is identical on every device.
 * Zone picks live in their own key (`outreach_planner_zones`) because the
 * reminder cron reads that shape directly.
 */
export type PlannerUiPreferences = {
  /** "all" or a known market id. */
  marketFilter: string;
  expanded: boolean;
};

export const DEFAULT_SCHEDULE_CONFIG: Omit<
  OutreachScheduleConfig,
  "updatedAt"
> = {
  days: [2, 3, 4],
  startMinutes: OUTREACH_WINDOW_START_MINUTES,
  graceMinutes: OUTREACH_CRON_GRACE_MINUTES,
};

/** Format a minutes-from-midnight value as an `HH:MM` label. */
export function formatWindowStartLabel(startMinutes: number): string {
  const h = Math.floor(startMinutes / 60);
  const m = startMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Daily Outreach Digest
// ---------------------------------------------------------------------------

/**
 * The digest covers every enabled target whose scheduled window opens within
 * `[digest execution time, digest execution time + this horizon)`.
 */
export const OUTREACH_DIGEST_HORIZON_HOURS = 24;

/**
 * Synthetic `iana_timezone` value used to reserve ONE digest per Bangladesh
 * calendar day in the existing `outreach_window_claims` table (PK
 * `(iana_timezone, local_date)`). It is deliberately not a real IANA zone, so
 * it can never collide with a legacy per-zone claim row. Reusing the claims
 * table keeps daily dedupe atomic and database-backed (no schema change, no
 * in-memory lock).
 */
export const OUTREACH_DIGEST_CLAIM_ZONE = "digest/asia-dhaka";

/** `window_start` label recorded on the digest claim for operator context. */
export const OUTREACH_DIGEST_CLAIM_LABEL = "daily-digest";

/**
 * Hour (Bangladesh local) the daily digest is scheduled to fire (08:00
 * Asia/Dhaka). The rendered payload is always anchored to this instant on the
 * Bangladesh calendar date — never to the raw tick time — so a claim-released
 * retry later in the same day rebuilds a BYTE-IDENTICAL email. Resend only
 * dedupes when the reused idempotency key carries an identical payload, so this
 * anchor is what makes the daily idempotency guard reliable.
 */
export const OUTREACH_DIGEST_SCHEDULE_HOUR = 8;

/** Example subject requested by the product owner. */
export const OUTREACH_DIGEST_SUBJECT =
  "Your Outreach Windows \u2014 Daily Summary";

/**
 * One upcoming outreach opportunity inside the digest's 24-hour horizon.
 * Every time field is derived from the real schedule + DST-aware zone math;
 * nothing here is hardcoded per city.
 */
export type DigestWindow = {
  zone: OutreachZoneTarget;
  /** Absolute UTC instant (epoch ms) the window opens — the sort key. */
  opensAtMs: number;
  /** Whole minutes from the digest timestamp until the window opens (>= 0). */
  minutesUntilOpen: number;
  /** Bangladesh `HH:MM` the window opens. */
  bdTimeLabel: string;
  /** Bangladesh calendar date key `YYYY-MM-DD` the window opens on. */
  bdDateKey: string;
  /** `Today` / `Tomorrow` / short weekday, relative to the digest BD date. */
  bdDayLabel: string;
  /** Prospect-local `HH:MM` the window opens (== the configured start). */
  localTimeLabel: string;
  /** Prospect-local calendar date key `YYYY-MM-DD`. */
  localDateKey: string;
  /** Prospect-local short weekday (e.g. `Tue`). */
  localDayLabel: string;
  /** IANA zone id. */
  tz: string;
  /** DST-aware readable abbreviation (e.g. `EDT`, `BST`, `GMT+6`). */
  tzAbbrev: string;
};

/** Digest windows grouped under a single Bangladesh calendar date. */
export type DigestGroup = {
  bdDateKey: string;
  bdDayLabel: string;
  /** Human date, e.g. `Tue, Nov 3`. */
  bdDateLabel: string;
  windows: DigestWindow[];
};

/** Fully-resolved data model rendered into the one daily digest email. */
export type DigestModel = {
  /** Digest execution instant (epoch ms). Every countdown is relative to this. */
  generatedAtMs: number;
  /** Bangladesh calendar date key of the digest run. */
  bdDateKey: string;
  /** Bangladesh `HH:MM` of the digest run. */
  bdTimeLabel: string;
  /** Bangladesh readable digest date, e.g. `Tue, Nov 3 2026`. */
  bdDateLabel: string;
  /** Horizon end (epoch ms) = generatedAtMs + OUTREACH_DIGEST_HORIZON_HOURS. */
  horizonEndMs: number;
  /** Configured local window-open label, e.g. `09:30`. */
  windowStartLabel: string;
  /** Chronologically sorted (soonest first) eligible windows. */
  windows: DigestWindow[];
  /** Same windows grouped by Bangladesh date, preserving chronological order. */
  groups: DigestGroup[];
  total: number;
  marketCount: number;
  /** Soonest upcoming window, or `undefined` when there are none. */
  next?: DigestWindow;
  /** `in 3h 20m` style countdown for the next window, from `generatedAtMs`. */
  nextCountdownLabel?: string;
};
