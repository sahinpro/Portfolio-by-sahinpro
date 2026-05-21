import { slugify } from "@/admin/lib/slug";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function projectSlugFromTitle(title: string): string {
  return slugify(title);
}

export function projectDetailPath(
  project: { slug: string } | { title: string },
): string {
  const slug =
    "slug" in project ? project.slug : projectSlugFromTitle(project.title);
  return `/projects/${slug}`;
}

export function isLegacyProjectIdParam(param: string): boolean {
  return UUID_RE.test(param);
}
