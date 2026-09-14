import { HomePage } from "@/views/HomePage";
import { fetchPublishedProjects, fetchTestimonials } from "@/data/publicSupabase.server";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata("/", "/");
export const revalidate = 3600;

export default async function Page() {
  let initialProjects: Awaited<ReturnType<typeof fetchPublishedProjects>> = [];
  let initialTestimonials: Awaited<ReturnType<typeof fetchTestimonials>> = [];
  try {
    initialProjects = await fetchPublishedProjects();
  } catch {
    initialProjects = [];
  }
  try {
    initialTestimonials = await fetchTestimonials();
  } catch {
    initialTestimonials = [];
  }
  return (
    <HomePage
      initialProjects={initialProjects}
      initialTestimonials={initialTestimonials}
    />
  );
}
