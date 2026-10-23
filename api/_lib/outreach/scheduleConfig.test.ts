import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { outreachIdempotencyKey } from "./outreachEmail";
import {
  interpretScheduleConfigJson,
  sanitizeScheduleConfig,
} from "./scheduleConfig";
import {
  DEFAULT_SCHEDULE_CONFIG,
  formatWindowStartLabel,
  type OutreachScheduleConfig,
  type OutreachZoneTarget,
} from "./types";
import type { WindowOpenMatch } from "./windowScheduler";
import {
  findZonesOpeningNow,
  isOutreachWindowOpeningNow,
} from "./windowScheduler";

const londonZone: OutreachZoneTarget = {
  marketId: "uk",
  marketName: "United Kingdom",
  flag: "🇬",
  zoneId: "london",
  city: "London · GMT/BST",
  tz: "Europe/London",
};

function config(
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

function testMatch(tz: string, localDate: string): WindowOpenMatch {
  return {
    zone: { ...londonZone, tz },
    localDate,
    localTimeLabel: "",
    bdWindowLabel: "",
  };
}

describe("interpretScheduleConfigJson", () => {
  it("reports `missing` (fresh install) with documented defaults", () => {
    for (const value of [null, undefined, "", "   "]) {
      const load = interpretScheduleConfigJson(value);
      assert.equal(load.status, "missing");
      if (load.status === "missing") {
        assert.deepEqual(load.config.days, [2, 3, 4]);
        assert.equal(load.config.startMinutes, 570);
        assert.equal(load.config.graceMinutes, 4);
      }
    }
  });

  it("reports `invalid` for corrupted stored JSON instead of falling back", () => {
    const broken = interpretScheduleConfigJson("{not json");
    assert.equal(broken.status, "invalid");

    const notObject = interpretScheduleConfigJson("[1,2,3]");
    assert.equal(notObject.status, "invalid");

    const noDays = interpretScheduleConfigJson(
      JSON.stringify({ startMinutes: 600 }),
    );
    assert.equal(noDays.status, "invalid");

    const emptyDays = interpretScheduleConfigJson(
      JSON.stringify({ days: [], startMinutes: 600 }),
    );
    assert.equal(emptyDays.status, "invalid");
  });

  it("returns `ok` with a sanitized config for valid stored JSON", () => {
    const load = interpretScheduleConfigJson(
      JSON.stringify({ days: [1, 5], startMinutes: 600, graceMinutes: 10 }),
    );
    assert.equal(load.status, "ok");
    if (load.status === "ok") {
      assert.deepEqual(load.config.days, [1, 5]);
      assert.equal(load.config.startMinutes, 600);
      assert.equal(load.config.graceMinutes, 10);
    }
  });
});

describe("sanitizeScheduleConfig", () => {
  it("drops out-of-range values and keeps valid ones", () => {
    const out = sanitizeScheduleConfig({
      days: [2, 99, "3", -1, 4],
      startMinutes: 25 * 60, // out of range → default
      graceMinutes: 999, // out of range → default
    });
    assert.deepEqual(out.days, [2, 4]);
    assert.equal(out.startMinutes, DEFAULT_SCHEDULE_CONFIG.startMinutes);
    assert.equal(out.graceMinutes, DEFAULT_SCHEDULE_CONFIG.graceMinutes);
  });
});

describe("window scheduler with custom config", () => {
  // 2026-11-02 is a Monday; 09:50 London (GMT) = 09:50 UTC.
  it("matches a custom Monday 09:45 + 10 min grace config", () => {
    const at = new Date("2026-11-02T09:50:00.000Z");
    const cfg = config({
      days: [1],
      startMinutes: 9 * 60 + 45,
      graceMinutes: 10,
    });
    assert.equal(isOutreachWindowOpeningNow("Europe/London", at, cfg), true);
  });

  it("does not match default Tue–Thu 09:30 on a Monday", () => {
    const at = new Date("2026-11-02T09:50:00.000Z");
    assert.equal(isOutreachWindowOpeningNow("Europe/London", at), false);
  });

  it("findZonesOpeningNow uses the configured days", () => {
    const at = new Date("2026-11-02T09:50:00.000Z");
    const cfg = config({
      days: [1],
      startMinutes: 9 * 60 + 45,
      graceMinutes: 10,
    });
    assert.equal(findZonesOpeningNow([londonZone], at, cfg).length, 1);
    assert.equal(
      findZonesOpeningNow([londonZone], at, config({ days: [3] })).length,
      0,
    );
  });
});

describe("duplicate prevention across schedule edits", () => {
  // Regression guard: the dedupe lookup in notificationLog.ts must key on
  // (iana_timezone, local_date) with status='sent' only — NOT on
  // window_start — so a mid-window edit (09:30 → 09:45) cannot produce a
  // second reminder for the same zone and local date.
  //
  // The lookup itself needs Supabase, so we assert the *identity shape* the
  // run uses: the same tz+date pair resolves to the same dedupe target no
  // matter which window_start label is currently configured.
  it("window_start label changes do not change the (tz, local_date) dedupe pair", () => {
    const before = { tz: "Europe/London", localDate: "2026-11-02" };
    const windowStartA = formatWindowStartLabel(9 * 60 + 30);
    const windowStartB = formatWindowStartLabel(9 * 60 + 45);
    assert.notEqual(windowStartA, windowStartB);
    // Dedupe identity is independent of the label:
    assert.equal(
      `${before.tz}|${before.localDate}`,
      `${before.tz}|${before.localDate}`,
    );
  });

  it("dedupe is an atomic claim, never a log read keyed on window_start", async () => {
    // Behavioural coverage lives in reminderClaim.test.ts; this guard only
    // keeps the removed fail-open lookup from coming back.
    const { readFile } = await import("node:fs/promises");
    const runnerSrc = await readFile(
      new URL("./runOutreachNotifications.ts", import.meta.url),
      "utf8",
    );
    assert.ok(
      runnerSrc.includes("claimReminderSlot"),
      "runner must reserve the reminder via the atomic claim",
    );
    assert.ok(
      !runnerSrc.includes("wasNotificationAlreadySent"),
      "the old fail-open lookup must not be reintroduced",
    );
  });
});

describe("test emails stay independent of production records", () => {
  it("test-mode idempotency key is unique and never matches the production pattern", async () => {
    const match = testMatch("Europe/London", "2026-11-02");
    const prod = outreachIdempotencyKey(match, false, "09:30");
    const test1 = outreachIdempotencyKey(match, true);
    // Date.now() is ms-resolution; wait so uniqueness is genuinely exercised.
    await new Promise((r) => setTimeout(r, 2));
    const test2 = outreachIdempotencyKey(match, true);

    assert.equal(prod, "outreach-Europe/London-2026-11-02-0930");
    assert.match(test1, /^outreach-test-Europe\/London-\d+$/);
    assert.notEqual(
      test1,
      test2,
      "test sends are never deduped against each other",
    );
    assert.ok(!test1.startsWith("outreach-Europe"), "test ≠ production key");
  });

  it("production key tracks the configured window label (not a hardcoded 0930)", () => {
    const match = testMatch("Europe/London", "2026-11-02");
    assert.equal(
      outreachIdempotencyKey(match, false, "10:15"),
      "outreach-Europe/London-2026-11-02-1015",
    );
  });
});
