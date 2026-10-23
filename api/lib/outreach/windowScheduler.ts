import {
  formatLocalDateKey,
  minutesOfDayInTz,
  projectWallClock,
  tzParts,
  weekdayIndex,
} from "../timezone";
import {
  OUTREACH_BD_TZ,
  OUTREACH_CRON_GRACE_MINUTES,
  OUTREACH_WINDOW_DAYS,
  OUTREACH_WINDOW_END_MINUTES,
  OUTREACH_WINDOW_START_MINUTES,
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
): string {
  const start = projectWallClock(
    prospectTz,
    OUTREACH_BD_TZ,
    9,
    30,
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
 * True only during Tue–Thu, within [09:30, 09:30 + grace) local time.
 * Never matches outside that narrow band (no backlog after downtime).
 */
export function isOutreachWindowOpeningNow(
  tz: string,
  now: Date,
  graceMinutes: number = OUTREACH_CRON_GRACE_MINUTES,
): boolean {
  const parts = tzParts(tz, now);
  const dow = weekdayIndex(parts.weekday);
  if (!OUTREACH_WINDOW_DAYS.includes(dow as 2 | 3 | 4)) return false;

  const minutes = minutesOfDayInTz(tz, now);
  return (
    minutes >= OUTREACH_WINDOW_START_MINUTES &&
    minutes < OUTREACH_WINDOW_START_MINUTES + graceMinutes
  );
}

export function findZonesOpeningNow(
  zones: OutreachZoneTarget[],
  now: Date,
): WindowOpenMatch[] {
  const matches: WindowOpenMatch[] = [];
  for (const zone of zones) {
    if (!isOutreachWindowOpeningNow(zone.tz, now)) continue;
    const parts = tzParts(zone.tz, now);
    matches.push({
      zone,
      localDate: formatLocalDateKey(parts),
      localTimeLabel: `${parts.weekday} ${formatClock(parts.hour, parts.minute)}`,
      bdWindowLabel: formatBangladeshWindow(zone.tz, now),
    });
  }
  return matches;
}

export function isValidOutreachWeekday(tz: string, at: Date): boolean {
  const parts = tzParts(tz, at);
  const dow = weekdayIndex(parts.weekday);
  return OUTREACH_WINDOW_DAYS.includes(dow as 2 | 3 | 4);
}

export function outreachWindowEndMinutes(): number {
  return OUTREACH_WINDOW_END_MINUTES;
}
