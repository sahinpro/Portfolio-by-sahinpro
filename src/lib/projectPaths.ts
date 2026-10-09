import { slugify } from "@/admin/lib/slug";

export function projectSlugFromTitle(title: string): string {
  return slugify(title);
}

export function projectHref(slug: string): string {
  return `/projects/${slug}`;
}

export function findProjectBySlug<T extends { slug: string }>(
  projects: T[],
  slug: string,
): T | undefined {
  return projects.find((project) => project.slug === slug);
}
