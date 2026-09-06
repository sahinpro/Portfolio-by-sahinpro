import { ProjectsPage } from "@/views/ProjectsPage";
import { fetchPublishedProjects } from "@/data/publicSupabase.server";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata("/projects", "/projects");
export const revalidate = 3600;

export default async function Page() {
  let initialProjects: Awaited<ReturnType<typeof fetchPublishedProjects>> = [];
  try {
    initialProjects = await fetchPublishedProjects();
  } catch {
    initialProjects = [];
  }
  return <ProjectsPage initialProjects={initialProjects} />;
}
