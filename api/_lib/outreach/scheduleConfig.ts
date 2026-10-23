import {
  DEFAULT_SCHEDULE_CONFIG,
  type OutreachScheduleConfig,
} from "./types";

/** Inclusive bounds enforced on both server and client. */
const MINUTES_MIN = 0;
const MINUTES_MAX = 23 * 60 + 55; // 23:55
const GRACE_MIN = 1;
const GRACE_MAX = 30;

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
