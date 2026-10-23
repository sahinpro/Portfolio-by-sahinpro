import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findZonesOpeningNow,
  formatBangladeshWindow,
  isOutreachWindowOpeningNow,
  isValidOutreachWeekday,
} from "./windowScheduler";
import type { OutreachZoneTarget } from "./types";

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
