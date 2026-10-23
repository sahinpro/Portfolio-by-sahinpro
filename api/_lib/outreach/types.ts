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

export const DEFAULT_SCHEDULE_CONFIG: Omit<OutreachScheduleConfig, "updatedAt"> = {
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
