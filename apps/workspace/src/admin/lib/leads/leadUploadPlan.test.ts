/**
 * Isolated unit tests for the conflict-safe local→cloud lead migration plan.
 * Pure logic only — no Supabase, no IndexedDB.
 */
import type { Lead } from "@/admin/types/lead";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  leadFingerprint,
  parseLeadTimestamp,
  planLeadUpload,
} from "./leadUploadPlan";

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

describe("parseLeadTimestamp", () => {
  it("returns NaN for missing / empty / invalid values", () => {
    assert.ok(Number.isNaN(parseLeadTimestamp(undefined)));
    assert.ok(Number.isNaN(parseLeadTimestamp("")));
    assert.ok(Number.isNaN(parseLeadTimestamp("not-a-date")));
  });
  it("parses a valid ISO date-time", () => {
    assert.equal(
      parseLeadTimestamp("2026-01-02T03:04:05.000Z"),
      Date.parse("2026-01-02T03:04:05.000Z"),
    );
  });
});

describe("planLeadUpload", () => {
  it("uploads a record that exists only locally (insert)", () => {
    const plan = planLeadUpload(
      [makeLead("a", "2026-01-01T00:00:00.000Z")],
      [],
    );
    assert.deepEqual(plan.insertIds, ["a"]);
    assert.deepEqual(plan.updateIds, []);
    assert.deepEqual(plan.cloudPreservedIds, []);
    assert.equal(plan.toUpload.length, 1);
  });

  it("leaves a cloud-only record untouched", () => {
    const plan = planLeadUpload(
      [],
      [makeLead("c", "2026-01-01T00:00:00.000Z")],
    );
    assert.equal(plan.toUpload.length, 0);
    assert.equal(plan.cloudCount, 1);
  });

  it("uploads the local version when it is strictly newer (update)", () => {
    const plan = planLeadUpload(
      [makeLead("a", "2026-05-01T00:00:00.000Z")],
      [makeLead("a", "2026-01-01T00:00:00.000Z")],
    );
    assert.deepEqual(plan.updateIds, ["a"]);
    assert.equal(plan.toUpload.length, 1);
  });

  it("preserves the cloud version when the cloud is newer", () => {
    const plan = planLeadUpload(
      [makeLead("a", "2026-01-01T00:00:00.000Z")],
      [makeLead("a", "2026-05-01T00:00:00.000Z")],
    );
    assert.deepEqual(plan.cloudPreservedIds, ["a"]);
    assert.equal(plan.toUpload.length, 0);
  });

  it("preserves the cloud version when timestamps are equal", () => {
    const same = "2026-03-03T12:00:00.000Z";
    const plan = planLeadUpload([makeLead("a", same)], [makeLead("a", same)]);
    assert.deepEqual(plan.cloudPreservedIds, ["a"]);
    assert.equal(plan.toUpload.length, 0);
  });

  it("preserves the cloud version when the local timestamp is missing", () => {
    const plan = planLeadUpload(
      [makeLead("a", "")],
      [makeLead("a", "2026-01-01T00:00:00.000Z")],
    );
    assert.deepEqual(plan.cloudPreservedIds, ["a"]);
    assert.equal(plan.toUpload.length, 0);
  });

  it("preserves the cloud version when a timestamp is invalid", () => {
    const plan = planLeadUpload(
      [makeLead("a", "garbage")],
      [makeLead("a", "2026-01-01T00:00:00.000Z")],
    );
    assert.deepEqual(plan.cloudPreservedIds, ["a"]);
    assert.equal(plan.toUpload.length, 0);
  });

  it("resolves a mixed set of records independently", () => {
    const local = [
      makeLead("insert", "2026-01-01T00:00:00.000Z"), // only local
      makeLead("newer", "2026-06-01T00:00:00.000Z"), // local newer
      makeLead("older", "2026-01-01T00:00:00.000Z"), // cloud newer
      makeLead("tie", "2026-02-02T00:00:00.000Z"), // equal
    ];
    const cloud = [
      makeLead("newer", "2026-05-01T00:00:00.000Z"),
      makeLead("older", "2026-06-01T00:00:00.000Z"),
      makeLead("tie", "2026-02-02T00:00:00.000Z"),
      makeLead("cloudOnly", "2026-01-01T00:00:00.000Z"),
    ];
    const plan = planLeadUpload(local, cloud);
    assert.deepEqual(plan.insertIds, ["insert"]);
    assert.deepEqual(plan.updateIds, ["newer"]);
    assert.deepEqual(plan.cloudPreservedIds.sort(), ["older", "tie"]);
    assert.deepEqual(plan.toUpload.map((l) => l.id).sort(), [
      "insert",
      "newer",
    ]);
    assert.equal(plan.localCount, 4);
    assert.equal(plan.cloudCount, 4);
  });

  it("does not mutate its inputs", () => {
    const local = [makeLead("a", "2026-06-01T00:00:00.000Z")];
    const cloud = [makeLead("a", "2026-01-01T00:00:00.000Z")];
    const localSnapshot = local.slice();
    const cloudSnapshot = cloud.slice();
    planLeadUpload(local, cloud);
    assert.deepEqual(local, localSnapshot);
    assert.deepEqual(cloud, cloudSnapshot);
  });
});

describe("leadFingerprint", () => {
  it("differs when a compared field differs, and matches when identical", () => {
    const a = makeLead("x", "2026-01-01T00:00:00.000Z", { notes: "old" });
    const b = makeLead("x", "2026-01-01T00:00:00.000Z", { notes: "new" });
    assert.notEqual(leadFingerprint(a), leadFingerprint(b));
    assert.equal(
      leadFingerprint(a),
      leadFingerprint(
        makeLead("x", "2026-01-01T00:00:00.000Z", { notes: "old" }),
      ),
    );
  });
});
