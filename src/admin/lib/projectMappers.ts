import { PROJECT_CATEGORIES } from "@/admin/constants/frameworkFieldConfig";
import type { ProjectFormValues } from "@/admin/schemas/projectFormSchema";
import type { ProjectRow } from "@/admin/types/database";

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

  return {
    title: row.title === "Untitled project" ? "" : row.title,
    description: row.description ?? "",
    image_url: row.image_url ?? "",
    screenshot_urls: screenshots,
    technologies: row.technologies ?? [],
    category: normalizeCategory(row.category || "Web Development"),
    live_url: row.live_url ?? "",
    build_kind: row.build_kind,
    custom_framework: frameworkRowToFormValue(row),
    github_url: row.github_url ?? "",
    cms_platform: (row.cms_platform ?? "") as ProjectFormValues["cms_platform"],
    cms_theme_name: row.cms_theme_name ?? "",
    cms_extensions: extensions.length ? extensions : [""],
    featured: row.featured,
    status: row.status,
    sort_order: row.sort_order,
  };
}

export type ProjectPayloadOptions = {
  /** Preserve DB stats when the form no longer edits them */
  stats?: unknown;
};

export function formValuesToProjectPayload(
  values: ProjectFormValues,
  options?: ProjectPayloadOptions,
): Omit<ProjectRow, "id" | "created_at" | "updated_at"> {
  const screenshotClean = values.screenshot_urls
    .map((u) => u.trim())
    .filter(Boolean);
  const techClean = values.technologies.map((t) => t.trim()).filter(Boolean);
  const extClean = values.cms_extensions.map((e) => e.trim()).filter(Boolean);
  const desc = values.description.trim();

  const base = {
    title: values.title.trim() || "Untitled project",
    description: desc || null,
    image_url: values.image_url.trim() || null,
    screenshot_urls: screenshotClean,
    technologies: values.build_kind === "custom" ? techClean : [],
    category: formCategoryToDbStorage(values.category),
    live_url: values.live_url.trim() || null,
    featured: values.featured,
    status: values.status,
    sort_order: values.sort_order,
    stats: options?.stats ?? [],
  };

  if (values.build_kind === "custom") {
    return {
      ...base,
      build_kind: "custom" as const,
      github_url: values.github_url.trim() || null,
      custom_framework: formCustomFrameworkToDbStorage(values.custom_framework),
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
    cms_platform: values.cms_platform as ProjectRow["cms_platform"],
    cms_theme_name: values.cms_theme_name.trim() || null,
    cms_extensions: extClean.length ? extClean : null,
  };
}

export function defaultEmptyProjectForm(): ProjectFormValues {
  return {
    title: "",
    description: "",
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
    sort_order: 0,
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
  if (t(values.cms_theme_name) !== t(d.cms_theme_name)) return true;
  if (values.cms_extensions.length !== d.cms_extensions.length) return true;
  if (
    values.cms_extensions.some((x, i) => t(x) !== t(d.cms_extensions[i] ?? ""))
  )
    return true;
  if (values.featured !== d.featured) return true;
  if (values.status !== d.status) return true;
  if (values.sort_order !== d.sort_order) return true;
  return false;
}

/** Minimum validity for inserting a draft without full Zod validation (e.g. panel close). */
export function canLenientDraftInsert(values: ProjectFormValues): boolean {
  if (values.build_kind === "cms" && !values.cms_platform) return false;
  return true;
}
