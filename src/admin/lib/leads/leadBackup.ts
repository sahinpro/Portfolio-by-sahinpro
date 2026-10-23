import { buildNormalizedKey } from "@/admin/lib/leads/normalize";
import { leadRecordSchema } from "@/admin/schemas/leadFormSchema";
import type { Lead, LeadBackupFile } from "@/admin/types/lead";

/** Local backup / restore helpers. Nothing leaves the browser except as a
 * file the user explicitly downloads or selects. */

const APP_ID = "portfolio-admin-lead-crm";
const BACKUP_VERSION = 1;

export function buildBackup(leads: Lead[]): LeadBackupFile {
  return {
    app: APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    count: leads.length,
    leads,
  };
}

/** Trigger a client-side file download (no server involved). */
function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function timestampSlug(): string {
  return new Date().toISOString().slice(0, 10);
}

export function exportLeadsJson(leads: Lead[]): void {
  const backup = buildBackup(leads);
  downloadFile(
    `leads-backup-${timestampSlug()}.json`,
    JSON.stringify(backup, null, 2),
    "application/json",
  );
}

const CSV_COLUMNS: { header: string; value: (lead: Lead) => string }[] = [
  { header: "Business Name", value: (l) => l.businessName },
  { header: "Niche", value: (l) => l.niche },
  { header: "Country", value: (l) => l.country },
  { header: "City / Service Area", value: (l) => l.city },
  { header: "Website URL", value: (l) => l.websiteUrl },
  { header: "Website Status", value: (l) => l.websiteStatus },
  { header: "Lead Source", value: (l) => l.leadSource },
  { header: "Contact Person", value: (l) => l.contactPerson },
  { header: "Email", value: (l) => l.email },
  { header: "Phone / WhatsApp", value: (l) => l.phone },
  { header: "Instagram URL", value: (l) => l.instagramUrl },
  { header: "Facebook URL", value: (l) => l.facebookUrl },
  { header: "Preferred Contact", value: (l) => l.preferredContactMethod },
  { header: "Outreach Status", value: (l) => l.outreachStatus },
  { header: "First Contact", value: (l) => l.firstContactDate },
  { header: "Last Contact", value: (l) => l.lastContactDate },
  { header: "Follow-up Date", value: (l) => l.followUpDate },
  { header: "Follow-up Count", value: (l) => String(l.followUpCount ?? 0) },
  { header: "Priority", value: (l) => l.priority },
  { header: "Project Status", value: (l) => l.projectStatus },
  { header: "Opportunity", value: (l) => l.opportunity },
  { header: "Improvements", value: (l) => l.improvements },
  { header: "Est. Budget", value: (l) => l.estBudget },
  { header: "Expected Value", value: (l) => l.expectedValue },
  { header: "Notes", value: (l) => l.notes },
  { header: "Created At", value: (l) => l.createdAt },
  { header: "Updated At", value: (l) => l.updatedAt },
];

function csvCell(value: string): string {
  const v = value ?? "";
  if (/[",\n\r]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function leadsToCsv(leads: Lead[]): string {
  const header = CSV_COLUMNS.map((c) => csvCell(c.header)).join(",");
  const rows = leads.map((lead) =>
    CSV_COLUMNS.map((c) => csvCell(c.value(lead))).join(","),
  );
  return [header, ...rows].join("\r\n");
}

export function exportLeadsCsv(leads: Lead[]): void {
  downloadFile(
    `leads-export-${timestampSlug()}.csv`,
    leadsToCsv(leads),
    "text/csv;charset=utf-8",
  );
}

export type ImportResult =
  | { ok: true; leads: Lead[] }
  | { ok: false; message: string };

function finalizeLead(parsed: Lead): Lead {
  const now = new Date().toISOString();
  const normalizedKey =
    parsed.normalizedKey ||
    buildNormalizedKey({
      websiteUrl: parsed.websiteUrl,
      email: parsed.email,
      instagramUrl: parsed.instagramUrl,
      facebookUrl: parsed.facebookUrl,
    });
  return {
    ...parsed,
    normalizedKey,
    createdAt: parsed.createdAt || now,
    updatedAt: parsed.updatedAt || now,
  };
}

/** Validate and normalize raw backup JSON text into typed leads. */
export function parseBackup(text: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, message: "That file is not valid JSON." };
  }

  let rawLeads: unknown;
  if (Array.isArray(data)) {
    rawLeads = data;
  } else if (data && typeof data === "object") {
    const envelope = data as Partial<LeadBackupFile>;
    if (envelope.app && envelope.app !== APP_ID) {
      return {
        ok: false,
        message:
          "This backup was not created by the Leads CRM and cannot be imported.",
      };
    }
    if (
      typeof envelope.version === "number" &&
      envelope.version !== BACKUP_VERSION
    ) {
      return {
        ok: false,
        message: `Unsupported backup version (${envelope.version}). This app expects version ${BACKUP_VERSION}.`,
      };
    }
    if (!Array.isArray(envelope.leads)) {
      return {
        ok: false,
        message: "Backup file is missing a valid 'leads' array.",
      };
    }
    rawLeads = envelope.leads;
  } else {
    return { ok: false, message: "Unrecognized backup file format." };
  }

  const leads: Lead[] = [];
  let firstError = "";
  for (const item of rawLeads as unknown[]) {
    const result = leadRecordSchema.safeParse(item);
    if (!result.success) {
      if (!firstError) {
        const issue = result.error.issues[0];
        const path = issue?.path?.join(".") ?? "";
        firstError = issue ? `${path ? path + ": " : ""}${issue.message}` : "";
      }
      continue;
    }
    leads.push(finalizeLead(result.data as Lead));
  }

  if (leads.length === 0) {
    return {
      ok: false,
      message: firstError
        ? `No valid leads found in the backup. First problem: ${firstError}`
        : "No valid leads found in the backup.",
    };
  }

  if (firstError) {
    return {
      ok: false,
      message: `The backup contains invalid records (first problem: ${firstError}). Fix the file and try again — nothing was imported.`,
    };
  }

  return { ok: true, leads };
}

export type MergeOutcome = {
  result: Lead[];
  added: number;
  updated: number;
  keptExistingNewer: number;
};

/**
 * Merge incoming leads into the existing set by id, never overwriting a record
 * that is newer than the incoming one. Records with an unknown id are added.
 */
export function mergeLeadsById(
  existing: Lead[],
  incoming: Lead[],
): MergeOutcome {
  const byId = new Map(existing.map((lead) => [lead.id, lead]));
  let added = 0;
  let updated = 0;
  let keptExistingNewer = 0;

  for (const lead of incoming) {
    const current = byId.get(lead.id);
    if (!current) {
      byId.set(lead.id, lead);
      added += 1;
      continue;
    }
    if ((lead.updatedAt ?? "") > (current.updatedAt ?? "")) {
      byId.set(lead.id, lead);
      updated += 1;
    } else {
      keptExistingNewer += 1;
    }
  }

  return {
    result: [...byId.values()],
    added,
    updated,
    keptExistingNewer,
  };
}
