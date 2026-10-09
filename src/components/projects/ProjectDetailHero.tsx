"use client";

import { ProjectImageGallery } from "@/components/projects/ProjectImageGallery";
import { PublicImage } from "@/components/ui/PublicImage";
import type { PublicProjectDetail } from "@/data/projectUiMapper";
import { projectImageAlt } from "@/lib/seoImages";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export interface ProjectDetailHeroProps {
  project: PublicProjectDetail;
  galleryReady?: boolean;
}

export function ProjectDetailHero({
  project,
  galleryReady = false,
}: ProjectDetailHeroProps): JSX.Element {
  const hasGallery = project.screenshots.length > 0;

  return (
    <div className="relative w-full shrink-0 overflow-hidden bg-[#111]">
      <PublicImage
        src={project.image}
        alt={projectImageAlt(project.title)}
        width={1920}
        height={1200}
        sizes="(max-width: 768px) 100vw, 1120px"
        className={cn(
          "block h-auto w-full",
          galleryReady && hasGallery && "opacity-0",
        )}
        style={{ width: "100%", height: "auto", aspectRatio: "auto" }}
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
    </div>
  );
}
