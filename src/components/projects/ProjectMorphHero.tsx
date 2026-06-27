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
  modalHeroHeight,
  projectHeroHeight,
} from "@/views/ProjectsPage/projectModalStyles";
import { Star } from "lucide-react";

export interface ProjectMorphHeroProps {
  project: PublicProjectDetail;
  galleryReady?: boolean;
  /** Card-only bottom glass fade for title legibility. */
  showCardGlass?: boolean;
  /** Card uses shorter preview frame; modal uses taller hero on desktop. */
  variant?: "card" | "modal";
  imageClassName?: string;
}

export function ProjectMorphHero({
  project,
  galleryReady = false,
  showCardGlass = false,
  variant = "card",
  imageClassName,
}: ProjectMorphHeroProps): JSX.Element {
  const hasGallery = project.screenshots.length > 0;
  const isModal = variant === "modal";
  const resolvedImageClassName =
    imageClassName ??
    (isModal
      ? "object-cover object-top"
      : "object-cover object-center");

  return (
    <div
      className={cn(
        "project-morph-hero",
        isModal ? modalHeroHeight : projectHeroHeight,
      )}
    >
      <PublicImage
        src={project.image}
        alt={projectImageAlt(project.title)}
        fill
        sizes={
          isModal
            ? "(max-width: 768px) 100vw, 768px"
            : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        }
        className={cn(
          resolvedImageClassName,
          galleryReady && hasGallery && "opacity-0",
        )}
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
