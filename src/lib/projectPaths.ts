import { slugify } from "@/admin/lib/slug";

export function projectSlugFromTitle(title: string): string {
  return slugify(title);
}
