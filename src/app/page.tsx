import { HomePage } from "@/views/HomePage";
import { fetchPublishedProjects } from "@/data/publicSupabase.server";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata("/", "/");
export const revalidate = 3600;

export default async function Page() {
  let initialProjects: Awaited<ReturnType<typeof fetchPublishedProjects>> = [];
  try {
    initialProjects = await fetchPublishedProjects();
  } catch {
    initialProjects = [];
  }
  return <HomePage initialProjects={initialProjects} />;
}
