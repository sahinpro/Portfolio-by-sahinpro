import type { PublicProject } from "@/data/projectUiMapper";

export function featuredProjectPointerHint(
  project: PublicProject,
  xRatio: number,
  yRatio: number,
): string {
  if (yRatio > 0.82) {
    if (project.liveUrl) return "Open live demo";
    if (project.githubUrl) return "View source on GitHub";
    return "Featured case study";
  }

  if (xRatio < 0.45 && yRatio < 0.62) {
    return `${project.title} · ${project.category}`;
  }

  if (project.technologies.length > 0) {
    return project.technologies.slice(0, 3).join(" · ");
  }

  return project.title;
}
