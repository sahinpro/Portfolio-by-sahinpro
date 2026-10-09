import { fetchPublishedProjects } from "@/data/publicSupabase.server";
import {
  mapProjectRowToPublicDetail,
  type PublicProjectDetail,
} from "@/data/projectUiMapper";
import { PROFILE } from "@/constants/profile";
import { PROJECT_IMAGE_PLACEHOLDER } from "@/constants/placeholders";
import { canonicalPath } from "@/constants/site";
import { sortProjectsByUpdatedDesc } from "@/lib/projectSort";
import { findProjectBySlug } from "@/lib/projectPaths";
import { projectShareDescription } from "@/lib/projectMeta";
import { OG_IMAGE, projectImageAlt } from "@/lib/seoImages";
import { ogImageMimeType, resolveOgImageUrl } from "@/lib/resolveOgImage";
import { ProjectDetailPage } from "@/views/ProjectDetailPage";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Project pages replace the root Open Graph object, so never let that swap in the portrait. */
function metadataImage(
  imageUrl: string,
  title: string,
): { url: string; alt: string } {
  const custom =
    imageUrl && imageUrl !== PROJECT_IMAGE_PLACEHOLDER ? imageUrl : null;
  const url = resolveOgImageUrl(custom);
  const usesShareCard = url === OG_IMAGE.url;
  return {
    url,
    alt: usesShareCard ? OG_IMAGE.alt : projectImageAlt(title),
  };
}

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

  const description = projectShareDescription(project);
  const title = `${project.title} | ${PROFILE.name}`;
  const canonical = canonicalPath(`/projects/${project.slug}`);
  const shareImage = metadataImage(project.image, project.title);

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
          url: shareImage.url,
          alt: shareImage.alt,
          type: ogImageMimeType(shareImage.url),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: shareImage.url, alt: shareImage.alt }],
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
