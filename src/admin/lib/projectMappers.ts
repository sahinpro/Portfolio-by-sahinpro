import {
  categoriesForBuildKind,
  isFullStackFormCategory,
  PROJECT_CATEGORIES,
} from "@/admin/constants/frameworkFieldConfig";
import {
  hasCmsBuildFieldValues,
  hasCustomBuildFieldValues,
  stripInactiveBuildFields,
} from "@/admin/lib/buildKindFieldGuards";
import type { ProjectFormValues } from "@/admin/schemas/projectFormSchema";
import type {
  ProjectCaseStudy,
  ProjectMetric,
  ProjectRow,
  ProjectTestimonial,
} from "@/admin/types/database";

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

function parseExtensions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

export function parseScreenshotUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0,
  );
}

function readTrimmedString(value: unknown): string {
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
    readTrimmedString(obj.client_photo) ||
    readTrimmedString(obj.client_avatar);
  if (!quote) return null;
  return {
    quote,
    client_name,
    ...(client_role ? { client_role } : {}),
    ...(client_photo ? { client_photo } : {}),
  };
}

function caseStudyToPayload(
  values: ProjectFormValues["case_study"],
): ProjectCaseStudy | null {
  return parseCaseStudy(values);
}

const LEGACY_CATEGORY_MAP: Record<string, ProjectFormValues["category"]> = {
  "Full Stack": "Web Development",
  Frontend: "Front-end Web Design",
  CMS: "E-commerce",
};

function normalizeCategory(cat: string): ProjectFormValues["category"] {
  if ((PROJECT_CATEGORIES as readonly string[]).includes(cat)) {
    return cat as ProjectFormValues["category"];
  }
  if (LEGACY_CATEGORY_MAP[cat]) return LEGACY_CATEGORY_MAP[cat];
  return "Web Development";
}

/**
 * Persist categories using legacy bucket names so rows satisfy older CHECK constraints
 * (`Full Stack`, `Frontend`, `CMS`). The form always uses the new labels via `normalizeCategory` on read.
 * Note: `SaaS Platform` maps to `Full Stack` until the DB allows the new strings.
 */
export function formCategoryToDbStorage(
  cat: ProjectFormValues["category"],
): string {
  switch (cat) {
    case "Web Development":
      return "Full Stack";
    case "Front-end Web Design":
      return "Frontend";
    case "E-commerce":
      return "CMS";
    case "SaaS Platform":
      return "Full Stack";
    default:
      return "Full Stack";
  }
}

/** Persist framework slugs allowed by older CHECK constraints (`react`, `next`, `vue`, `other`). */
export function formCustomFrameworkToDbStorage(
  fw: ProjectFormValues["custom_framework"],
): NonNullable<ProjectRow["custom_framework"]> {
  switch (fw) {
    case "react_vanilla":
      return "react";
    case "vanilla_js":
      return "other";
    case "next":
      return "next";
    default:
      return "react";
  }
}

/** Map DB / legacy framework slugs to form enum */
export function frameworkRowToFormValue(
  row: ProjectRow,
): ProjectFormValues["custom_framework"] {
  const fw = row.custom_framework;
  if (!fw) return "";
  if (fw === "react_vanilla" || fw === "vanilla_js") return fw;
  if (fw === "next") return "next";
  if (fw === "react") return "react_vanilla";
  if (fw === "vue" || fw === "other") return "vanilla_js";
  return "";
}

export function projectRowToFormValues(row: ProjectRow): ProjectFormValues {
  const extensions = parseExtensions(row.cms_extensions);
  const screenshots = parseScreenshotUrls(row.screenshot_urls);
  let category = normalizeCategory(row.category || "Web Development");
  if (row.build_kind === "cms" && isFullStackFormCategory(category)) {
    category = categoriesForBuildKind("cms")[0];
  } else if (row.build_kind === "custom" && !isFullStackFormCategory(category)) {
    category = categoriesForBuildKind("custom")[0];
  }

  const caseStudy = caseStudyTextsFromRow(row);

  return stripInactiveBuildFields({
    title: row.title === "Untitled project" ? "" : row.title,
    description: row.description ?? "",
    role_label: row.role_label ?? "",
    case_study: {
      problem: caseStudy?.problem ?? "",
      solution: caseStudy?.solution ?? "",
      result: caseStudy?.result ?? "",
    },
    metrics: metricsFromRow(row),
    before_image: caseStudyImageFromRow(row.before_image, "before_image", row) ?? "",
    after_image: caseStudyImageFromRow(row.after_image, "after_image", row) ?? "",
    testimonial_quote: row.testimonial_quote ?? "",
    testimonial_author: row.testimonial_author ?? "",
    testimonial_role: row.testimonial_role ?? "",
    image_url: row.image_url ?? "",
    screenshot_urls: screenshots,
    technologies: row.build_kind === "custom" ? (row.technologies ?? []) : [],
    category,
    live_url: row.live_url ?? "",
    build_kind: row.build_kind,
    custom_framework:
      row.build_kind === "custom" ? frameworkRowToFormValue(row) : "",
    github_url: row.build_kind === "custom" ? (row.github_url ?? "") : "",
    cms_platform:
      row.build_kind === "cms"
        ? ((row.cms_platform ?? "") as ProjectFormValues["cms_platform"])
        : "",
    cms_theme_name: row.build_kind === "cms" ? (row.cms_theme_name ?? "") : "",
    cms_extensions:
      row.build_kind === "cms"
        ? extensions.length
          ? extensions
          : [""]
        : [""],
    featured: row.featured,
    status: row.status,
  });
}

export type ProjectPayloadOptions = {
  /** Preserve DB stats when the form no longer edits them */
  stats?: unknown;
};

export function formValuesToProjectPayload(
  values: ProjectFormValues,
  options?: ProjectPayloadOptions,
): Omit<ProjectRow, "id" | "created_at" | "updated_at"> {
  const activeValues = stripInactiveBuildFields(values);
  const screenshotClean = activeValues.screenshot_urls
    .map((u) => u.trim())
    .filter(Boolean);
  const techClean = activeValues.technologies.map((t) => t.trim()).filter(Boolean);
  const extClean = (activeValues.cms_extensions ?? [])
    .map((e) => (e ?? "").trim())
    .filter(Boolean);
  const desc = activeValues.description.trim();
  const metrics = parseMetrics(activeValues.metrics);

  const base = {
    title: activeValues.title.trim() || "Untitled project",
    description: desc || null,
    role_label: activeValues.role_label.trim() || null,
    problem: activeValues.case_study.problem.trim() || null,
    solution: activeValues.case_study.solution.trim() || null,
    result: activeValues.case_study.result.trim() || null,
    metrics,
    before_image: activeValues.before_image.trim() || null,
    after_image: activeValues.after_image.trim() || null,
    testimonial_quote: activeValues.testimonial_quote.trim() || null,
    testimonial_author: activeValues.testimonial_author.trim() || null,
    testimonial_role: activeValues.testimonial_role.trim() || null,
    case_study: caseStudyToPayload(activeValues.case_study),
    image_url: activeValues.image_url.trim() || null,
    screenshot_urls: screenshotClean,
    technologies: activeValues.build_kind === "custom" ? techClean : [],
    category: formCategoryToDbStorage(activeValues.category),
    live_url: activeValues.live_url.trim() || null,
    featured: activeValues.featured,
    status: activeValues.status,
    sort_order: 0,
    stats: options?.stats ?? [],
  };

  if (activeValues.build_kind === "custom") {
    return {
      ...base,
      build_kind: "custom" as const,
      github_url: activeValues.github_url.trim() || null,
      custom_framework: formCustomFrameworkToDbStorage(
        activeValues.custom_framework,
      ),
      custom_framework_label: null,
      custom_stack_facets: null,
      cms_platform: null,
      cms_theme_name: null,
      cms_extensions: null,
    };
  }

  return {
    ...base,
    build_kind: "cms" as const,
    github_url: null,
    custom_framework: null,
    custom_framework_label: null,
    custom_stack_facets: null,
    cms_platform: activeValues.cms_platform as ProjectRow["cms_platform"],
    cms_theme_name: (activeValues.cms_theme_name ?? "").trim() || null,
    cms_extensions: extClean.length ? extClean : null,
  };
}

export function defaultEmptyProjectForm(): ProjectFormValues {
  return {
    title: "",
    description: "",
    role_label: "",
    case_study: { problem: "", solution: "", result: "" },
    metrics: [],
    before_image: "",
    after_image: "",
    testimonial_quote: "",
    testimonial_author: "",
    testimonial_role: "",
    image_url: "",
    screenshot_urls: [],
    technologies: [],
    category: "Web Development",
    live_url: "",
    build_kind: "custom",
    custom_framework: "react_vanilla",
    github_url: "",
    cms_platform: "",
    cms_theme_name: "",
    cms_extensions: [""],
    featured: false,
    status: "draft",
  };
}

/** True when the new-project form differs from defaults (user entered something). */
export function shouldPersistNewProjectDraft(
  values: ProjectFormValues,
): boolean {
  const d = defaultEmptyProjectForm();
  const t = (s: string) => s.trim();
  if (t(values.title) !== t(d.title)) return true;
  if (t(values.description) !== t(d.description)) return true;
  if (t(values.role_label) !== t(d.role_label)) return true;
  if (t(values.case_study.problem) !== t(d.case_study.problem)) return true;
  if (t(values.case_study.solution) !== t(d.case_study.solution)) return true;
  if (t(values.case_study.result) !== t(d.case_study.result)) return true;
  if (values.metrics.length !== d.metrics.length) return true;
  if (
    values.metrics.some(
      (metric, i) =>
        t(metric.label) !== t(d.metrics[i]?.label ?? "") ||
        t(metric.value) !== t(d.metrics[i]?.value ?? ""),
    )
  )
    return true;
  if (t(values.before_image) !== t(d.before_image)) return true;
  if (t(values.after_image) !== t(d.after_image)) return true;
  if (t(values.testimonial_quote) !== t(d.testimonial_quote)) return true;
  if (t(values.testimonial_author) !== t(d.testimonial_author)) return true;
  if (t(values.testimonial_role) !== t(d.testimonial_role)) return true;
  if (t(values.image_url) !== t(d.image_url)) return true;
  if (values.screenshot_urls.length !== d.screenshot_urls.length) return true;
  if (
    values.screenshot_urls.some(
      (u, i) => t(u) !== t(d.screenshot_urls[i] ?? ""),
    )
  )
    return true;
  if (values.category !== d.category) return true;
  if (t(values.live_url) !== t(d.live_url)) return true;
  if (values.build_kind !== d.build_kind) return true;
  if (values.custom_framework !== d.custom_framework) return true;
  if (t(values.github_url) !== t(d.github_url)) return true;
  if (values.technologies.length !== d.technologies.length) return true;
  if (values.technologies.some((x, i) => t(x) !== t(d.technologies[i] ?? "")))
    return true;
  if (values.cms_platform !== d.cms_platform) return true;
  if (t(values.cms_theme_name ?? "") !== t(d.cms_theme_name ?? "")) return true;
  if ((values.cms_extensions ?? []).length !== (d.cms_extensions ?? []).length)
    return true;
  if (
    (values.cms_extensions ?? []).some(
      (x, i) => t(x ?? "") !== t((d.cms_extensions ?? [""])[i] ?? ""),
    )
  )
    return true;
  if (values.featured !== d.featured) return true;
  if (values.status !== d.status) return true;
  return false;
}

/** Minimum validity for inserting a draft without full Zod validation (e.g. panel close). */
export function canLenientDraftInsert(values: ProjectFormValues): boolean {
  if (values.build_kind === "cms") {
    if (!values.cms_platform) return false;
    if (isFullStackFormCategory(values.category)) return false;
    if (hasCustomBuildFieldValues(values)) return false;
  }
  if (values.build_kind === "custom") {
    if (!isFullStackFormCategory(values.category)) return false;
    if (hasCmsBuildFieldValues(values)) return false;
  }
  return true;
}
