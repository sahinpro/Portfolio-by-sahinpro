import { getAllLeads, saveLeadMigrationRecord } from "@/admin/lib/leads/leadDb";
import { listLeads, upsertLeads } from "@/admin/lib/leads/leadRepository";
import {
  leadFingerprint,
  planLeadUpload,
} from "@/admin/lib/leads/leadUploadPlan";
import type { Lead } from "@/admin/types/lead";

/**
 * One-time (repeatable, idempotent) upload of the leads that exist only in this
 * browser into the Supabase `leads` table — followed by an independent
 * verification pass that re-reads the cloud and compares records.
 *
 * The upload is CONFLICT-SAFE: only records that are local-only or
 * demonstrably newer than the cloud copy are sent. A newer cloud record for the
 * same id is preserved and reported, never overwritten, and never counted as a
 * failed upload.
 *
 * The local IndexedDB rows are deliberately kept: they are the backup until the
 * admin decides otherwise, and re-running this only upserts by id.
 */

export type LeadSyncStatus = {
  /** Leads stored in this browser's IndexedDB. */
  localCount: number;
  /** Local ids that are safe to upload (missing from cloud or newer than it). */
  pendingIds: string[];
  /** Local ids where the cloud is already authoritative (kept / equal / newer). */
  syncedCount: number;
  /** Cloud-only rows (created on another device / after the upload). */
  cloudOnlyCount: number;
};

/** Compare the local store against the cloud table (no writes). */
export async function inspectLeadSync(
  cloudLeads?: Lead[],
): Promise<LeadSyncStatus & { cloudCount: number }> {
  const [local, cloud] = await Promise.all([
    getAllLeads(),
    cloudLeads ? Promise.resolve(cloudLeads) : listLeads(),
  ]);
  const plan = planLeadUpload(local, cloud);
  const localIds = new Set(local.map((lead) => lead.id));

  return {
    localCount: local.length,
    cloudCount: cloud.length,
    pendingIds: plan.toUpload.map((lead) => lead.id),
    syncedCount: local.length - plan.toUpload.length,
    cloudOnlyCount: cloud.filter((lead) => !localIds.has(lead.id)).length,
  };
}

export type LeadUploadReport = {
  localCount: number;
  /** Records the plan deemed safe to send (local-only + local-newer). */
  uploaded: number;
  /** Inserted records confirmed present in the cloud after the upload. */
  inserted: number;
  /** Updated (local-newer) records confirmed to match the local copy after. */
  updated: number;
  /** Same-id records intentionally NOT overwritten because the cloud was newer/equal/uncomparable. */
  cloudPreserved: number;
  /** inserted + updated — records that were sent and verified. */
  verified: number;
  /** Ids we sent but could not find in the cloud after the upload. */
  missingIds: string[];
  /** Ids we sent that came back different from the local copy. */
  mismatchedIds: string[];
  uploadedAt: string;
};

/**
 * Upload the conflict-safe subset of local leads, then verify by re-reading the
 * table. Throws (via the repository) when the table is missing or RLS blocks the
 * write. Never overwrites a newer cloud record; never deletes local data.
 */
export async function uploadLocalLeads(): Promise<LeadUploadReport> {
  const local = await getAllLeads();
  const cloud = await listLeads();
  const plan = planLeadUpload(local, cloud);

  const uploadedAt = new Date().toISOString();

  if (plan.toUpload.length === 0) {
    return {
      localCount: local.length,
      uploaded: 0,
      inserted: 0,
      updated: 0,
      cloudPreserved: plan.cloudPreservedIds.length,
      verified: 0,
      missingIds: [],
      mismatchedIds: [],
      uploadedAt,
    };
  }

  const localById = new Map(local.map((lead) => [lead.id, lead]));
  const uploaded = plan.toUpload.length;
  await upsertLeads(plan.toUpload);

  // Independent read-back: never trust the write path alone.
  const cloudAfter = await listLeads();
  const byIdAfter = new Map(cloudAfter.map((lead) => [lead.id, lead]));

  const expectedIds = [...plan.insertIds, ...plan.updateIds];
  const missingIds: string[] = [];
  const mismatchedIds: string[] = [];
  let inserted = 0;
  let updated = 0;

  const insertSet = new Set(plan.insertIds);
  for (const id of expectedIds) {
    const row = byIdAfter.get(id);
    if (!row) {
      missingIds.push(id);
      continue;
    }
    const source = localById.get(id);
    if (source && leadFingerprint(row) !== leadFingerprint(source)) {
      // We sent it and it came back different → a genuine failed/absorbed write.
      mismatchedIds.push(id);
      continue;
    }
    if (insertSet.has(id)) inserted += 1;
    else updated += 1;
  }

  const verified = inserted + updated;

  if (verified > 0) {
    await saveLeadMigrationRecord({
      uploadedAt,
      uploadedCount: uploaded,
      verifiedCount: verified,
      localCountAtUpload: local.length,
    });
  }

  return {
    localCount: local.length,
    uploaded,
    inserted,
    updated,
    cloudPreserved: plan.cloudPreservedIds.length,
    verified,
    missingIds,
    mismatchedIds,
    uploadedAt,
  };
}

/**
 * Safety net before an upload: the caller can offer the JSON export, which is
 * the only backup that survives "clear site data" on top of the cloud copy.
 */
export function describeUpload(report: LeadUploadReport): string {
  if (report.localCount === 0) return "Nothing was stored in this browser.";
  if (
    report.uploaded === 0 &&
    report.cloudPreserved > 0 &&
    report.missingIds.length === 0 &&
    report.mismatchedIds.length === 0
  ) {
    return `Your ${report.cloudPreserved} shared lead${
      report.cloudPreserved === 1 ? "" : "s"
    } ${report.cloudPreserved === 1 ? "is" : "are"} already newer or equal in Supabase — nothing was overwritten, and your local copy is untouched.`;
  }
  if (report.missingIds.length === 0 && report.mismatchedIds.length === 0) {
    const preserved =
      report.cloudPreserved > 0
        ? `; ${report.cloudPreserved} newer cloud record${
            report.cloudPreserved === 1 ? "" : "s"
          } left intact`
        : "";
    return `All ${report.verified} safe-to-send lead${
      report.verified === 1 ? "" : "s"
    } were uploaded and verified in Supabase${preserved}. Your browser copy is untouched.`;
  }
  if (report.verified === 0) {
    return "Upload reported success but verification found no matching records — nothing was deleted locally.";
  }
  return `${report.verified}/${report.uploaded} verified; ${report.missingIds.length} missing, ${report.mismatchedIds.length} different after the upload. Newer cloud records (${report.cloudPreserved}) were preserved. Your local copy is untouched — retry or export JSON.`;
}
