import {
  getAllLeads,
  saveLeadMigrationRecord,
} from "@/admin/lib/leads/leadDb";
import { listLeads, upsertLeads } from "@/admin/lib/leads/leadRepository";
import type { Lead } from "@/admin/types/lead";

/**
 * One-time (repeatable, idempotent) upload of the leads that exist only in this
 * browser into the Supabase `leads` table — followed by an independent
 * verification pass that re-reads the cloud and compares records.
 *
 * The local IndexedDB rows are deliberately kept: they are the backup until the
 * admin decides otherwise, and re-running this only upserts by id.
 */

export type LeadSyncStatus = {
  /** Leads stored in this browser's IndexedDB. */
  localCount: number;
  /** Local ids that are missing from the cloud table. */
  pendingIds: string[];
  /** Ids present in both. */
  syncedCount: number;
  /** Cloud-only rows (created on another device / after the upload). */
  cloudOnlyCount: number;
};

/** Fields compared during verification — enough to catch a bad write. */
function fingerprint(lead: Lead): string {
  return [
    lead.businessName,
    lead.niche,
    lead.country,
    lead.city,
    lead.websiteUrl,
    lead.websiteStatus,
    lead.leadSource,
    lead.email,
    lead.phone,
    lead.instagramUrl,
    lead.outreachStatus,
    lead.followUpDate,
    lead.followUpCount,
    lead.notes,
    lead.normalizedKey,
    lead.priority,
    lead.projectStatus,
    lead.updatedAt,
  ].join("\u0000");
}

/** Compare the local store against the cloud table (no writes). */
export async function inspectLeadSync(
  cloudLeads?: Lead[],
): Promise<LeadSyncStatus & { cloudCount: number }> {
  const [local, cloud] = await Promise.all([
    getAllLeads(),
    cloudLeads ? Promise.resolve(cloudLeads) : listLeads(),
  ]);
  const cloudIds = new Set(cloud.map((lead) => lead.id));
  const localIds = new Set(local.map((lead) => lead.id));
  const pendingIds = local.filter((lead) => !cloudIds.has(lead.id)).map((l) => l.id);

  return {
    localCount: local.length,
    cloudCount: cloud.length,
    pendingIds,
    syncedCount: localIds.size - pendingIds.length,
    cloudOnlyCount: cloud.filter((lead) => !localIds.has(lead.id)).length,
  };
}

export type LeadUploadReport = {
  localCount: number;
  uploaded: number;
  verified: number;
  /** Local ids that could not be found in the cloud after the upload. */
  missingIds: string[];
  /** Ids found in the cloud whose contents differ from the local record. */
  mismatchedIds: string[];
  uploadedAt: string;
};

/**
 * Upload every local lead, then verify by re-reading the table.
 * Throws (via the repository) when the table is missing or RLS blocks the write.
 */
export async function uploadLocalLeads(): Promise<LeadUploadReport> {
  const local = await getAllLeads();
  if (local.length === 0) {
    return {
      localCount: 0,
      uploaded: 0,
      verified: 0,
      missingIds: [],
      mismatchedIds: [],
      uploadedAt: new Date().toISOString(),
    };
  }

  const uploaded = await upsertLeads(local);
  // Independent read-back: never trust the write count alone.
  const cloud = await listLeads();
  const byId = new Map(cloud.map((lead) => [lead.id, lead]));

  const missingIds = local
    .filter((lead) => !byId.has(lead.id))
    .map((lead) => lead.id);
  const mismatchedIds = local
    .filter((lead) => {
      const row = byId.get(lead.id);
      return row ? fingerprint(row) !== fingerprint(lead) : false;
    })
    .map((lead) => lead.id);

  const verified = local.length - missingIds.length - mismatchedIds.length;
  const uploadedAt = new Date().toISOString();

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
  if (report.missingIds.length === 0 && report.mismatchedIds.length === 0) {
    return `All ${report.verified} local leads were uploaded and verified in Supabase. The browser copy is untouched.`;
  }
  if (report.verified === 0) {
    return "Upload reported success but verification found no matching records — nothing was deleted locally.";
  }
  return `${report.verified}/${report.localCount} verified; ${report.missingIds.length} missing, ${report.mismatchedIds.length} different. Your local copy is untouched — retry or export JSON.`;
}
