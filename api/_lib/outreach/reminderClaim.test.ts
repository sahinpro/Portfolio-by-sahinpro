import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import {
  OUTREACH_CLAIMS_TABLE,
  claimReminderSlot,
  releaseReminderSlot,
  type ReminderClaimClient,
} from "./reminderClaim";

type ClaimRow = {
  iana_timezone: string;
  local_date: string;
  window_start: string;
};

type FakeDb = {
  /** Mirrors the claims table: PK (iana_timezone, local_date). */
  rows: Map<string, ClaimRow>;
  insertError: { code?: string; message: string } | null;
  deleteError: { code?: string; message: string } | null;
  insertDelayMs: number;
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function createFakeDb(): FakeDb {
  return {
    rows: new Map(),
    insertError: null,
    deleteError: null,
    insertDelayMs: 0,
  };
}

/** In-memory stand-in for PostgREST insert-on-conflict-ignore / delete. */
function createFakeClient(db: FakeDb): ReminderClaimClient {
  return {
    from: (table: string) => {
      assert.equal(table, OUTREACH_CLAIMS_TABLE);
      return {
        insert: (rows, options) => ({
          select: async () => {
            if (db.insertDelayMs > 0) await delay(db.insertDelayMs);
            if (db.insertError) return { data: null, error: db.insertError };
            const inserted: Record<string, unknown>[] = [];
            for (const raw of rows) {
              const row = raw as unknown as ClaimRow;
              const key = `${row.iana_timezone}@${row.local_date}`;
              if (db.rows.has(key)) {
                if (!options?.ignoreDuplicates) {
                  return {
                    data: null,
                    error: {
                      code: "23505",
                      message: "duplicate key value violates unique constraint",
                    },
                  };
                }
                continue; // ON CONFLICT DO NOTHING
              }
              db.rows.set(key, row);
              inserted.push({ iana_timezone: row.iana_timezone });
            }
            return { data: inserted, error: null };
          },
        }),
        delete: () => ({
          eq: (colA: string, valA: string) => ({
            eq: async (colB: string, valB: string) => {
              if (db.deleteError) return { error: db.deleteError };
              const filters: Record<string, string> = {
                [colA]: valA,
                [colB]: valB,
              };
              db.rows.delete(`${filters.iana_timezone}@${filters.local_date}`);
              return { error: null };
            },
          }),
        }),
      };
    },
  };
}

function claim(db: FakeDb, windowStart = "09:30", localDate = "2026-11-03") {
  return claimReminderSlot(createFakeClient(db), {
    ianaTimezone: "Europe/London",
    localDate,
    windowStart,
  });
}

describe("claimReminderSlot", () => {
  it("first claim wins the slot; a second claim for the same zone/date is a duplicate", async () => {
    const db = createFakeDb();
    assert.deepEqual(await claim(db), { status: "claimed" });
    assert.equal(db.rows.size, 1);
    assert.deepEqual(await claim(db), { status: "duplicate" });
    assert.equal(db.rows.size, 1, "duplicate claims never add rows");
  });

  it("editing the scheduled time after a successful send cannot trigger a second reminder", async () => {
    const db = createFakeDb();
    assert.deepEqual(await claim(db, "09:30"), { status: "claimed" });
    // Admin edits 09:30 → 09:45 (or any other time) for the same local date.
    assert.deepEqual(await claim(db, "09:45"), { status: "duplicate" });
    assert.deepEqual(await claim(db, "14:00"), { status: "duplicate" });
    assert.equal(
      db.rows.get("Europe/London@2026-11-03")?.window_start,
      "09:30",
      "the original winning label is kept",
    );
  });

  it("two concurrent requests for the same zone/date: exactly one claims", async () => {
    const db = createFakeDb();
    db.insertDelayMs = 5; // force both inserts to interleave past the check
    const [a, b] = await Promise.all([claim(db), claim(db)]);
    const statuses = [a.status, b.status].sort();
    assert.deepEqual(statuses, ["claimed", "duplicate"]);
    assert.equal(db.rows.size, 1);
  });

  it("a dedupe query error is never treated as 'no previous notification'", async () => {
    const db = createFakeDb();
    db.insertError = {
      code: "42P01",
      message: 'relation "outreach_window_claims" does not exist',
    };
    const outcome = await claim(db);
    assert.equal(outcome.status, "error");
    assert.equal(db.rows.size, 0);
  });

  it("different local dates claim independently", async () => {
    const db = createFakeDb();
    assert.deepEqual(await claim(db, "09:30", "2026-11-03"), {
      status: "claimed",
    });
    assert.deepEqual(await claim(db, "09:30", "2026-11-04"), {
      status: "claimed",
    });
    assert.equal(db.rows.size, 2);
  });
});

describe("retry handling", () => {
  it("a failed send releases the claim so the next tick can retry", async () => {
    const db = createFakeDb();
    const client = createFakeClient(db);
    assert.deepEqual(
      await claimReminderSlot(client, {
        ianaTimezone: "Europe/London",
        localDate: "2026-11-03",
        windowStart: "09:30",
      }),
      { status: "claimed" },
    );

    const releaseError = await releaseReminderSlot(
      client,
      "Europe/London",
      "2026-11-03",
    );
    assert.equal(releaseError, null);
    assert.equal(db.rows.size, 0);

    // Next cron tick retries and wins again.
    assert.deepEqual(
      await claimReminderSlot(client, {
        ianaTimezone: "Europe/London",
        localDate: "2026-11-03",
        windowStart: "09:30",
      }),
      { status: "claimed" },
    );
  });

  it("a failed release keeps the claim (no retry, but never a double send)", async () => {
    const db = createFakeDb();
    const client = createFakeClient(db);
    await claimReminderSlot(client, {
      ianaTimezone: "Europe/London",
      localDate: "2026-11-03",
      windowStart: "09:30",
    });
    db.deleteError = { code: "XX000", message: "connection reset" };
    const reason = await releaseReminderSlot(
      client,
      "Europe/London",
      "2026-11-03",
    );
    assert.equal(reason, "XX000: connection reset");
    assert.equal(db.rows.size, 1, "claim stays reserved");
  });
});

describe("legacy duplicate sent records", () => {
  // The old read-then-send dedupe errored when the notifications log held
  // multiple 'sent' rows for one zone/date. The claim design never reads the
  // log, and the migration backfills exactly one claim per zone/date from
  // legacy history (DISTINCT ON), so those records can no longer cause a
  // second send or a fail-open.
  it("the send decision never reads the notifications log", async () => {
    const sources = await Promise.all(
      ["./reminderClaim.ts", "./runOutreachNotifications.ts"].map((p) =>
        readFile(new URL(p, import.meta.url), "utf8"),
      ),
    );
    const combined = sources.join("\n");
    assert.ok(
      !combined.includes("wasNotificationAlreadySent"),
      "the fail-open lookup must stay deleted",
    );
    // The delivery-history table may hold multiple rows per zone/date, so no
    // module consulted for the send decision may single-row-read it. (The
    // site_settings lookups in the runner legitimately use maybeSingle —
    // unique by key.)
    const logSrc = await readFile(
      new URL("./notificationLog.ts", import.meta.url),
      "utf8",
    );
    assert.ok(
      !logSrc.includes("maybeSingle"),
      "single-row reads over multi-row history are the original bug",
    );
    assert.ok(
      !combined.includes('from("outreach_window_notifications")'),
      "the send decision must not read the notifications log",
    );
  });

  it("migration backfills claims from legacy sent rows with DISTINCT ON and no DELETE", async () => {
    const sql = await readFile(
      new URL(
        "../../../supabase/migrations/20261023210000_outreach_reminder_claims.sql",
        import.meta.url,
      ),
      "utf8",
    );
    assert.ok(sql.includes("DISTINCT ON (iana_timezone, local_date)"));
    assert.ok(sql.includes("WHERE status = 'sent'"));
    assert.ok(
      sql.includes("ON CONFLICT (iana_timezone, local_date) DO NOTHING"),
    );
    assert.ok(!/DELETE FROM public\.outreach_window_notifications/i.test(sql));
    assert.ok(!/DROP TABLE/i.test(sql));
    assert.ok(
      sql.includes("PRIMARY KEY (iana_timezone, local_date)"),
      "DB-level enforcement of one reminder per zone/date",
    );
  });
});

describe("test emails stay independent of production claims", () => {
  it("the admin test-send route neither claims nor records production notifications", async () => {
    const routeSrc = await readFile(
      new URL(
        "../../../src/app/api/admin/outreach-notifications/test/route.ts",
        import.meta.url,
      ),
      "utf8",
    );
    assert.ok(!routeSrc.includes("claimReminderSlot"));
    assert.ok(!routeSrc.includes("releaseReminderSlot"));
    assert.ok(!routeSrc.includes("recordNotificationDelivery"));
  });
});
