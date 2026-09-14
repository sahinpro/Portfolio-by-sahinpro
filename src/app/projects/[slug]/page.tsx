import { fetchPublishedProjects } from "@/data/publicSupabase.server";
import {
  mapProjectRowToPublicDetail,
  type PublicProjectDetail,
} from "@/data/projectUiMapper";
import { PROFILE } from "@/constants/profile";
import { canonicalPath } from "@/constants/site";
import { sortProjectsByUpdatedDesc } from "@/lib/projectSort";
import { findProjectBySlug } from "@/lib/projectPaths";
import { projectImageAlt } from "@/lib/seoImages";
import { ogImageMimeType } from "@/lib/resolveOgImage";
import { ProjectDetailPage } from "@/views/ProjectDetailPage";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function loadPublishedProjects(): Promise<PublicProjectDetail[]> {
  try {
    const rows = await fetchPublishedProjects();
    return sortProjectsByUpdatedDesc(rows.map(mapProjectRowToPublicDetail));
  } catch {
    return [];
  }
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const projects = await loadPublishedProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const projects = await loadPublishedProjects();
  const project = findProjectBySlug(projects, slug);

  if (!project) {
    return {
      title: { absolute: `Project not found | ${PROFILE.name}` },
      robots: { index: false, follow: false },
    };
  }

  const description =
    project.caseStudy?.result?.trim() ||
    project.description.trim() ||
    `${project.title} — case study by ${PROFILE.name}`;
  const title = `${project.title} | ${PROFILE.name} — Case Study`;
  const canonical = canonicalPath(`/projects/${project.slug}`);
  const imageAlt = projectImageAlt(project.title);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      siteName: PROFILE.name,
      locale: "en_US",
      url: canonical,
      title,
      description,
      images: [
        {
          url: project.image,
          alt: imageAlt,
          type: ogImageMimeType(project.image),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [project.image],
    },
  };
}

export default async function Page({ params }: PageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const projects = await loadPublishedProjects();
  const project = findProjectBySlug(projects, slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = projects
    .filter((item) => item.id !== project.id)
    .slice(0, 2);

  return (
    <ProjectDetailPage project={project} relatedProjects={relatedProjects} />
  );
}
