/**
 * Workspace API: GET /api/cron/outreach-windows — the status contract the
 * Supabase pg_cron caller depends on. It now produces exactly ONE Daily
 * Outreach Digest (not per-zone emails): 200 for a clean tick (sent, or a
 * fail-safe/skip no-op), 207 when the digest send failed.
 *
 * The schedule is stubbed to open every weekday at 09:30 local, and the
 * env-pinned single America/New_York zone therefore always has a window inside
 * the next-24h horizon regardless of when the suite runs. Every external call
 * (site_settings reads, the daily claim insert/release, delivery-log upsert,
 * Resend send) is served by the fetch stub; nothing reaches production — see
 * ./harness.ts.
 */
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "../app";
import {
  CRON_ENV,
  CRON_HEADERS,
  cronRunRoutes,
  installFetchStub,
  isClaims,
  isNotifLog,
  isResend,
  withEnv,
} from "./harness";

const CRON_PATH = "/api/cron/outreach-windows";

/** Every weekday, 09:30 local → the pinned zone always opens within 24h. */
function digestScheduleValue(): string {
  return JSON.stringify({
    days: [0, 1, 2, 3, 4, 5, 6],
    startMinutes: 9 * 60 + 30,
    graceMinutes: 4,
  });
}

type DigestResult = {
  checkedAt: string;
  bdDate: string;
  windowCount: number;
  sent: boolean;
  skipped: boolean;
  reason?: string;
  failed?: string;
  warnings: string[];
};

let stub: ReturnType<typeof installFetchStub> | null = null;
afterEach(() => {
  stub?.restore();
  stub = null;
});

function runCron() {
  return api.request(CRON_PATH, { method: "GET", headers: CRON_HEADERS });
}

/**
 * Pin `new Date()` inside `run` to `isoMs` (epoch ms). The route handler calls
 * `runDailyOutreachDigest(new Date())` and the runner now refuses to send
 * before today's 08:00 Asia/Dhaka anchor; a fixed post-anchor clock keeps
 * these route tests deterministic regardless of when the suite runs.
 */
function withFixedClock<T>(isoMs: number, run: () => Promise<T>): Promise<T> {
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) super(isoMs);
      // @ts-expect-error pass remaining overloads through unchanged
      else super(...args);
    }
    static now(): number {
      return isoMs;
    }
  }
  // @ts-expect-error narrow the constructor just for tests
  globalThis.Date = FakeDate;
  return run().finally(() => {
    globalThis.Date = RealDate;
  });
}

// 2026-11-03 (Tue) 08:05 Asia/Dhaka = 02:05Z — a few minutes AFTER the daily
// anchor, so the runner takes the normal claim + send path.
const ANCHOR_PASSED_MS = Date.UTC(2026, 10, 3, 2, 5, 0);

describe("workspace api: cron outreach-windows (daily digest)", () => {
  it("fail-safe 200 without sending when RESEND_API_KEY is unset (no network at all)", async () => {
    stub = installFetchStub([]);
    await withEnv(
      {
        ...CRON_ENV,
        RESEND_API_KEY: undefined,
        NEXT_PUBLIC_ADMIN_EMAIL: undefined,
      },
      async () => {
        const res = await runCron();
        assert.equal(res.status, 200);
        const body = (await res.json()) as DigestResult;
        assert.equal(body.sent, false);
        assert.equal(body.skipped, true);
        assert.ok(
          body.warnings.includes("RESEND_API_KEY is not configured"),
          "reports the missing-key warning",
        );
        // The fail-safe returns before any DB or email call whatsoever.
        assert.equal(stub!.length, 0);
      },
    );
  });

  it("answers 200 and sends the ONE digest when the day is claimed", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: digestScheduleValue() }),
      { match: isResend, json: { id: "email-digest-1" } },
    ]);
    await withEnv(
      { ...CRON_ENV, NEXT_PUBLIC_ADMIN_EMAIL: undefined },
      () =>
        withFixedClock(ANCHOR_PASSED_MS, async () => {
          const res = await runCron();
          assert.equal(res.status, 200);
          const body = (await res.json()) as DigestResult;
          assert.ok(body.windowCount >= 1, "pinned zone opens within 24h");
          assert.equal(body.sent, true);
          assert.equal(body.failed, undefined);

          // Exactly ONE email — the whole point of the digest redesign.
          const sends = stub!.filter((c) => isResend(c.url));
          assert.equal(sends.length, 1, "multiple cities must yield one digest");
          assert.ok(
            /^outreach-digest\/asia-dhaka\/\d{4}-\d{2}-\d{2}$/.test(
              sends[0].headers["idempotency-key"] ?? "",
            ),
            "the send uses a deterministic per-BD-date digest idempotency key",
          );

          // A daily claim (POST) reserved the day before the send; success logged;
          // the claim was NOT released.
          assert.ok(stub!.some((c) => isClaims(c.url) && c.method === "POST"));
          assert.ok(!stub!.some((c) => isClaims(c.url) && c.method === "DELETE"));
          const log = stub!.find((c) => isNotifLog(c.url));
          assert.ok(log, "expected a delivery-log upsert");
          assert.equal(
            (JSON.parse(log!.body!) as { status: string }).status,
            "sent",
          );
        }),
    );
  });

  it("answers 207 when the digest send fails, and releases the claim for retry", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: digestScheduleValue() }),
      {
        // 4xx throws immediately in the resend client (no retry sleeps).
        match: isResend,
        status: 400,
        json: { message: "stub rejected", name: "validation_failed" },
      },
    ]);
    await withEnv(
      { ...CRON_ENV, NEXT_PUBLIC_ADMIN_EMAIL: undefined },
      () =>
        withFixedClock(ANCHOR_PASSED_MS, async () => {
          const res = await runCron();
          assert.equal(res.status, 207);
          const body = (await res.json()) as DigestResult;
          assert.equal(body.sent, false);
          assert.ok(body.failed, "the failure surfaces on the result");

          // Failure path: logged as FAILED (never a false success) and the daily
          // claim released so a later tick may retry today.
          const log = stub!.find((c) => isNotifLog(c.url));
          assert.equal(
            (JSON.parse(log!.body!) as { status: string }).status,
            "failed",
          );
          assert.ok(
            stub!.some((c) => isClaims(c.url) && c.method === "DELETE"),
            "the failed digest released its daily claim",
          );
        }),
    );
  });

  it("accepts the x-cron-secret header spelling of the contract", async () => {
    stub = installFetchStub([]);
    await withEnv(
      {
        ...CRON_ENV,
        RESEND_API_KEY: undefined,
        NEXT_PUBLIC_ADMIN_EMAIL: undefined,
      },
      async () => {
        const res = await api.request(CRON_PATH, {
          method: "GET",
          headers: { "x-cron-secret": "test-cron-secret" },
        });
        // Auth passes; fail-safe send-skip → 200 (not 401).
        assert.equal(res.status, 200);
      },
    );
  });
});
