import { DEFAULT_SCHEDULE_CONFIG, type OutreachScheduleConfig } from "./types";

/** Inclusive bounds enforced on both server and client. */
const MINUTES_MIN = 0;
const MINUTES_MAX = 23 * 60 + 55; // 23:55
const GRACE_MIN = 1;
const GRACE_MAX = 30;

/**
 * Outcome of loading the schedule setting from `site_settings`.
 * - `ok`      → valid saved config found
 * - `missing` → query succeeded but no row/value exists (fresh install) → safe to use defaults
 * - `invalid` → a row exists but its content cannot be parsed → fail safe, do NOT send
 * - `error`   → the query or the client failed → do NOT send; retried on the next cron tick
 */
export type ScheduleConfigLoad =
  | { status: "ok"; config: OutreachScheduleConfig }
  | { status: "missing"; config: OutreachScheduleConfig }
  | { status: "invalid"; reason: string }
  | { status: "error"; reason: string };

function isWeekdayIndex(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 6;
}

/**
 * Coerce arbitrary JSON (from DB or a PUT body) into a valid config.
 * Unknown fields are dropped; invalid values fall back to defaults so the
 * cron never sends on a partially-misconfigured schedule.
 */
export function sanitizeScheduleConfig(raw: unknown): OutreachScheduleConfig {
  const out: OutreachScheduleConfig = {
    days: [...DEFAULT_SCHEDULE_CONFIG.days],
    startMinutes: DEFAULT_SCHEDULE_CONFIG.startMinutes,
    graceMinutes: DEFAULT_SCHEDULE_CONFIG.graceMinutes,
    updatedAt: "",
  };

  if (!raw || typeof raw !== "object") return out;
  const src = raw as Record<string, unknown>;

  if (Array.isArray(src.days)) {
    const seen = new Set<number>();
    for (const d of src.days) {
      if (isWeekdayIndex(d)) seen.add(d);
    }
    if (seen.size > 0) {
      out.days = [...seen].sort((a, b) => a - b);
    }
  }

  if (
    typeof src.startMinutes === "number" &&
    Number.isInteger(src.startMinutes) &&
    src.startMinutes >= MINUTES_MIN &&
    src.startMinutes <= MINUTES_MAX
  ) {
    out.startMinutes = src.startMinutes;
  }

  if (
    typeof src.graceMinutes === "number" &&
    Number.isInteger(src.graceMinutes) &&
    src.graceMinutes >= GRACE_MIN &&
    src.graceMinutes <= GRACE_MAX
  ) {
    out.graceMinutes = src.graceMinutes;
  }

  if (typeof src.updatedAt === "string") {
    out.updatedAt = src.updatedAt;
  }

  return out;
}

/** Parse a stored JSON string; returns the defaults on any failure. */
export function parseScheduleConfigJson(
  json: string | null | undefined,
): OutreachScheduleConfig {
  if (!json) return sanitizeScheduleConfig(null);
  try {
    return sanitizeScheduleConfig(JSON.parse(json));
  } catch {
    return sanitizeScheduleConfig(null);
  }
}

/**
 * Interpret a raw `site_settings.value` string without silently falling back.
 * A stored-but-unparseable value is `invalid` (never `missing`), so callers
 * can distinguish "fresh install" from "corrupted config" and refuse to send.
 */
export function interpretScheduleConfigJson(
  json: string | null | undefined,
): ScheduleConfigLoad {
  if (json === null || json === undefined || json.trim() === "") {
    return { status: "missing", config: sanitizeScheduleConfig(null) };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { status: "invalid", reason: "Stored schedule is not valid JSON" };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      status: "invalid",
      reason: "Stored schedule is not a JSON object",
    };
  }
  const src = parsed as Record<string, unknown>;
  if (!Array.isArray(src.days) || src.days.length === 0) {
    return {
      status: "invalid",
      reason:
        "Stored schedule has no weekdays array — refusing to send on defaults",
    };
  }
  return { status: "ok", config: sanitizeScheduleConfig(parsed) };
}
