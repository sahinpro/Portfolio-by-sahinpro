import {
  formatLocalDateKey,
  localWallToUtcMs,
  minutesOfDayInTz,
  projectWallClock,
  tzAbbrev,
  tzParts,
  weekdayIndex,
} from "../lib/timezone";
import {
  DEFAULT_SCHEDULE_CONFIG,
  OUTREACH_BD_TZ,
  OUTREACH_CRON_GRACE_MINUTES,
  OUTREACH_DIGEST_HORIZON_HOURS,
  OUTREACH_WINDOW_DAYS,
  OUTREACH_WINDOW_END_MINUTES,
  OUTREACH_WINDOW_START_MINUTES,
  type DigestWindow,
  type OutreachScheduleConfig,
  type OutreachZoneTarget,
} from "./types";

export type WindowOpenMatch = {
  zone: OutreachZoneTarget;
  localDate: string;
  localTimeLabel: string;
  bdWindowLabel: string;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatClock(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}

export function formatBangladeshWindow(
  prospectTz: string,
  now: Date = new Date(),
  startMinutes: number = OUTREACH_WINDOW_START_MINUTES,
): string {
  const startHour = Math.floor(startMinutes / 60);
  const startMin = startMinutes % 60;
  const start = projectWallClock(
    prospectTz,
    OUTREACH_BD_TZ,
    startHour,
    startMin,
    now,
  );
  const end = projectWallClock(prospectTz, OUTREACH_BD_TZ, 11, 0, now);
  const dayNote =
    start.dayShift !== 0 || end.dayShift !== 0
      ? " (may span calendar days in Bangladesh)"
      : "";
  return `${formatClock(start.hour, start.minute)}–${formatClock(end.hour, end.minute)} Bangladesh time${dayNote}`;
}

/**
 * True only during the configured weekdays, within
 * [startMinutes, startMinutes + graceMinutes) local time.
 * Never matches outside that narrow band (no backlog after downtime).
 */
export function isOutreachWindowOpeningNow(
  tz: string,
  now: Date,
  graceMinutesOrConfig:
    | number
    | OutreachScheduleConfig = OUTREACH_CRON_GRACE_MINUTES,
): boolean {
  const config: Pick<
    OutreachScheduleConfig,
    "days" | "startMinutes" | "graceMinutes"
  > =
    typeof graceMinutesOrConfig === "number"
      ? {
          days: [...OUTREACH_WINDOW_DAYS],
          startMinutes: OUTREACH_WINDOW_START_MINUTES,
          graceMinutes: graceMinutesOrConfig,
        }
      : {
          days:
            graceMinutesOrConfig.days && graceMinutesOrConfig.days.length > 0
              ? graceMinutesOrConfig.days
              : [...DEFAULT_SCHEDULE_CONFIG.days],
          startMinutes:
            typeof graceMinutesOrConfig.startMinutes === "number"
              ? graceMinutesOrConfig.startMinutes
              : DEFAULT_SCHEDULE_CONFIG.startMinutes,
          graceMinutes:
            typeof graceMinutesOrConfig.graceMinutes === "number"
              ? graceMinutesOrConfig.graceMinutes
              : DEFAULT_SCHEDULE_CONFIG.graceMinutes,
        };

  const parts = tzParts(tz, now);
  const dow = weekdayIndex(parts.weekday);
  if (!config.days.includes(dow)) return false;

  const minutes = minutesOfDayInTz(tz, now);
  return (
    minutes >= config.startMinutes &&
    minutes < config.startMinutes + config.graceMinutes
  );
}

export function findZonesOpeningNow(
  zones: OutreachZoneTarget[],
  now: Date,
  config?: OutreachScheduleConfig,
): WindowOpenMatch[] {
  const matches: WindowOpenMatch[] = [];
  const startMinutes = config?.startMinutes ?? OUTREACH_WINDOW_START_MINUTES;
  for (const zone of zones) {
    if (
      !isOutreachWindowOpeningNow(
        zone.tz,
        now,
        config ?? OUTREACH_CRON_GRACE_MINUTES,
      )
    ) {
      continue;
    }
    const parts = tzParts(zone.tz, now);
    matches.push({
      zone,
      localDate: formatLocalDateKey(parts),
      localTimeLabel: `${parts.weekday} ${formatClock(parts.hour, parts.minute)}`,
      bdWindowLabel: formatBangladeshWindow(zone.tz, now, startMinutes),
    });
  }
  return matches;
}

export function isValidOutreachWeekday(
  tz: string,
  at: Date,
  days: readonly number[] = OUTREACH_WINDOW_DAYS,
): boolean {
  const parts = tzParts(tz, at);
  const dow = weekdayIndex(parts.weekday);
  return days.includes(dow);
}

export function outreachWindowEndMinutes(): number {
  return OUTREACH_WINDOW_END_MINUTES;
}

/**
 * Bangladesh-relative day label: `Today` / `Tomorrow` when the 24-hour horizon
 * crosses midnight, otherwise the short weekday. `Asia/Dhaka` has no DST, so a
 * plain calendar-day difference of the two BD date keys is exact.
 */
function bdRelativeDayLabel(
  windowBdDateKey: string,
  digestBdDateKey: string,
  windowBdWeekday: string,
): string {
  const toDayNumber = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    return Date.UTC(y, (m ?? 1) - 1, d ?? 1);
  };
  const diffDays = Math.round(
    (toDayNumber(windowBdDateKey) - toDayNumber(digestBdDateKey)) / 86_400_000,
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return windowBdWeekday;
}

/**
 * Enumerate every eligible window that OPENS within `[from, from + horizonHours)`.
 *
 * This is the digest's scheduling core and it deliberately does NOT reuse the
 * every-minute `findZonesOpeningNow` grace-band predicate: for a daily digest we
 * must look AHEAD a full day rather than match a 4-minute instant. For each zone
 * we walk its LOCAL calendar days, keep the ones whose local weekday is
 * configured, project the local `startMinutes` wall clock to a real DST-aware UTC
 * instant, and keep it only if that instant lands inside the horizon. Sorting is
 * by the absolute instant, which equals chronological Bangladesh time (fixed
 * offset), so the next opportunity is always first.
 */
export function findUpcomingOutreachWindows(
  zones: OutreachZoneTarget[],
  from: Date,
  schedule: OutreachScheduleConfig,
  horizonHours: number = OUTREACH_DIGEST_HORIZON_HOURS,
): DigestWindow[] {
  const startMinutes =
    typeof schedule.startMinutes === "number"
      ? schedule.startMinutes
      : DEFAULT_SCHEDULE_CONFIG.startMinutes;
  const hour = Math.floor(startMinutes / 60);
  const minute = startMinutes % 60;
  const days =
    schedule.days && schedule.days.length > 0
      ? schedule.days
      : [...DEFAULT_SCHEDULE_CONFIG.days];

  const fromMs = from.getTime();
  const toMs = fromMs + horizonHours * 60 * 60 * 1000;
  const digestBdParts = tzParts(OUTREACH_BD_TZ, from);
  const digestBdDateKey = formatLocalDateKey(digestBdParts);

  const out: DigestWindow[] = [];
  for (const zone of zones) {
    const anchor = tzParts(zone.tz, from);
    // Walk three local calendar days: enough to cover any 24h horizon plus a
    // boundary day; candidates outside `[fromMs, toMs)` are filtered below.
    for (let offset = 0; offset < 3; offset += 1) {
      const day = new Date(
        Date.UTC(anchor.year, anchor.month - 1, anchor.day + offset),
      );
      const y = day.getUTCFullYear();
      const mo = day.getUTCMonth() + 1;
      const d = day.getUTCDate();
      const localDow = day.getUTCDay(); // 0 = Sun … 6 = Sat (matches `days`)
      if (!days.includes(localDow)) continue;

      const opensAtMs = localWallToUtcMs(zone.tz, y, mo, d, hour, minute);
      if (opensAtMs < fromMs || opensAtMs >= toMs) continue;

      const opensAt = new Date(opensAtMs);
      const bdParts = tzParts(OUTREACH_BD_TZ, opensAt);
      const localParts = tzParts(zone.tz, opensAt);
      const bdDateKey = formatLocalDateKey(bdParts);
      out.push({
        zone,
        opensAtMs,
        minutesUntilOpen: Math.round((opensAtMs - fromMs) / 60000),
        bdTimeLabel: formatClock(bdParts.hour, bdParts.minute),
        bdDateKey,
        bdDayLabel: bdRelativeDayLabel(
          bdDateKey,
          digestBdDateKey,
          bdParts.weekday,
        ),
        localTimeLabel: formatClock(localParts.hour, localParts.minute),
        localDateKey: formatLocalDateKey(localParts),
        localDayLabel: localParts.weekday,
        tz: zone.tz,
        tzAbbrev: tzAbbrev(zone.tz, opensAt),
      });
    }
  }

  out.sort((a, b) => a.opensAtMs - b.opensAtMs);
  return out;
}
