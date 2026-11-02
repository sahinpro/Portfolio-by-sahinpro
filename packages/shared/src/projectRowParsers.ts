import type {
  ProjectCaseStudy,
  ProjectMetric,
  ProjectRow,
  ProjectTestimonial,
} from "./types/database";

/**
 * Supabase row → UI value parsers for projects.
 *
 * Extracted from the CMS form mappers because both the public website and the
 * admin dashboard read these same `projects` rows. Pure functions only — no
 * form schemas, no auth, no environment access.
 */

export function parseStats(raw: unknown): { label: string; value: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (x): x is { label: string; value: string } =>
        typeof x === "object" &&
        x !== null &&
        "label" in x &&
        "value" in x &&
        typeof (x as { label: unknown }).label === "string" &&
        typeof (x as { value: unknown }).value === "string",
    )
    .map((x) => ({ label: x.label, value: x.value }));
}

export function parseExtensions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

export function parseScreenshotUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0,
  );
}

export function readTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseMetrics(raw: unknown): ProjectMetric[] {
  return parseStats(raw)
    .map((item) => ({ label: item.label.trim(), value: item.value.trim() }))
    .filter((item) => item.label.length > 0 || item.value.length > 0);
}

export function parseCaseStudy(raw: unknown): ProjectCaseStudy | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const problem = readTrimmedString(obj.problem);
  const solution = readTrimmedString(obj.solution);
  const result = readTrimmedString(obj.result);
  if (!problem && !solution && !result) return null;
  return { problem, solution, result };
}

/** Column values win. JSON is only a fallback for rows saved before the columns existed. */
export function caseStudyTextsFromRow(
  row: Pick<ProjectRow, "problem" | "solution" | "result" | "case_study">,
): ProjectCaseStudy | null {
  const legacy = parseCaseStudy(row.case_study);
  const problem = readTrimmedString(row.problem) || legacy?.problem || "";
  const solution = readTrimmedString(row.solution) || legacy?.solution || "";
  const result = readTrimmedString(row.result) || legacy?.result || "";
  if (!problem && !solution && !result) return null;
  return { problem, solution, result };
}

function legacyCaseStudyRecord(
  raw: ProjectRow["case_study"],
): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

export function metricsFromRow(row: ProjectRow): ProjectMetric[] {
  const fromColumn = parseMetrics(row.metrics);
  if (fromColumn.length > 0) return fromColumn;
  const legacy = legacyCaseStudyRecord(row.case_study);
  return legacy ? parseMetrics(legacy.metrics) : [];
}

export function caseStudyImageFromRow(
  column: string | null | undefined,
  legacyKey: "before_image" | "after_image",
  row: ProjectRow,
): string | null {
  const fromColumn = readTrimmedString(column);
  if (fromColumn) return fromColumn;
  const legacy = legacyCaseStudyRecord(row.case_study);
  const fromLegacy = legacy ? readTrimmedString(legacy[legacyKey]) : "";
  return fromLegacy || null;
}

export function parseTestimonial(raw: unknown): ProjectTestimonial | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const quote = readTrimmedString(obj.quote);
  const client_name = readTrimmedString(obj.client_name);
  const client_role = readTrimmedString(obj.client_role);
  const client_photo =
    readTrimmedString(obj.client_photo) || readTrimmedString(obj.client_avatar);
  if (!quote) return null;
  return {
    quote,
    client_name,
    ...(client_role ? { client_role } : {}),
    ...(client_photo ? { client_photo } : {}),
  };
}
