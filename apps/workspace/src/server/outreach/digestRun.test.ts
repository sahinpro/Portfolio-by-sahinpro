/**
 * Runner-level behaviour of the single Daily Outreach Digest
 * (`runDailyOutreachDigest`). Deterministic clock + a mocked Resend/Supabase
 * fetch layer (shared harness) — nothing ever reaches production and no real
 * email is sent.
 *
 * Covers the idempotency + safety requirements: multiple cities → ONE email,
 * an already-claimed day → no resend, preview never sends, no eligible window →
 * clean skip, and a provider failure is never recorded as a success.
 */
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  CRON_ENV,
  cronRunRoutes,
  installFetchStub,
  isClaims,
  isNotifLog,
  isResend,
  withEnv,
} from "../api/__tests__/harness";
import { runDailyOutreachDigest } from "./runOutreachNotifications";

// Bangladesh Tue 08:00 (02:00Z), 2026-11-03 — the intended daily trigger time.
const FIXED_NOW = new Date("2026-11-03T02:00:00.000Z");

// Three enabled targets across two markets, all opening 09:30 local today.
const MULTI_ZONES =
  '[{"marketId":"us","tz":"America/New_York"},' +
  '{"marketId":"us","tz":"America/Chicago"},' +
  '{"marketId":"uk","tz":"Europe/London"}]';

const EVERYDAY = JSON.stringify({
  days: [0, 1, 2, 3, 4, 5, 6],
  startMinutes: 9 * 60 + 30,
  graceMinutes: 4,
});
const TUESDAY_ONLY = JSON.stringify({
  days: [2],
  startMinutes: 9 * 60 + 30,
  graceMinutes: 4,
});

let stub: ReturnType<typeof installFetchStub> | null = null;
afterEach(() => {
  stub?.restore();
  stub = null;
});

function digestEnv(zones = MULTI_ZONES) {
  return {
    ...CRON_ENV,
    OUTREACH_NOTIFICATION_ZONES: zones,
    NEXT_PUBLIC_ADMIN_EMAIL: undefined,
  };
}

describe("runDailyOutreachDigest", () => {
  it("sends exactly ONE digest email for multiple eligible cities", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: EVERYDAY }),
      { match: isResend, json: { id: "digest-multi" } },
    ]);
    await withEnv(digestEnv(), async () => {
      const result = await runDailyOutreachDigest(FIXED_NOW);
      assert.equal(result.sent, true);
      assert.equal(result.skipped, false);
      assert.equal(result.windowCount, 3);
      assert.equal(result.bdDate, "2026-11-03");

      const sends = stub!.filter((c) => isResend(c.url));
      assert.equal(sends.length, 1, "three cities must produce ONE email");
      // Exactly one claim attempt for the whole day (not one per city).
      assert.equal(
        stub!.filter((c) => isClaims(c.url) && c.method === "POST").length,
        1,
      );
    });
  });

  it("does NOT resend when the daily claim is already taken (duplicate execution)", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: EVERYDAY, claimsResult: [] }),
      { match: isResend, json: { id: "should-not-send" } },
    ]);
    await withEnv(digestEnv(), async () => {
      const result = await runDailyOutreachDigest(FIXED_NOW);
      assert.equal(result.sent, false);
      assert.equal(result.skipped, true);
      assert.match(result.reason ?? "", /already claimed/i);
      assert.equal(
        stub!.filter((c) => isResend(c.url)).length,
        0,
        "a duplicate day must not send",
      );
    });
  });

  it("preview (dry-run) renders the digest and NEVER claims or sends", async () => {
    stub = installFetchStub([...cronRunRoutes({ scheduleValue: EVERYDAY })]);
    await withEnv({ ...digestEnv(), RESEND_API_KEY: undefined }, async () => {
      const result = await runDailyOutreachDigest(FIXED_NOW, {
        dryRun: true,
      });
      assert.ok(result.preview, "preview payload returned");
      assert.match(result.preview!.subject, /Daily Summary/);
      assert.ok(result.preview!.html.includes("Your Daily Outreach Brief"));
      assert.equal(result.sent, false);
      // Preview must not require send credentials nor touch the claim/log.
      assert.equal(stub!.filter((c) => isResend(c.url)).length, 0);
      assert.equal(stub!.filter((c) => isClaims(c.url)).length, 0);
      assert.equal(stub!.filter((c) => isNotifLog(c.url)).length, 0);
    });
  });

  it("skips cleanly when no window opens in the next 24 hours (no claim, no send)", async () => {
    // Wednesday noon with a Tuesday-only schedule → next open is >24h away.
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: TUESDAY_ONLY }),
      { match: isResend, json: { id: "nope" } },
    ]);
    await withEnv(digestEnv(), async () => {
      const result = await runDailyOutreachDigest(
        new Date("2026-11-04T12:00:00.000Z"),
      );
      assert.equal(result.windowCount, 0);
      assert.equal(result.sent, false);
      assert.equal(result.skipped, true);
      assert.match(result.reason ?? "", /No eligible windows/i);
      assert.equal(stub!.filter((c) => isResend(c.url)).length, 0);
      assert.equal(stub!.filter((c) => isClaims(c.url)).length, 0);
    });
  });

  it("records a provider failure as FAILED and releases the claim (never a false success)", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: EVERYDAY }),
      { match: isResend, status: 400, json: { message: "provider rejected" } },
    ]);
    await withEnv(digestEnv(), async () => {
      const result = await runDailyOutreachDigest(FIXED_NOW);
      assert.equal(result.sent, false);
      assert.ok(result.failed, "failure surfaced on the result");

      const log = stub!.find((c) => isNotifLog(c.url));
      assert.ok(log, "delivery recorded");
      assert.equal(
        (JSON.parse(log!.body!) as { status: string }).status,
        "failed",
        "a failed send is NOT recorded as sent",
      );
      assert.ok(
        stub!.some((c) => isClaims(c.url) && c.method === "DELETE"),
        "the claim is released so the day can be retried",
      );
    });
  });

  it("fails safe (no send) when the daily claim lookup errors", async () => {
    stub = installFetchStub([
      {
        match: (url) =>
          url.includes("/rest/v1/site_settings") &&
          url.includes("key=eq.outreach_schedule_config"),
        json: [{ value: EVERYDAY }],
      },
      {
        match: (url) =>
          url.includes("/rest/v1/site_settings") &&
          url.includes("key=eq.outreach_planner_zones"),
        json: [],
      },
      // Claim table unreachable (e.g. migration not applied).
      {
        match: (url, init) => isClaims(url) && init.method === "POST",
        status: 500,
        json: { message: "claims table unavailable" },
      },
      { match: isNotifLog, status: 201, json: {} },
      { match: isResend, json: { id: "must-not-send" } },
    ]);
    await withEnv(digestEnv(), async () => {
      const result = await runDailyOutreachDigest(FIXED_NOW);
      assert.equal(result.sent, false);
      assert.equal(result.skipped, true);
      assert.equal(stub!.filter((c) => isResend(c.url)).length, 0);
      assert.equal(stub!.filter((c) => isNotifLog(c.url)).length, 0);
    });
  });
});

/**
 * Reliability of the idempotency guard: a transient/ambiguous failure must not
 * turn into a duplicate daily email. Resend only dedupes when the reused key
 * carries a byte-identical payload, so these tests pin BOTH the key and the
 * request body across the two retry paths — the in-transport retry loop and a
 * later tick that retries after the failed send released its daily claim.
 */
describe("runDailyOutreachDigest — idempotent retries", () => {
  it("rebuilds a byte-identical payload + key for a retry later on the same Bangladesh date", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: EVERYDAY }),
      { match: isResend, json: { id: "digest-retry" } },
    ]);
    await withEnv(digestEnv(), async () => {
      // Worker fires exactly at the scheduled 08:00 Asia/Dhaka instant.
      await runDailyOutreachDigest(FIXED_NOW); // 02:00Z = 08:00 BD, Nov 3
      // A claim-released retry later the SAME BD day — only `now` differs.
      await runDailyOutreachDigest(new Date("2026-11-03T06:15:00.000Z")); // 12:15 BD

      const sends = stub!.filter((c) => isResend(c.url));
      assert.equal(sends.length, 2, "both runs reached the (mocked) send");
      const [a, b] = sends;
      assert.equal(
        a!.headers["idempotency-key"],
        "outreach-digest/asia-dhaka/2026-11-03",
        "deterministic per-BD-date key",
      );
      assert.equal(
        a!.headers["idempotency-key"],
        b!.headers["idempotency-key"],
        "same BD date reuses the exact same key across ticks",
      );
      assert.equal(a!.body, b!.body, "retry payload is byte-identical");
    });
  });

  it("reuses the SAME key and payload on every in-transport retry after an ambiguous 5xx", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: EVERYDAY }),
      { match: isResend, status: 500, json: { message: "upstream unavailable" } },
    ]);
    await withEnv(digestEnv(), async () => {
      const result = await runDailyOutreachDigest(FIXED_NOW);
      assert.ok(result.failed, "an exhausted ambiguous failure surfaces as failed");

      const sends = stub!.filter((c) => isResend(c.url));
      assert.ok(sends.length >= 2, "the transport retried the ambiguous failure");
      assert.equal(
        new Set(sends.map((c) => c.headers["idempotency-key"])).size,
        1,
        "every attempt re-presents the SAME idempotency key",
      );
      assert.equal(
        new Set(sends.map((c) => c.body)).size,
        1,
        "every attempt re-presents the SAME payload",
      );
    });
  });

  it("a second worker that loses the atomic daily claim never sends", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: EVERYDAY }),
      { match: isResend, json: { id: "digest-concurrent" } },
    ]);
    await withEnv(digestEnv(), async () => {
      const winner = await runDailyOutreachDigest(FIXED_NOW);
      assert.equal(winner.sent, true);
      assert.equal(stub!.filter((c) => isResend(c.url)).length, 1);

      // A racing worker for the same day now sees the claim as already taken
      // (duplicate insert -> empty result) and must not send a second email.
      stub!.restore();
      stub = installFetchStub([
        ...cronRunRoutes({ scheduleValue: EVERYDAY, claimsResult: [] }),
        { match: isResend, json: { id: "must-not-send" } },
      ]);
      const loser = await runDailyOutreachDigest(FIXED_NOW);
      assert.equal(loser.sent, false);
      assert.match(loser.reason ?? "", /already claimed/i);
      assert.equal(
        stub!.filter((c) => isResend(c.url)).length,
        0,
        "concurrent-claim protection still suppresses the second send",
      );
    });
  });
});

/**
 * Scheduling guard: the ACTIVE production cron still ticks every three
 * minutes, so the runner is invoked ~480 times per day. The daily anchor is
 * 08:00 Asia/Dhaka (2026-11-03 = Tuesday -> anchor 02:00:00Z). Any tick that
 * fires BEFORE the anchor must return `not_due` WITHOUT touching Supabase (no
 * claim POST, no DELETE of an existing claim, no delivery-log write) and
 * without calling Resend — otherwise the very first post-midnight tick would
 * claim the day, ship an email ~8 hours early, and cause the real 08:00 tick
 * to be skipped. At / after the anchor the previous claim + send flow is
 * preserved intact.
 */
describe("runDailyOutreachDigest — 08:00 Asia/Dhaka scheduling guard", () => {
  it("07:57 Asia/Dhaka → not due; ZERO Supabase or Resend requests", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: EVERYDAY }),
      { match: isResend, json: { id: "must-not-send" } },
    ]);
    await withEnv(digestEnv(), async () => {
      const result = await runDailyOutreachDigest(
        new Date("2026-11-03T01:57:00.000Z"), // 07:57 BD
      );
      assert.equal(result.sent, false);
      assert.equal(result.skipped, true);
      assert.match(result.reason ?? "", /not due/i);
      assert.equal(
        stub!.length,
        0,
        "a not-due tick must not touch Supabase or Resend at all",
      );
    });
  });

  it("07:59 Asia/Dhaka → still not due one minute before the anchor", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: EVERYDAY }),
      { match: isResend, json: { id: "must-not-send" } },
    ]);
    await withEnv(digestEnv(), async () => {
      const result = await runDailyOutreachDigest(
        new Date("2026-11-03T01:59:00.000Z"), // 07:59 BD
      );
      assert.equal(result.sent, false);
      assert.equal(result.skipped, true);
      assert.match(result.reason ?? "", /not due/i);
      assert.equal(stub!.length, 0);
    });
  });

  it("08:00 Asia/Dhaka → due; claim acquired, single send with the daily key", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: EVERYDAY }),
      { match: isResend, json: { id: "digest-on-time" } },
    ]);
    await withEnv(digestEnv(), async () => {
      const result = await runDailyOutreachDigest(
        new Date("2026-11-03T02:00:00.000Z"), // exactly 08:00 BD
      );
      assert.equal(result.sent, true);
      assert.equal(result.skipped, false);
      assert.equal(result.bdDate, "2026-11-03");
      assert.equal(result.windowCount, 3);

      const sends = stub!.filter((c) => isResend(c.url));
      assert.equal(sends.length, 1);
      assert.equal(
        sends[0]!.headers["idempotency-key"],
        "outreach-digest/asia-dhaka/2026-11-03",
      );
      // Successful path: claim acquired, NOT released, delivery logged as sent.
      assert.ok(stub!.some((c) => isClaims(c.url) && c.method === "POST"));
      assert.ok(!stub!.some((c) => isClaims(c.url) && c.method === "DELETE"));
      const log = stub!.find((c) => isNotifLog(c.url));
      assert.ok(log);
      assert.equal(
        (JSON.parse(log!.body!) as { status: string }).status,
        "sent",
      );
    });
  });

  it("08:03 Asia/Dhaka → due; same daily key and byte-identical payload as the 08:00 tick", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: EVERYDAY }),
      { match: isResend, json: { id: "digest-0803" } },
    ]);
    await withEnv(digestEnv(), async () => {
      // Two on-or-after-anchor ticks on the same BD date. The stub always
      // answers the claim POST as freshly-claimed, so BOTH runs reach the
      // mocked send; that lets us compare the captured requests directly.
      await runDailyOutreachDigest(new Date("2026-11-03T02:00:00.000Z"));
      await runDailyOutreachDigest(new Date("2026-11-03T02:03:00.000Z"));

      const sends = stub!.filter((c) => isResend(c.url));
      assert.equal(sends.length, 2);
      assert.equal(
        sends[0]!.headers["idempotency-key"],
        sends[1]!.headers["idempotency-key"],
        "same BD date → same key regardless of tick time",
      );
      assert.equal(
        sends[0]!.body,
        sends[1]!.body,
        "retry payload is byte-identical (anchor preserved)",
      );
    });
  });

  it("next Bangladesh calendar day → new anchor + new daily key", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: EVERYDAY }),
      { match: isResend, json: { id: "digest-next-day" } },
    ]);
    await withEnv(digestEnv(), async () => {
      await runDailyOutreachDigest(new Date("2026-11-03T02:00:00.000Z")); // Nov 3 08:00 BD
      await runDailyOutreachDigest(new Date("2026-11-04T02:00:00.000Z")); // Nov 4 08:00 BD

      const sends = stub!.filter((c) => isResend(c.url));
      assert.equal(sends.length, 2);
      assert.equal(
        sends[0]!.headers["idempotency-key"],
        "outreach-digest/asia-dhaka/2026-11-03",
      );
      assert.equal(
        sends[1]!.headers["idempotency-key"],
        "outreach-digest/asia-dhaka/2026-11-04",
        "the daily key rolls to the next BD date",
      );
      assert.notEqual(sends[0]!.body, sends[1]!.body, "payload also differs");
    });
  });

  it("preview / dry-run is NOT gated by the 08:00 anchor", async () => {
    stub = installFetchStub([...cronRunRoutes({ scheduleValue: EVERYDAY })]);
    await withEnv({ ...digestEnv(), RESEND_API_KEY: undefined }, async () => {
      // 07:00 BD — well before today's anchor. Preview must still render.
      const result = await runDailyOutreachDigest(
        new Date("2026-11-03T01:00:00.000Z"),
        { dryRun: true },
      );
      assert.ok(result.preview, "preview still renders before the anchor");
      assert.match(result.preview!.subject, /Daily Summary/);
      assert.ok(result.preview!.html.includes("Your Daily Outreach Brief"));
      assert.equal(result.sent, false);
      assert.equal(stub!.filter((c) => isResend(c.url)).length, 0);
      assert.equal(stub!.filter((c) => isClaims(c.url)).length, 0);
    });
  });
});
