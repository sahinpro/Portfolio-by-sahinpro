import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_SCHEDULE_CONFIG,
  type OutreachScheduleConfig,
  type OutreachZoneTarget,
} from "./types";
import {
  findUpcomingOutreachWindows,
  findZonesOpeningNow,
  formatBangladeshWindow,
  isOutreachWindowOpeningNow,
  isValidOutreachWeekday,
} from "./windowScheduler";

const nyZone: OutreachZoneTarget = {
  marketId: "us",
  marketName: "United States",
  flag: "🇺🇸",
  zoneId: "newyork",
  city: "New York · Eastern",
  tz: "America/New_York",
};

const londonZone: OutreachZoneTarget = {
  marketId: "uk",
  marketName: "United Kingdom",
  flag: "🇬🇧",
  zoneId: "london",
  city: "London · GMT/BST",
  tz: "Europe/London",
};

describe("isOutreachWindowOpeningNow", () => {
  it("accepts Tuesday 09:32 America/New_York", () => {
    const at = new Date("2026-01-06T14:32:00.000Z");
    assert.equal(isOutreachWindowOpeningNow("America/New_York", at), true);
  });

  it("rejects Monday 09:32 America/New_York", () => {
    const at = new Date("2026-01-05T14:32:00.000Z");
    assert.equal(isOutreachWindowOpeningNow("America/New_York", at), false);
  });

  it("rejects Tuesday 11:00 America/New_York (outside open band)", () => {
    const at = new Date("2026-01-06T16:00:00.000Z");
    assert.equal(isOutreachWindowOpeningNow("America/New_York", at), false);
  });

  it("rejects Tuesday 09:40 when grace is 4 minutes", () => {
    const at = new Date("2026-01-06T14:40:00.000Z");
    assert.equal(isOutreachWindowOpeningNow("America/New_York", at, 4), false);
  });
});

describe("findZonesOpeningNow", () => {
  it("returns only zones in the opening band on Tue–Thu", () => {
    const at = new Date("2026-01-07T14:31:00.000Z");
    const matches = findZonesOpeningNow([nyZone, londonZone], at);
    assert.equal(matches.length, 1);
    assert.equal(matches[0]?.zone.tz, "America/New_York");
    assert.match(matches[0]?.localDate ?? "", /^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("DST / weekday helpers", () => {
  it("marks valid outreach weekdays in Europe/London", () => {
    const wed = new Date("2026-07-01T08:31:00.000Z");
    assert.equal(isValidOutreachWeekday("Europe/London", wed), true);
  });

  it("formats Bangladesh window for New York", () => {
    const at = new Date("2026-01-06T14:32:00.000Z");
    const label = formatBangladeshWindow("America/New_York", at);
    assert.match(label, /Bangladesh time/);
    assert.match(label, /\d{2}:\d{2}/);
  });
});

function zone(tz: string, city: string, marketId = "x"): OutreachZoneTarget {
  return {
    marketId,
    marketName: `Market ${marketId}`,
    flag: "🏳️",
    zoneId: tz,
    city,
    tz,
  };
}

function sched(
  patch: Partial<OutreachScheduleConfig> = {},
): OutreachScheduleConfig {
  return {
    days: [...DEFAULT_SCHEDULE_CONFIG.days],
    startMinutes: DEFAULT_SCHEDULE_CONFIG.startMinutes,
    graceMinutes: DEFAULT_SCHEDULE_CONFIG.graceMinutes,
    updatedAt: "",
    ...patch,
  };
}

// 2026-11-03 is a Tuesday (ISO dow 2). Tue–Thu, 09:30 local schedule.
const TUE_00Z = new Date("2026-11-03T00:00:00.000Z");

describe("findUpcomingOutreachWindows — 24h digest horizon", () => {
  it("includes every eligible window that opens within the next 24 hours", () => {
    const windows = findUpcomingOutreachWindows(
      [zone("Europe/London", "London")],
      TUE_00Z,
      sched(),
    );
    // London 09:30 GMT on Tuesday opens at 09:30Z — inside [00:00Z, +24h).
    assert.equal(windows.length, 1);
    assert.equal(windows[0].opensAtMs, Date.parse("2026-11-03T09:30:00.000Z"));
    assert.equal(windows[0].localTimeLabel, "09:30");
    assert.equal(windows[0].bdTimeLabel, "15:30"); // 09:30 GMT + 6 (BD)
  });

  it("expires a window that already opened before the digest instant", () => {
    // Run at 15:00Z — Tuesday's 09:30Z London opening is already past, so only
    // Wednesday's opening (09:30Z Nov 4) may appear, and it must be >= digest.
    const windows = findUpcomingOutreachWindows(
      [zone("Europe/London", "London")],
      new Date("2026-11-03T15:00:00.000Z"),
      sched(),
    );
    assert.equal(windows.length, 1);
    assert.equal(windows[0].opensAtMs, Date.parse("2026-11-04T09:30:00.000Z"));
    assert.ok(windows[0].minutesUntilOpen >= 0);
    assert.equal(windows[0].bdDayLabel, "Tomorrow");
  });

  it("excludes windows that open beyond the 24-hour horizon", () => {
    // Only Tuesdays; run on Wednesday → the next opening is 6 days away.
    const windows = findUpcomingOutreachWindows(
      [zone("Europe/London", "London")],
      new Date("2026-11-04T00:00:00.000Z"),
      sched({ days: [2] }),
    );
    assert.equal(windows.length, 0);
  });

  it("orders multiple cities chronologically by Bangladesh time", () => {
    const windows = findUpcomingOutreachWindows(
      [
        zone("America/New_York", "New York", "us"), // 09:30 EST = 14:30Z
        zone("Europe/London", "London", "uk"), // 09:30 GMT = 09:30Z
        zone("Asia/Tokyo", "Tokyo", "jp"), // 09:30 JST = 00:30Z
      ],
      TUE_00Z,
      sched(),
    );
    assert.deepEqual(
      windows.map((w) => w.zone.city),
      ["Tokyo", "London", "New York"],
    );
    // Monotonic by absolute instant AND by Bangladesh HH:MM (fixed offset).
    const instants = windows.map((w) => w.opensAtMs);
    assert.deepEqual(
      [...instants].sort((a, b) => a - b),
      instants,
    );
  });

  it("is DST-aware: the same 09:30 local maps to a different UTC instant by season", () => {
    // New York: EST (UTC-5) in Nov, EDT (UTC-4) in Jul.
    const winter = findUpcomingOutreachWindows(
      [zone("America/New_York", "New York", "us")],
      TUE_00Z,
      sched(),
    )[0];
    // 2026-07-07 is a Tuesday, EDT.
    const summer = findUpcomingOutreachWindows(
      [zone("America/New_York", "New York", "us")],
      new Date("2026-07-07T00:00:00.000Z"),
      sched(),
    )[0];
    assert.equal(winter.opensAtMs, Date.parse("2026-11-03T14:30:00.000Z")); // EST
    assert.equal(summer.opensAtMs, Date.parse("2026-07-07T13:30:00.000Z")); // EDT
    assert.equal(winter.tzAbbrev, "EST");
    assert.equal(summer.tzAbbrev, "EDT");
  });

  it("labels a window that crosses midnight in Bangladesh as Tomorrow", () => {
    // Run at Tue 00:00Z → digest BD date is Wed Nov 4 (06:00 BD).
    // Sydney AEDT (UTC+11) Wed 09:30 = 22:30Z Nov 3, which is Thu 04:30 BD →
    // one BD day after the digest date, i.e. `Tomorrow`.
    const windows = findUpcomingOutreachWindows(
      [zone("Australia/Sydney", "Sydney", "au")],
      new Date("2026-11-03T00:00:00.000Z"),
      sched(),
    );
    assert.equal(windows.length, 1);
    assert.equal(windows[0].bdDayLabel, "Tomorrow");
    assert.equal(windows[0].bdDateKey, "2026-11-04");
    assert.equal(windows[0].bdTimeLabel, "04:30");
  });
});
