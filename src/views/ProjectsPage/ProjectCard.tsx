"use client";

import { ProjectCardTeaser } from "@/components/projects/ProjectCardTeaser";
import { PublicImage } from "@/components/ui/PublicImage";
import { fadeUp, itemStagger, scrollViewport } from "@/constants/scrollMotion";
import type { PublicProjectDetail } from "@/data/projectUiMapper";
import { useIsMobile } from "@/hooks/useIsMobile";
import { projectCategoryLine } from "@/lib/projectMeta";
import { projectHref } from "@/lib/projectPaths";
import { projectImageAlt } from "@/lib/seoImages";
import { cn } from "@/lib/utils";
import {
  projectCardInnerFrame,
  projectCardShell,
} from "@/views/ProjectsPage/projectModalStyles";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Link from "next/link";

export interface ProjectCardProps {
  project: PublicProjectDetail;
  index?: number;
  animateOnView?: boolean;
}

export const ProjectCard = ({
  project,
  index = 0,
  animateOnView = true,
}: ProjectCardProps): JSX.Element => {
  const isMobile = useIsMobile();
  const categoryLine = projectCategoryLine(project);
  const techPreview = project.technologies.slice(0, 4).join(" · ");

  const card = (
    <Link
      href={projectHref(project.slug)}
      className={cn(
        projectCardShell,
        "group grid grid-cols-1 overflow-hidden sm:grid-cols-[minmax(11rem,42%)_minmax(0,1fr)]",
        "cursor-pointer transition-[border-color] duration-300 hover:border-white/[0.14]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]",
      )}
    >
      <div
        className={cn(
          projectCardInnerFrame,
          "z-[2] hidden sm:col-span-2 sm:block ",
        )}
        aria-hidden
      />
      <div className="relative h-auto w-full self-center overflow-hidden bg-[#111] aspect-[4/3.5]">
        <PublicImage
          src={project.image}
          alt={projectImageAlt(project.title)}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 40vw, 22vw"
          priority={index < 2}
          className="object-cover"
        />
        {project.featured ? (
          <div
            className="pointer-events-none absolute top-3 left-3 z-[4] flex items-center gap-1.5 rounded-full
              border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300"
          >
            <Star className="h-3 w-3 fill-current" aria-hidden />
            Featured
          </div>
        ) : null}
      </div>

      <div className="relative flex min-h-[10rem] lg:min-h-[13rem] flex-col">
        <ProjectCardTeaser
          className="relative z-[3] px-5 py-5 sm:px-6 sm:py-6"
          title={project.title}
          categoryLine={categoryLine}
          description={project.description}
          roleLabel={project.roleLabel}
          caseStudy={project.caseStudy}
          testimonial={project.testimonial}
          techPreview={techPreview}
          extraTechCount={Math.max(0, project.technologies.length - 4)}
        />
      </div>
    </Link>
  );

  if (!animateOnView || isMobile) {
    return card;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={scrollViewport}
      variants={fadeUp(index * itemStagger)}
    >
      {card}
    </motion.div>
  );
};

export type { PublicProjectDetail as Project };
