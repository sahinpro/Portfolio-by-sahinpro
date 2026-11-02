/**
 * Isolated unit tests for the backup merge helper used by the JSON import.
 * Pure logic only — no Supabase, no IndexedDB. The contract
 * under test is `changed`: exactly the incoming records a non-destructive merge
 * may write (new or strictly newer by parsed epoch), never a copy shadowed by a
 * newer/equal/missing/invalid existing timestamp.
 */
import type { Lead } from "@/admin/types/lead";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeLeadsById } from "./leadBackup";

function makeLead(
  id: string,
  updatedAt: string,
  patch: Partial<Lead> = {},
): Lead {
  const base = {
    id,
    businessName: `Biz ${id}`,
    niche: "",
    country: "",
    city: "",
    websiteUrl: "",
    websiteStatus: "" as Lead["websiteStatus"],
    leadSource: "" as Lead["leadSource"],
    contactPerson: "",
    email: "",
    phone: "",
    instagramUrl: "",
    facebookUrl: "",
    preferredContactMethod: "",
    outreachStatus: "" as Lead["outreachStatus"],
    firstContactDate: "",
    lastContactDate: "",
    followUpDate: "",
    followUpCount: 0,
    firstMessage: "",
    lastConversation: "",
    priority: "",
    opportunity: "",
    improvements: "",
    estBudget: "",
    expectedValue: "",
    notes: "",
    projectStatus: "",
    normalizedKey: `key-${id}`,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt,
  };
  return { ...base, ...patch } as Lead;
}

describe("mergeLeadsById — added / updated / kept", () => {
  it("adds unknown ids and counts them as added", () => {
    const incoming = [makeLead("a", "2026-01-02T00:00:00.000Z")];
    const out = mergeLeadsById([], incoming);
    assert.equal(out.added, 1);
    assert.equal(out.updated, 0);
    assert.equal(out.keptExistingNewer, 0);
    assert.deepEqual(
      out.result.map((l) => l.id),
      ["a"],
    );
  });

  it("updates only strictly-newer incoming copies", () => {
    const existing = [makeLead("a", "2026-01-01T00:00:00.000Z")];
    const incoming = [makeLead("a", "2026-01-02T00:00:00.000Z")];
    const out = mergeLeadsById(existing, incoming);
    assert.equal(out.updated, 1);
    assert.equal(out.added, 0);
    assert.equal(out.result[0].updatedAt, "2026-01-02T00:00:00.000Z");
  });

  it("keeps the existing record when the incoming copy is older", () => {
    const existing = [makeLead("a", "2026-06-01T00:00:00.000Z")];
    const incoming = [makeLead("a", "2026-05-01T00:00:00.000Z")];
    const out = mergeLeadsById(existing, incoming);
    assert.equal(out.keptExistingNewer, 1);
    assert.equal(out.updated, 0);
    assert.equal(out.result[0].updatedAt, "2026-06-01T00:00:00.000Z");
  });

  it("treats equal timestamps as kept (existing wins)", () => {
    const ts = "2026-03-01T00:00:00.000Z";
    const existing = [makeLead("a", ts, { notes: "stored" })];
    const incoming = [makeLead("a", ts, { notes: "backup" })];
    const out = mergeLeadsById(existing, incoming);
    assert.equal(out.keptExistingNewer, 1);
    assert.equal(out.result[0].notes, "stored");
  });

  it("treats a missing incoming updatedAt as not newer (kept)", () => {
    const existing = [makeLead("a", "2026-01-01T00:00:00.000Z")];
    const incoming = [makeLead("a", "")];
    const out = mergeLeadsById(existing, incoming);
    assert.equal(out.keptExistingNewer, 1);
    assert.equal(out.result[0].updatedAt, "2026-01-01T00:00:00.000Z");
  });
});

describe("mergeLeadsById — changed (the subset a merge may write)", () => {
  it("contains exactly the added + strictly-newer incoming records", () => {
    const existing = [
      makeLead("keep", "2026-06-01T00:00:00.000Z"),
      makeLead("equal", "2026-04-01T00:00:00.000Z"),
    ];
    const incoming = [
      makeLead("fresh", "2026-01-01T00:00:00.000Z"), // added
      makeLead("keep", "2026-05-01T00:00:00.000Z"), // older → shadowed
      makeLead("equal", "2026-04-01T00:00:00.000Z"), // equal → shadowed
      makeLead("win", "2026-02-02T00:00:00.000Z", {}), // added
    ];
    const out = mergeLeadsById(existing, incoming);
    assert.deepEqual(out.changed.map((l) => l.id).sort(), ["fresh", "win"]);
    assert.equal(out.added, 2);
    assert.equal(out.updated, 0);
    assert.equal(out.keptExistingNewer, 2);
  });

  it("returns an empty changed list when every incoming record is shadowed", () => {
    const existing = [makeLead("a", "2026-09-01T00:00:00.000Z")];
    const incoming = [makeLead("a", "2026-01-01T00:00:00.000Z")];
    const out = mergeLeadsById(existing, incoming);
    assert.equal(out.changed.length, 0);
    assert.equal(out.keptExistingNewer, 1);
  });

  it("preserves cloud-only existing records untouched in the result", () => {
    const existing = [makeLead("cloud-only", "2026-01-01T00:00:00.000Z")];
    const incoming = [makeLead("local-new", "2026-01-01T00:00:00.000Z")];
    const out = mergeLeadsById(existing, incoming);
    assert.ok(out.result.some((l) => l.id === "cloud-only"));
    assert.equal(out.changed.length, 1);
    assert.equal(out.changed[0].id, "local-new");
  });

  it("counts stay consistent: changed.length === added + updated", () => {
    const existing = [
      makeLead("a", "2026-01-05T00:00:00.000Z"),
      makeLead("b", "2026-01-05T00:00:00.000Z"),
    ];
    const incoming = [
      makeLead("a", "2026-01-09T00:00:00.000Z"), // updated
      makeLead("b", "2026-01-01T00:00:00.000Z"), // kept
      makeLead("c", "2026-01-01T00:00:00.000Z"), // added
    ];
    const out = mergeLeadsById(existing, incoming);
    assert.equal(out.changed.length, out.added + out.updated);
    assert.equal(out.added, 1);
    assert.equal(out.updated, 1);
    assert.equal(out.keptExistingNewer, 1);
  });

  it("changed carries the incoming object, not the stored one", () => {
    const existing = [
      makeLead("a", "2026-01-01T00:00:00.000Z", { notes: "old" }),
    ];
    const incoming = [
      makeLead("a", "2026-02-01T00:00:00.000Z", { notes: "from backup" }),
    ];
    const out = mergeLeadsById(existing, incoming);
    assert.equal(out.changed.length, 1);
    assert.equal(out.changed[0].notes, "from backup");
  });
});

describe("mergeLeadsById — epoch-safe timestamp rules", () => {
  it("1. strictly newer incoming timestamp (same format) is accepted", () => {
    const existing = [makeLead("a", "2026-05-01T10:00:00.000Z")];
    const incoming = [makeLead("a", "2026-05-01T10:00:00.001Z")];
    const out = mergeLeadsById(existing, incoming);
    assert.equal(out.updated, 1);
    assert.deepEqual(
      out.changed.map((l) => l.id),
      ["a"],
    );
  });

  it("2. newer existing timestamp is preserved", () => {
    const existing = [makeLead("a", "2026-05-01T12:00:00.000Z")];
    const incoming = [makeLead("a", "2026-05-01T11:59:59.999Z")];
    const out = mergeLeadsById(existing, incoming);
    assert.equal(out.keptExistingNewer, 1);
    assert.equal(out.changed.length, 0);
    assert.equal(out.result[0].updatedAt, "2026-05-01T12:00:00.000Z");
  });

  it("3. equal timestamps preserve the existing record", () => {
    const ts = "2026-05-01T12:00:00.000Z";
    const out = mergeLeadsById([makeLead("a", ts)], [makeLead("a", ts)]);
    assert.equal(out.keptExistingNewer, 1);
    assert.equal(out.changed.length, 0);
  });

  it("4. missing incoming timestamp preserves the existing record", () => {
    const existing = [makeLead("a", "2026-05-01T12:00:00.000Z")];
    const out = mergeLeadsById(existing, [makeLead("a", "")]);
    assert.equal(out.keptExistingNewer, 1);
    assert.equal(out.changed.length, 0);
  });

  it("5. missing existing timestamp preserves the existing record (no blind accept)", () => {
    // Lexicographic comparison would wrongly accept ANY valid incoming stamp
    // here ("" < anything). Epoch comparison keeps the existing record.
    const existing = [makeLead("a", "", { notes: "stored, untimestamped" })];
    const out = mergeLeadsById(existing, [
      makeLead("a", "2026-05-01T12:00:00.000Z"),
    ]);
    assert.equal(out.keptExistingNewer, 1);
    assert.equal(out.updated, 0);
    assert.equal(out.changed.length, 0);
    assert.equal(out.result[0].notes, "stored, untimestamped");
  });

  it("6. invalid incoming timestamp preserves the existing record", () => {
    const existing = [makeLead("a", "2026-05-01T12:00:00.000Z")];
    const out = mergeLeadsById(existing, [makeLead("a", "not-a-date")]);
    assert.equal(out.keptExistingNewer, 1);
    assert.equal(out.changed.length, 0);
  });

  it("7. invalid existing timestamp preserves the existing record", () => {
    const existing = [makeLead("a", "garbage-stamp", { notes: "stored" })];
    const out = mergeLeadsById(existing, [
      makeLead("a", "2026-05-01T12:00:00.000Z"),
    ]);
    assert.equal(out.keptExistingNewer, 1);
    assert.equal(out.changed.length, 0);
    assert.equal(out.result[0].notes, "stored");
  });

  it("8. different timezone offsets are compared by the actual instant", () => {
    // Incoming string sorts LATER lexicographically but is an EARLIER instant:
    // 13:30+02:00 = 11:30Z < 12:00Z → existing must be preserved.
    const existing = [makeLead("a", "2026-01-01T12:00:00.000Z")];
    const olderInstant = [makeLead("a", "2026-01-01T13:30:00+02:00")];
    const outKeep = mergeLeadsById(existing, olderInstant);
    assert.equal(outKeep.keptExistingNewer, 1);
    assert.equal(outKeep.changed.length, 0);

    // Incoming string sorts EARLIER lexicographically ("09" < "12" is false here
    // but the point is the epoch): 09:30-05:00 = 14:30Z > 12:00Z → accept.
    const newerInstant = [makeLead("a", "2026-01-01T09:30:00-05:00")];
    const outUpdate = mergeLeadsById(existing, newerInstant);
    assert.equal(outUpdate.updated, 1);
    assert.deepEqual(
      outUpdate.changed.map((l) => l.id),
      ["a"],
    );

    // Same instant written two different ways → equal → preserve existing.
    const sameInstant = [makeLead("a", "2026-01-01T13:00:00+01:00")];
    const outEqual = mergeLeadsById(existing, sameInstant);
    assert.equal(outEqual.keptExistingNewer, 1);
    assert.equal(outEqual.changed.length, 0);
  });

  it("9. mixed batch: preview counts match exactly the records a merge writes", () => {
    const existing = [
      makeLead("newer-stored", "2026-06-01T00:00:00.000Z"),
      makeLead("equal-stored", "2026-06-01T00:00:00.000Z"),
      makeLead("broken-stamp", "garbage", { notes: "keep me" }),
      makeLead("losers", "2026-01-01T00:00:00.000Z"),
      makeLead("untimestamped", "", { notes: "keep me too" }),
    ];
    const incoming = [
      makeLead("brand-new", "2026-01-01T00:00:00.000Z"), // added
      makeLead("newer-stored", "2026-05-01T00:00:00.000Z"), // kept (older)
      makeLead("equal-stored", "2026-06-01T00:00:00.000Z"), // kept (equal)
      makeLead("broken-stamp", "2026-06-02T00:00:00.000Z"), // kept (existing invalid)
      makeLead("losers", "2026-06-02T00:00:00.000Z"), // updated (strictly newer)
      makeLead("untimestamped", "2026-12-01T00:00:00.000Z"), // kept (existing missing)
      makeLead("offset-win", "2026-06-01T02:00:00+00:00"), // added (new id)
    ];
    const out = mergeLeadsById(existing, incoming);
    assert.equal(out.added, 2);
    assert.equal(out.updated, 1);
    assert.equal(out.keptExistingNewer, 4);
    // The subset a merge may write == exactly added + updated records.
    assert.deepEqual(out.changed.map((l) => l.id).sort(), [
      "brand-new",
      "losers",
      "offset-win",
    ]);
    assert.equal(out.changed.length, out.added + out.updated);
    // Preserved records survive unchanged in the result.
    const byId = new Map<string, Lead>(
      out.result.map((l): [string, Lead] => [l.id, l]),
    );
    assert.equal(
      byId.get("newer-stored")!.updatedAt,
      "2026-06-01T00:00:00.000Z",
    );
    assert.equal(
      byId.get("equal-stored")!.updatedAt,
      "2026-06-01T00:00:00.000Z",
    );
    assert.equal(byId.get("broken-stamp")!.notes, "keep me");
    assert.equal(byId.get("untimestamped")!.notes, "keep me too");
  });
});
