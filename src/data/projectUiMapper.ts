import { parseScreenshotUrls, parseStats } from "@/admin/lib/projectMappers";
import type { ProjectRow } from "@/admin/types/database";
import { PROJECT_IMAGE_PLACEHOLDER } from "@/constants/placeholders";

/** Shape used by `ProjectsPage` cards (public site). */
export type PublicProject = {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  technologies: string[];
  category: string;
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  year?: string;
  stats?: { label: string; value: string }[];
};

export type PublicFrameworkSlug = ProjectRow["custom_framework"];

/** Extra fields for the project detail page (build / CMS metadata). */
export type PublicProjectDetail = PublicProject & {
  screenshots: string[];
  buildKind: "custom" | "cms";
  customFramework: PublicFrameworkSlug;
  customFrameworkLabel: string | null;
  stackDetails: { label: string; value: string }[];
  cmsPlatform: ProjectRow["cms_platform"];
  cmsThemeName: string | null;
  cmsExtensions: string[];
};

function parseCmsExtensions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

export function mapProjectRowToPublic(row: ProjectRow): PublicProject {
  const stats = parseStats(row.stats);
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    longDescription: row.long_description ?? undefined,
    image: row.image_url?.trim() ? row.image_url : PROJECT_IMAGE_PLACEHOLDER,
    technologies: row.technologies ?? [],
    category: row.category || "Web Development",
    liveUrl: row.live_url,
    githubUrl: row.github_url,
    featured: row.featured,
    year: row.year ?? undefined,
    stats: stats.length ? stats : undefined,
  };
}

export function mapProjectRowToPublicDetail(row: ProjectRow): PublicProjectDetail {
  const base = mapProjectRowToPublic(row);
  const shots = parseScreenshotUrls(row.screenshot_urls);

  return {
    ...base,
    screenshots: shots,
    buildKind: row.build_kind,
    customFramework: row.custom_framework ?? null,
    customFrameworkLabel: row.custom_framework_label ?? null,
    stackDetails: [],
    cmsPlatform: row.cms_platform ?? null,
    cmsThemeName: row.cms_theme_name?.trim() ? row.cms_theme_name : null,
    cmsExtensions: row.build_kind === "cms" ? parseCmsExtensions(row.cms_extensions) : [],
  };
}
