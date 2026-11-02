import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { buildDigestModel } from "./dailyDigest";
import {
  buildDigestHtml,
  buildDigestPlainText,
  buildDigestSubject,
  digestIdempotencyKey,
  leadsAdminUrl,
  siteBaseUrl,
} from "./outreachEmail";
import type {
  DigestModel,
  OutreachScheduleConfig,
  OutreachZoneTarget,
} from "./types";

const CANONICAL_LEADS_URL = "https://workspace.sahinpro.me/leads";
const PREVIEW_DEPLOY_URL =
  "portfolio-by-sahinpro-ncn8qbcvp-sahin-alams-projects-be5700f1.vercel.app";

const londonZone: OutreachZoneTarget = {
  marketId: "uk",
  marketName: "United Kingdom",
  flag: "🇬🇧",
  zoneId: "london",
  city: "London · GMT/BST",
  tz: "Europe/London",
};

const newYorkZone: OutreachZoneTarget = {
  marketId: "us",
  marketName: "United States",
  flag: "🇺🇸",
  zoneId: "newyork",
  city: "New York · Eastern",
  tz: "America/New_York",
};

const schedule: OutreachScheduleConfig = {
  days: [2, 3, 4], // Tue–Thu (Nov 3 2026 is a Tuesday)
  startMinutes: 9 * 60 + 30,
  graceMinutes: 4,
  updatedAt: "",
};

/**
 * Deterministic digest fixture. The digest instant is fixed, so London (opens
 * 09:30 GMT = 09:30Z) and New York (opens 09:30 EST = 14:30Z) both land inside
 * the [instant, instant + 24h) horizon and appear in chronological order.
 */
function buildFixtureModel(): DigestModel {
  const digestTime = new Date("2026-11-03T00:00:00.000Z");
  return buildDigestModel([londonZone, newYorkZone], digestTime, schedule);
}

const originalEnv = {
  SITE_URL: process.env.SITE_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_URL: process.env.VERCEL_URL,
};

function setEnv(patch: Record<string, string | undefined>): void {
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

afterEach(() => setEnv(originalEnv));

describe("siteBaseUrl / leadsAdminUrl", () => {
  it("uses SITE_URL and never the deployment-specific VERCEL_URL", () => {
    setEnv({
      SITE_URL: "https://workspace.sahinpro.me",
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_URL: PREVIEW_DEPLOY_URL,
    });
    assert.equal(siteBaseUrl(), "https://workspace.sahinpro.me");
    assert.equal(leadsAdminUrl(), CANONICAL_LEADS_URL);
  });

  it("falls back to the canonical constant when no env var is set (not VERCEL_URL)", () => {
    setEnv({
      SITE_URL: undefined,
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_URL: PREVIEW_DEPLOY_URL,
    });
    assert.equal(leadsAdminUrl(), CANONICAL_LEADS_URL);
    assert.ok(!leadsAdminUrl().includes("vercel.app"));
  });

  it("honours the legacy NEXT_PUBLIC_SITE_URL when SITE_URL is unset", () => {
    setEnv({
      SITE_URL: undefined,
      NEXT_PUBLIC_SITE_URL: "https://staging.example.com",
      VERCEL_URL: undefined,
    });
    assert.equal(leadsAdminUrl(), "https://staging.example.com/leads");
  });

  it("normalises schemeless hosts and trailing slashes", () => {
    setEnv({
      SITE_URL: "workspace.sahinpro.me/",
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_URL: undefined,
    });
    assert.equal(leadsAdminUrl(), CANONICAL_LEADS_URL);
  });

  it("SITE_URL wins over NEXT_PUBLIC_SITE_URL", () => {
    setEnv({
      SITE_URL: "https://workspace.sahinpro.me",
      NEXT_PUBLIC_SITE_URL: "https://old.example.com",
      VERCEL_URL: undefined,
    });
    assert.equal(leadsAdminUrl(), CANONICAL_LEADS_URL);
  });
});

describe("digest Leads button", () => {
  it("preview and production digests both link to the canonical production URL", () => {
    setEnv({
      SITE_URL: "https://workspace.sahinpro.me",
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_URL: PREVIEW_DEPLOY_URL,
    });
    const model = buildFixtureModel();
    for (const testMode of [false, true]) {
      const text = buildDigestPlainText(model, testMode);
      const html = buildDigestHtml(model, testMode);
      assert.ok(
        text.includes(leadsAdminUrl()),
        `plain-text link (testMode=${testMode})`,
      );
      assert.ok(
        html.includes(`href="${CANONICAL_LEADS_URL}"`),
        `html href (testMode=${testMode})`,
      );
      assert.ok(
        !text.includes("vercel.app") && !html.includes("vercel.app"),
        "no deployment URL leaks into the email",
      );
      assert.ok(html.includes("Open Leads"), "primary CTA present");
    }
  });

  it("embeds no credentials or tokens in the link", () => {
    setEnv({
      SITE_URL: "https://workspace.sahinpro.me",
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_URL: undefined,
    });
    const html = buildDigestHtml(buildFixtureModel(), false);
    assert.ok(!/[?&](token|secret|key|password|api)=/i.test(html));
    assert.ok(!html.includes("service_role") && !html.includes("anon"));
  });
});

describe("digest rendering", () => {
  it("uses the requested subject for a digest with windows", () => {
    const subject = buildDigestSubject(buildFixtureModel(), false);
    assert.equal(subject, "Your Outreach Windows — Daily Summary");
  });

  it("HTML and plain text carry the same schedule entries", () => {
    const model = buildFixtureModel();
    assert.equal(model.total, 2);
    const html = buildDigestHtml(model, false);
    const text = buildDigestPlainText(model, false);
    for (const w of model.windows) {
      for (const haystack of [html, text]) {
        assert.ok(haystack.includes(w.zone.marketName), "market name");
        assert.ok(haystack.includes(w.zone.city), "city label");
        assert.ok(haystack.includes(w.bdTimeLabel), "bangladesh time");
        assert.ok(haystack.includes(w.localTimeLabel), "local time");
        assert.ok(haystack.includes(w.tzAbbrev), "tz abbreviation");
      }
    }
  });

  it("remains readable when decorative CSS is stripped (labels are text, not style)", () => {
    const html = buildDigestHtml(buildFixtureModel(), false);
    // Simulate a client that removes the whole <style> block AND every
    // style="" attribute; the substantive content must survive.
    const stripped = html
      .replace(/<style>[\s\S]*?<\/style>/g, "")
      .replace(/\sstyle="[^"]*"/g, "");
    assert.ok(stripped.includes("Your Daily Outreach Brief"));
    assert.ok(stripped.includes("United Kingdom"));
    assert.ok(stripped.includes("London · GMT/BST"));
    assert.ok(stripped.includes("Bangladesh"));
    assert.ok(stripped.includes("Open Leads"));
    assert.ok(
      stripped.includes("No messages are sent to prospects automatically"),
    );
  });

  it("idempotency key is deterministic per Bangladesh day but unique in test", async () => {
    const model = buildFixtureModel();
    const prod = digestIdempotencyKey(model, false);
    // Requirement: `outreach-digest/asia-dhaka/YYYY-MM-DD`.
    assert.equal(prod, `outreach-digest/asia-dhaka/${model.bdDateKey}`);
    assert.equal(
      prod,
      digestIdempotencyKey(model, false),
      "stable for resends — same BD date always yields the same key",
    );

    // A different Bangladesh date must use a different key.
    const otherDay = buildDigestModel(
      [londonZone, newYorkZone],
      new Date("2026-11-04T00:00:00.000Z"),
      schedule,
    );
    assert.notEqual(
      digestIdempotencyKey(otherDay, false),
      prod,
      "different BD date → different key",
    );

    const t1 = digestIdempotencyKey(model, true);
    await new Promise((r) => setTimeout(r, 2));
    const t2 = digestIdempotencyKey(model, true);
    assert.match(t1, /^outreach-digest-test-\d+$/);
    assert.notEqual(t1, t2, "test sends never dedupe against each other");
    assert.ok(!prod.startsWith("outreach-digest-test"));
  });

  it("renders a clean empty state when no windows are eligible", () => {
    const digestTime = new Date("2026-11-01T00:00:00.000Z"); // Sunday; Mon not in days
    const model = buildDigestModel([londonZone], digestTime, schedule);
    assert.equal(model.total, 0);
    const html = buildDigestHtml(model, false);
    const text = buildDigestPlainText(model, false);
    assert.ok(html.includes("No windows in the next 24 hours"));
    assert.ok(
      text.includes("No outreach windows are scheduled in the next 24 hours"),
    );
  });
});
