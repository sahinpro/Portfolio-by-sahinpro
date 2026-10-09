import {
  parseCaseStudy,
  parseScreenshotUrls,
  parseTestimonial,
} from "@/admin/lib/projectMappers";
import type {
  ProjectCaseStudy,
  ProjectRow,
  TestimonialRow,
} from "@/admin/types/database";
import { PROJECT_IMAGE_PLACEHOLDER } from "@/constants/placeholders";
import { projectSlugFromTitle } from "@/lib/projectPaths";

export type PublicCaseStudy = ProjectCaseStudy;

export type PublicTestimonial = {
  id?: string;
  quote: string;
  clientName: string;
  clientRole?: string;
  clientPhoto?: string;
};

/** Shape used by `ProjectsPage` cards (public site). */
export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  roleLabel: string | null;
  caseStudy: PublicCaseStudy | null;
  testimonial: PublicTestimonial | null;
  image: string;
  technologies: string[];
  category: string;
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  updatedAt: string;
  year?: string;
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
  return raw.filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0,
  );
}

export function mapTestimonial(raw: unknown): PublicTestimonial | null {
  const parsed = parseTestimonial(raw);
  if (!parsed) return null;
  const id =
    raw && typeof raw === "object" && "id" in raw && typeof raw.id === "string"
      ? raw.id
      : undefined;
  return {
    ...(id ? { id } : {}),
    quote: parsed.quote,
    clientName: parsed.client_name,
    ...(parsed.client_role ? { clientRole: parsed.client_role } : {}),
    ...(parsed.client_photo ? { clientPhoto: parsed.client_photo } : {}),
  };
}

export function mapTestimonialRowToPublic(
  row: TestimonialRow,
): PublicTestimonial | null {
  return mapTestimonial(row);
}

export function mapProjectRowToPublic(row: ProjectRow): PublicProject {
  return {
    id: row.id,
    slug: projectSlugFromTitle(row.title),
    title: row.title,
    description: row.description ?? "",
    roleLabel: row.role_label?.trim() ? row.role_label.trim() : null,
    caseStudy: parseCaseStudy(row.case_study),
    testimonial: mapTestimonial(row.testimonial),
    image: row.image_url?.trim() ? row.image_url : PROJECT_IMAGE_PLACEHOLDER,
    technologies: row.technologies ?? [],
    category: row.category || "Web Development",
    liveUrl: row.live_url,
    githubUrl: row.github_url,
    featured: row.featured,
    updatedAt: row.updated_at,
  };
}

export function mapProjectRowToPublicDetail(
  row: ProjectRow,
): PublicProjectDetail {
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
    cmsExtensions:
      row.build_kind === "cms" ? parseCmsExtensions(row.cms_extensions) : [],
  };
}
