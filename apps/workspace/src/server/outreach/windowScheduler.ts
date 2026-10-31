import {
  formatLocalDateKey,
  minutesOfDayInTz,
  projectWallClock,
  tzParts,
  weekdayIndex,
} from "../lib/timezone";
import {
  DEFAULT_SCHEDULE_CONFIG,
  OUTREACH_BD_TZ,
  OUTREACH_CRON_GRACE_MINUTES,
  OUTREACH_WINDOW_DAYS,
  OUTREACH_WINDOW_END_MINUTES,
  OUTREACH_WINDOW_START_MINUTES,
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
