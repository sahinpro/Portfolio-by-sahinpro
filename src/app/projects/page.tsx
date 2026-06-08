import { ProjectsPage } from "@/views/ProjectsPage";
import { buildPublicMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return buildPublicMetadata("/projects", "/projects");
}

export default function Page() {
  return <ProjectsPage />;
}
