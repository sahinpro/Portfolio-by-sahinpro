import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveNotificationZones, sanitizePlannerZones } from "./zonesConfig";

describe("resolveNotificationZones", () => {
  it("uses a single picked zone per multi-zone market", () => {
    const zones = resolveNotificationZones({
      us: "America/Chicago",
    });
    const us = zones.filter((z) => z.marketId === "us");
    assert.equal(us.length, 1);
    assert.equal(us[0]?.tz, "America/Chicago");
  });

  it("defaults to every zone when no pick exists", () => {
    const zones = resolveNotificationZones({});
    const us = zones.filter((z) => z.marketId === "us");
    assert.equal(us.length, 7);
    const uk = zones.filter((z) => z.marketId === "uk");
    assert.equal(uk.length, 1);
  });

  it("honours OUTREACH_NOTIFICATION_ZONES env JSON", () => {
    const env = JSON.stringify([
      { marketId: "de", tz: "Europe/Berlin" },
      { marketId: "it", tz: "Europe/Rome" },
    ]);
    const zones = resolveNotificationZones({}, env);
    assert.equal(zones.length, 2);
  });
});

describe("sanitizePlannerZones", () => {
  it("drops unknown markets and invalid tz values", () => {
    const clean = sanitizePlannerZones({
      us: "America/New_York",
      bogus: "Etc/UTC",
      uk: "Not/AZone",
    });
    assert.deepEqual(clean, { us: "America/New_York" });
  });
});
