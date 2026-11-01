import type { Lead } from "@/admin/types/lead";

/**
 * Pure, side-effect-free planning for the one-time browser-local → cloud lead
 * upload.
 *
 * The previous migration upserted EVERY local record by `id`, so an older
 * browser copy could silently overwrite a newer cloud row. This module decides,
 * per record, what is actually safe to send:
 *
 *   - id only in local                       → upload (insert)
 *   - id only in cloud                       → leave untouched (preserve cloud)
 *   - id in both, local strictly newer       → upload (update)
 *   - id in both, cloud newer / equal /
 *     either timestamp missing or invalid    → do NOT overwrite, report conflict
 *
 * Timestamps are compared as parsed epoch milliseconds, never as raw strings,
 * so only well-formed, strictly-greater local times qualify as "newer".
 */

/** Epoch ms for a lead timestamp, or `NaN` when missing/unparseable. */
export function parseLeadTimestamp(value: string | undefined | null): number {
  if (!value) return Number.NaN;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? Number.NaN : ms;
}

/** Field set compared during verification — enough to catch a bad write. */
export function leadFingerprint(lead: Lead): string {
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

export type LeadUploadPlan = {
  /** Local records that are safe to send (inserts + local-newer updates). */
  toUpload: Lead[];
  /** Ids present locally but not in the cloud — expected to be inserted. */
  insertIds: string[];
  /** Ids in both where the local copy is strictly newer — expected updates. */
  updateIds: string[];
  /** Ids in both where the cloud copy is kept (newer/equal/uncomparable). */
  cloudPreservedIds: string[];
  localCount: number;
  cloudCount: number;
};

/**
 * Decide the local→cloud upload set without mutating anything. Pure: same
 * inputs always yield the same plan, and neither array is modified.
 */
export function planLeadUpload(local: Lead[], cloud: Lead[]): LeadUploadPlan {
  const cloudById = new Map(cloud.map((lead) => [lead.id, lead]));

  const toUpload: Lead[] = [];
  const insertIds: string[] = [];
  const updateIds: string[] = [];
  const cloudPreservedIds: string[] = [];

  for (const localLead of local) {
    const cloudLead = cloudById.get(localLead.id);
    if (!cloudLead) {
      toUpload.push(localLead);
      insertIds.push(localLead.id);
      continue;
    }

    const localMs = parseLeadTimestamp(localLead.updatedAt);
    const cloudMs = parseLeadTimestamp(cloudLead.updatedAt);
    const localIsNewer =
      !Number.isNaN(localMs) && !Number.isNaN(cloudMs) && localMs > cloudMs;

    if (localIsNewer) {
      toUpload.push(localLead);
      updateIds.push(localLead.id);
    } else {
      // Cloud newer, equal, or timestamps uncomparable → never blind-overwrite.
      cloudPreservedIds.push(localLead.id);
    }
  }

  return {
    toUpload,
    insertIds,
    updateIds,
    cloudPreservedIds,
    localCount: local.length,
    cloudCount: cloud.length,
  };
}
