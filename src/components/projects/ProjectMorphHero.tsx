"use client";

import { ProjectImageGallery } from "@/components/projects/ProjectImageGallery";
import { PublicImage } from "@/components/ui/PublicImage";
import type { PublicProjectDetail } from "@/data/projectUiMapper";
import { projectImageAlt } from "@/lib/seoImages";
import { cn } from "@/lib/utils";
import {
  projectCardGlassBlur,
  projectCardGlassGradient,
  projectCardGlassMask,
  projectHeroHeight,
} from "@/views/ProjectsPage/projectModalStyles";
import { Star } from "lucide-react";

export interface ProjectMorphHeroProps {
  project: PublicProjectDetail;
  galleryReady?: boolean;
  /** Card-only bottom glass fade for title legibility. */
  showCardGlass?: boolean;
  imageClassName?: string;
}

export function ProjectMorphHero({
  project,
  galleryReady = false,
  showCardGlass = false,
  imageClassName = "object-cover object-center",
}: ProjectMorphHeroProps): JSX.Element {
  const hasGallery = project.screenshots.length > 0;

  return (
    <div className={cn("project-morph-hero", projectHeroHeight)}>
      <PublicImage
        src={project.image}
        alt={projectImageAlt(project.title)}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={cn(imageClassName, galleryReady && hasGallery && "opacity-0")}
        priority
      />

      {hasGallery && galleryReady ? (
        <div className="absolute inset-0">
          <ProjectImageGallery project={project} className="h-full" />
        </div>
      ) : null}

      {project.featured ? (
        <div
          className="pointer-events-none absolute top-4 left-4 z-[4] flex items-center gap-1.5 rounded-full
            border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300"
        >
          <Star className="h-3 w-3 fill-current" aria-hidden />
          Featured
        </div>
      ) : null}

      {showCardGlass ? (
        <>
          <div className={projectCardGlassGradient} />
          <div
            className={projectCardGlassBlur}
            style={{
              maskImage: projectCardGlassMask,
              WebkitMaskImage: projectCardGlassMask,
            }}
          />
        </>
      ) : null}
    </div>
  );
}
