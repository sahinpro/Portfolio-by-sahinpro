import { ProjectDetailPage } from "@/views/ProjectDetailPage";
import { buildProjectMetadata } from "@/lib/metadata";
import { mapProjectRowToPublic } from "@/data/projectUiMapper";
import {
  fetchPublishedProjectBySlug,
  fetchPublishedProjectSlugs,
} from "@/data/publicSupabase.server";
import { isLegacyProjectIdParam, projectDetailPath } from "@/lib/projectPaths";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await fetchPublishedProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return buildProjectMetadata(slug);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const row = await fetchPublishedProjectBySlug(slug);
  if (row && isLegacyProjectIdParam(slug)) {
    redirect(projectDetailPath(mapProjectRowToPublic(row)));
  }
  return <ProjectDetailPage slug={slug} />;
}
