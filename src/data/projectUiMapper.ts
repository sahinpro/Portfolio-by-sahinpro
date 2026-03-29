import { parseStats } from "@/admin/lib/projectMappers";
import type { ProjectRow } from "@/admin/types/database";

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

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80";

export function mapProjectRowToPublic(row: ProjectRow): PublicProject {
  const stats = parseStats(row.stats);
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    longDescription: row.long_description ?? undefined,
    image: row.image_url?.trim() ? row.image_url : PLACEHOLDER_IMG,
    technologies: row.technologies ?? [],
    category: row.category || "Frontend",
    liveUrl: row.live_url,
    githubUrl: row.github_url,
    featured: row.featured,
    year: row.year ?? undefined,
    stats: stats.length ? stats : undefined,
  };
}
