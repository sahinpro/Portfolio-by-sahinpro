/**
 * IANA time-zone helpers built on Intl (Node + Edge).
 * DST offsets are resolved dynamically from the runtime's zone data.
 */

export type TzParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: string;
};

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function weekdayIndex(weekday: string): number {
  return WEEKDAY_INDEX[weekday] ?? -1;
}

/** Calendar parts for an instant inside an IANA zone. */
export function tzParts(tz: string, date: Date = new Date()): TzParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const out: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== "literal") out[p.type] = p.value;
  }
  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour),
    minute: Number(out.minute),
    weekday: out.weekday,
  };
}

/** Signed offset (in minutes) of a zone from UTC at the given instant. */
export function tzOffsetMinutes(tz: string, utcDate: Date): number {
  const p = tzParts(tz, utcDate);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return Math.round((asUtc - utcDate.getTime()) / 60000);
}

export function projectWallClock(
  fromTz: string,
  toTz: string,
  hour: number,
  minute: number,
  now: Date = new Date(),
): { hour: number; minute: number; dayShift: number } {
  const today = tzParts(fromTz, now);
  const wall = Date.UTC(today.year, today.month - 1, today.day, hour, minute);
  const dayAnchor = Date.UTC(today.year, today.month - 1, today.day, 12);
  let targetUtc = wall - tzOffsetMinutes(fromTz, new Date(dayAnchor)) * 60000;
  targetUtc = wall - tzOffsetMinutes(fromTz, new Date(targetUtc)) * 60000;

  const to = tzParts(toTz, new Date(targetUtc));
  const dayNumber = (p: TzParts) => p.year * 372 + (p.month - 1) * 31 + p.day;
  return {
    hour: to.hour,
    minute: to.minute,
    dayShift: dayNumber(to) - dayNumber(today),
  };
}

/**
 * Absolute UTC instant (epoch ms) at which the given zone's LOCAL wall clock
 * reads `year-month-day hour:minute`, resolved DST-aware. The zone offset is
 * applied twice (the first pass may straddle a DST boundary) so a fold/spring
 * forward resolves to the correct real instant, mirroring `projectWallClock`.
 */
export function localWallToUtcMs(
  tz: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  let utc = wall - tzOffsetMinutes(tz, new Date(wall)) * 60000;
  utc = wall - tzOffsetMinutes(tz, new Date(utc)) * 60000;
  return utc;
}

/**
 * Readable short time-zone abbreviation for an instant inside a zone — e.g.
 * `EDT`, `BST`, `GMT`, `AEST`, `GMT+6`. Intl resolves it dynamically, so it is
 * DST-aware (New York returns `EST` in winter and `EDT` in summer). Falls back
 * to the raw IANA name if the runtime returns no abbreviation part.
 */
export function tzAbbrev(tz: string, date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    }).formatToParts(date);
    const value = parts.find((p) => p.type === "timeZoneName")?.value;
    return value && value.length > 0 ? value : tz;
  } catch {
    return tz;
  }
}

export function minutesOfDayInTz(tz: string, date: Date): number {
  const p = tzParts(tz, date);
  return p.hour * 60 + p.minute;
}

export function formatLocalDateKey(parts: TzParts): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function formatLocalDateTime(parts: TzParts): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${formatLocalDateKey(parts)} ${pad(parts.hour)}:${pad(parts.minute)}`;
}
