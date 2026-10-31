/**
 * Workspace API: GET /api/cron/outreach-windows — the status contract the
 * Supabase pg_cron caller depends on: 200 for a clean tick (including the
 * fail-safe no-ops), 207 when any zone send failed.
 *
 * The schedule fed to the run is generated around the CURRENT minute in
 * America/New_York (`startMinutes = now`, grace 30) with a single env-pinned
 * zone, so exactly one window matches on every tick regardless of when the
 * suite runs. Every external call (site_settings reads, claims insert/release,
 * notification-log upsert, Resend send) is served by the fetch stub; the
 * service-role client is created against the test URL on its first call and
 * cached — see the ordering note in ./harness.ts.
 *
 * Tiny theoretical caveat, in-code: if the wall clock crosses a NEW_YORK
 * minute boundary between computing `startMinutes` and the route's own
 * `new Date()`, the route's minute is +1 — still inside the 30-min grace, so
 * the match holds. Only an exactly-23:59:59.x run would miss (startMinutes
 * 1439, next minute wraps to 0); not reproducible in CI, accepted trade-off.
 */
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { minutesOfDayInTz } from "../../lib/timezone";
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
const NY_TZ = "America/New_York";

/** A schedule whose 30-minute window contains this exact instant. */
function liveScheduleValue(): string {
  const startMinutes = minutesOfDayInTz(NY_TZ, new Date());
  return JSON.stringify({
    days: [0, 1, 2, 3, 4, 5, 6],
    startMinutes,
    graceMinutes: 30,
  });
}

let stub: ReturnType<typeof installFetchStub> | null = null;
afterEach(() => {
  stub?.restore();
  stub = null;
});

function runCron() {
  return api.request(CRON_PATH, { method: "GET", headers: CRON_HEADERS });
}

type RunResult = {
  checkedAt: string;
  matches: number;
  sent: string[];
  skipped: string[];
  failed: { tz: string; error: string }[];
  warnings: string[];
};

describe("workspace api: cron outreach-windows", () => {
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
        const body = (await res.json()) as RunResult;
        assert.deepEqual(body.warnings, ["RESEND_API_KEY is not configured"]);
        assert.equal(body.sent.length, 0);
        assert.equal(body.failed.length, 0);
        // The fail-safe returns before any DB or email call whatsoever.
        assert.equal(stub!.length, 0);
      },
    );
  });

  it("fail-safe 200 without sending when the recipient address is unset", async () => {
    stub = installFetchStub([]);
    await withEnv(
      {
        ...CRON_ENV,
        CONTACT_NOTIFICATION_TO_EMAIL: undefined,
        NEXT_PUBLIC_ADMIN_EMAIL: undefined,
      },
      async () => {
        const res = await runCron();
        assert.equal(res.status, 200);
        const body = (await res.json()) as RunResult;
        assert.deepEqual(body.warnings, [
          "CONTACT_NOTIFICATION_TO_EMAIL is not configured",
        ]);
        assert.equal(stub!.length, 0);
      },
    );
  });

  it("answers 200 when the tick completes with every send delivered", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: liveScheduleValue() }),
      { match: isResend, json: { id: "email-cron-1" } },
    ]);
    await withEnv(
      { ...CRON_ENV, NEXT_PUBLIC_ADMIN_EMAIL: undefined },
      async () => {
        const res = await runCron();
        assert.equal(res.status, 200);
        const body = (await res.json()) as RunResult;
        assert.equal(body.matches, 1, "env pins exactly one NY zone in-window");
        assert.equal(body.sent.length, 1);
        assert.equal(body.failed.length, 0);
        assert.deepEqual(body.warnings, []);

        // Claimed before send, reminder emailed, success recorded — and the
        // claim was NOT released.
        assert.ok(stub!.some((c) => isClaims(c.url) && c.method === "POST"));
        const email = stub!.find((c) => isResend(c.url));
        assert.ok(email, "expected a Resend send");
        assert.ok(
          email!.headers["idempotency-key"],
          "sends are idempotency-keyed",
        );
        assert.ok(!stub!.some((c) => isClaims(c.url) && c.method === "DELETE"));
        const log = stub!.find((c) => isNotifLog(c.url));
        assert.ok(log, "expected a delivery-log upsert");
        assert.equal(
          (JSON.parse(log!.body!) as { status: string }).status,
          "sent",
        );
      },
    );
  });

  it("answers 207 when a zone send fails, and releases the claim for retry", async () => {
    stub = installFetchStub([
      ...cronRunRoutes({ scheduleValue: liveScheduleValue() }),
      {
        // 4xx throws immediately in the resend client (no retry sleeps).
        match: isResend,
        status: 400,
        json: { message: "stub rejected", name: "validation_failed" },
      },
    ]);
    await withEnv(
      { ...CRON_ENV, NEXT_PUBLIC_ADMIN_EMAIL: undefined },
      async () => {
        const res = await runCron();
        assert.equal(res.status, 207);
        const body = (await res.json()) as RunResult;
        assert.equal(body.matches, 1);
        assert.equal(body.sent.length, 0);
        assert.deepEqual(body.failed, [{ tz: NY_TZ, error: "stub rejected" }]);

        // Failure path: delivery logged as failed, claim released so the next
        // tick may retry this zone/date.
        const log = stub!.find((c) => isNotifLog(c.url));
        assert.ok(log, "expected a delivery-log upsert");
        assert.equal(
          (JSON.parse(log!.body!) as { status: string }).status,
          "failed",
        );
        assert.ok(
          stub!.some((c) => isClaims(c.url) && c.method === "DELETE"),
          "expected the failed send to release its claim",
        );
      },
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
