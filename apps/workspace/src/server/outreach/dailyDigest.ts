import { formatLocalDateKey, localWallToUtcMs, tzParts } from "../lib/timezone";
import {
  OUTREACH_BD_TZ,
  OUTREACH_DIGEST_HORIZON_HOURS,
  OUTREACH_DIGEST_SCHEDULE_HOUR,
  formatWindowStartLabel,
  type DigestGroup,
  type DigestModel,
  type OutreachScheduleConfig,
  type OutreachZoneTarget,
} from "./types";
import { findUpcomingOutreachWindows } from "./windowScheduler";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
const WEEKDAYS_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Readable `Tue, Nov 3` (or `Tue, Nov 3 2026` with `withYear`) for a
 * `YYYY-MM-DD` BD date key. Derived from the date parts, so it needs no
 * timezone re-resolution — the key is already a Bangladesh calendar date.
 */
export function formatBdDateLabel(dateKey: string, withYear = false): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return dateKey;
  const weekday = WEEKDAYS_SHORT[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const base = `${weekday}, ${MONTHS_SHORT[m - 1]} ${d}`;
  return withYear ? `${base} ${y}` : base;
}

/**
 * `in 3h 20m` style countdown from whole minutes. Windows in the horizon are
 * always `>= 0` minutes away (the scheduler drops any that opened before the
 * digest timestamp), so there is no "expired" branch here.
 */
export function formatCountdown(minutes: number): string {
  if (minutes < 1) return "opening now";
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins === 0 ? `in ${hours}h` : `in ${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  return `in ${days}d ${hours % 24}h`;
}

/**
 * Canonical digest instant for a run: 08:00 Asia/Dhaka on the Bangladesh
 * calendar date `now` falls on. Resolved DST-aware via `localWallToUtcMs`
 * (Asia/Dhaka has no DST, but the helper keeps the math honest). Building the
 * model from this anchor rather than the raw tick time makes every derived
 * field — the window set, Bangladesh time label, generated timestamp and the
 * next-opportunity countdown — identical for every retry of the same
 * Bangladesh date, which is what lets the daily idempotency key dedupe safely
 * at Resend. Asia/Dhaka's offset is fixed, so `now` and its anchor always share
 * the same Bangladesh date key and therefore the same daily claim.
 */
export function resolveDigestAnchor(now: Date): Date {
  const bd = tzParts(OUTREACH_BD_TZ, now);
  return new Date(
    localWallToUtcMs(
      OUTREACH_BD_TZ,
      bd.year,
      bd.month,
      bd.day,
      OUTREACH_DIGEST_SCHEDULE_HOUR,
      0,
    ),
  );
}

/**
 * Assemble the full digest data model from the resolved targets + schedule.
 * Nothing here is hardcoded per city: windows, ordering, grouping, the summary
 * metrics and the next-opportunity countdown are ALL derived from the actual
 * digest data via `findUpcomingOutreachWindows`.
 */
export function buildDigestModel(
  zones: OutreachZoneTarget[],
  digestTime: Date,
  schedule: OutreachScheduleConfig,
): DigestModel {
  const windows = findUpcomingOutreachWindows(zones, digestTime, schedule);

  const bdParts = tzParts(OUTREACH_BD_TZ, digestTime);
  const bdDateKey = formatLocalDateKey(bdParts);

  // Group consecutive windows under their Bangladesh calendar date while
  // preserving the chronological order already established by the scheduler.
  const groups: DigestGroup[] = [];
  for (const window of windows) {
    const last = groups[groups.length - 1];
    if (last && last.bdDateKey === window.bdDateKey) {
      last.windows.push(window);
      continue;
    }
    groups.push({
      bdDateKey: window.bdDateKey,
      bdDayLabel: window.bdDayLabel,
      bdDateLabel: formatBdDateLabel(window.bdDateKey),
      windows: [window],
    });
  }

  const markets = new Set(windows.map((w) => w.zone.marketId));
  const next = windows[0];

  return {
    generatedAtMs: digestTime.getTime(),
    bdDateKey,
    bdTimeLabel: `${pad(bdParts.hour)}:${pad(bdParts.minute)}`,
    bdDateLabel: formatBdDateLabel(bdDateKey, true),
    horizonEndMs:
      digestTime.getTime() + OUTREACH_DIGEST_HORIZON_HOURS * 3600_000,
    windowStartLabel: formatWindowStartLabel(schedule.startMinutes),
    windows,
    groups,
    total: windows.length,
    marketCount: markets.size,
    next,
    nextCountdownLabel: next
      ? formatCountdown(next.minutesUntilOpen)
      : undefined,
  };
}
