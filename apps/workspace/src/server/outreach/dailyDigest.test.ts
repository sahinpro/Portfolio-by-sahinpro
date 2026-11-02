import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDigestModel, formatCountdown } from "./dailyDigest";
import {
  DEFAULT_SCHEDULE_CONFIG,
  type OutreachScheduleConfig,
  type OutreachZoneTarget,
} from "./types";

function zone(
  tz: string,
  city: string,
  marketId: string,
  marketName: string,
): OutreachZoneTarget {
  return {
    marketId,
    marketName,
    flag: "🏳️",
    zoneId: tz,
    city,
    tz,
  };
}

const schedule: OutreachScheduleConfig = {
  ...DEFAULT_SCHEDULE_CONFIG,
  updatedAt: "",
  days: [2, 3, 4], // Tue–Thu; 2026-11-03 is a Tuesday
};

const multiZones = [
  zone("Asia/Tokyo", "Tokyo · JST", "jp", "Japan"), // opens 00:30Z (earliest)
  zone("Europe/London", "London · GMT", "uk", "United Kingdom"), // 09:30Z
  zone("America/New_York", "New York · Eastern", "us", "United States"), // 14:30Z
];

const DIGEST = new Date("2026-11-03T00:00:00.000Z");

describe("buildDigestModel", () => {
  it("summary metrics match the actual digest entries", () => {
    const model = buildDigestModel(multiZones, DIGEST, schedule);
    assert.equal(model.total, model.windows.length);
    assert.equal(model.total, 3);
    assert.equal(
      model.marketCount,
      new Set(model.windows.map((w) => w.zone.marketId)).size,
    );
    assert.equal(model.marketCount, 3);
  });

  it("collapses multiple zones of the same market into one market count", () => {
    const model = buildDigestModel(
      [
        zone("America/New_York", "New York", "us", "United States"),
        zone("America/Chicago", "Chicago", "us", "United States"),
      ],
      DIGEST,
      schedule,
    );
    assert.equal(model.total, 2);
    assert.equal(model.marketCount, 1);
  });

  it("keeps windows chronologically sorted by Bangladesh time (soonest first)", () => {
    const model = buildDigestModel(multiZones, DIGEST, schedule);
    assert.deepEqual(
      model.windows.map((w) => w.zone.city),
      ["Tokyo · JST", "London · GMT", "New York · Eastern"],
    );
    assert.equal(model.next?.zone.city, "Tokyo · JST");
  });

  it("computes the next-opportunity countdown from the digest timestamp", () => {
    const model = buildDigestModel(multiZones, DIGEST, schedule);
    assert.ok(model.next);
    // Tokyo opens 00:30Z, exactly 30 minutes after the 00:00Z digest instant.
    assert.equal(model.next.minutesUntilOpen, 30);
    assert.equal(model.nextCountdownLabel, formatCountdown(30));
    assert.equal(model.nextCountdownLabel, "in 30m");
  });

  it("groups windows by Bangladesh date, preserving chronological order", () => {
    // London (15:00 BD today) + Sydney (04:30 BD tomorrow) split into 2 groups.
    const model = buildDigestModel(
      [
        zone("Europe/London", "London", "uk", "United Kingdom"),
        zone("Australia/Sydney", "Sydney", "au", "Australia"),
      ],
      DIGEST,
      schedule,
    );
    assert.ok(model.groups.length >= 2, "expected a BD-day rollover grouping");
    const flat = model.groups.flatMap((g) => g.windows.map((w) => w.opensAtMs));
    assert.deepEqual(
      flat,
      [...flat].sort((a, b) => a - b),
    );
    // Every group's windows share its BD date key.
    for (const g of model.groups) {
      for (const w of g.windows) assert.equal(w.bdDateKey, g.bdDateKey);
    }
  });

  it("produces an empty model (no next, no countdown) when nothing is eligible", () => {
    const model = buildDigestModel(
      [zone("Europe/London", "London", "uk", "United Kingdom")],
      new Date("2026-11-04T00:00:00.000Z"), // Wednesday, days=[2] only → none in 24h
      { ...schedule, days: [2] },
    );
    assert.equal(model.total, 0);
    assert.equal(model.next, undefined);
    assert.equal(model.nextCountdownLabel, undefined);
    assert.deepEqual(model.groups, []);
  });
});

describe("formatCountdown", () => {
  it("formats minutes, hours and the opening-now edge", () => {
    assert.equal(formatCountdown(0), "opening now");
    assert.equal(formatCountdown(45), "in 45m");
    assert.equal(formatCountdown(120), "in 2h");
    assert.equal(formatCountdown(200), "in 3h 20m");
  });
});
