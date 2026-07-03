"use client";

import { ProjectCardTeaser } from "@/components/projects/ProjectCardTeaser";
import { ProjectMorphHero } from "@/components/projects/ProjectMorphHero";
import type { PublicProjectDetail } from "@/data/projectUiMapper";
import { projectCategoryLine } from "@/lib/projectMeta";
import { scrollViewport } from "@/constants/scrollMotion";
import { cn } from "@/lib/utils";
import { ProjectExpandedContent } from "@/views/ProjectsPage/ProjectExpandedContent";
import {
  projectCardActionBtn,
  projectCardInnerFrame,
  projectCardShell,
  modalShell,
} from "@/views/ProjectsPage/projectModalStyles";
import "@/views/ProjectsPage/projectModalMorph.css";
import { useProjectCssMorph } from "@/views/ProjectsPage/useProjectCssMorph";
import { useIsMobile } from "@/hooks/useIsMobile";
import { motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.37, 0.04, 0.29, 1.01] },
  },
});

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
  const shellRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [galleryReady, setGalleryReady] = useState(false);
  const isMobile = useIsMobile();

  const {
    phase,
    isOpen,
    dataOpen,
    scrollable,
    open,
    close,
    onShellTransitionEnd,
  } = useProjectCssMorph();

  const categoryLine = projectCategoryLine(project);
  const techPreview = project.technologies.slice(0, 4).join(" · ");
  const hasGallery = project.screenshots.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (phase === "idle" || !hasGallery) {
      setGalleryReady(false);
      return;
    }

    if (phase !== "open") {
      return;
    }

    const timer = window.setTimeout(() => setGalleryReady(true), 200);
    return () => window.clearTimeout(timer);
  }, [phase, hasGallery]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  const openModal = useCallback(
    (event?: ReactMouseEvent | ReactKeyboardEvent) => {
      event?.stopPropagation();
      if (!isOpen) open();
    },
    [isOpen, open],
  );

  const morphPanel =
    isOpen && mounted ? (
      <>
        <div
          className="project-morph-backdrop"
          data-visible={
            phase === "entering" || phase === "open" ? "true" : "false"
          }
          aria-hidden
          onClick={close}
        />
        <article
          ref={shellRef}
          role="dialog"
          aria-modal="true"
          aria-expanded={dataOpen}
          aria-labelledby={`project-modal-title-${project.id}`}
          className={cn("project-morph", modalShell)}
          data-phase={phase}
          data-scrollable={scrollable ? "true" : "false"}
          onTransitionEnd={onShellTransitionEnd}
        >
          <div className="project-morph-inner">
            <div className="relative shrink-0">
              <ProjectMorphHero
                project={project}
                galleryReady={galleryReady}
                variant="modal"
              />
              <div className={cn(projectCardInnerFrame, "z-20")} aria-hidden />

              <button
                type="button"
                aria-label={`Close ${project.title}`}
                className={cn(projectCardActionBtn, "project-morph-close")}
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                }}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="project-morph-body">
              <div className="px-5 pb-2 pt-4 sm:px-8 sm:pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00BB7D]">
                  {categoryLine}
                </p>
                <h3
                  id={`project-modal-title-${project.id}`}
                  className="mt-1 text-xl font-bold leading-tight text-white sm:text-3xl"
                >
                  {project.title}
                </h3>
              </div>
              <div className="px-5 pb-6 pt-2 sm:px-8 sm:pb-10">
                <ProjectExpandedContent project={project} />
              </div>
            </div>
          </div>
        </article>
      </>
    ) : null;

  const card = (
    <>
      {morphPanel ? createPortal(morphPanel, document.body) : null}

      <article
        role="button"
        tabIndex={isOpen ? -1 : 0}
        aria-expanded={isOpen}
        onClick={() => !isOpen && openModal()}
        onKeyDown={(e: ReactKeyboardEvent<HTMLElement>) => {
          if (isOpen) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openModal();
          }
        }}
        className={cn(
          projectCardShell,
          "group relative cursor-pointer transition-[border-color] duration-300 hover:border-white/[0.12]",
        )}
      >
        <ProjectMorphHero
          project={project}
          variant="card"
          showCardGlass
          imageClassName="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03] max-md:group-hover:scale-100"
        />

        <button
          type="button"
          aria-label={`Open ${project.title}`}
          onClick={openModal}
          className={cn(projectCardActionBtn, "absolute top-4 right-4 z-[5]")}
        >
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </button>

        <div className={cn(projectCardInnerFrame, "z-[2]")} aria-hidden />

        <ProjectCardTeaser
          className="absolute inset-x-0 bottom-0 z-[3] px-5 pb-5"
          title={project.title}
          categoryLine={categoryLine}
          description={project.description}
          techPreview={techPreview}
          extraTechCount={Math.max(0, project.technologies.length - 4)}
        />
      </article>
    </>
  );

  if (!animateOnView || isMobile) {
    return card;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={scrollViewport}
      variants={fadeUp(index * 0.08)}
    >
      {card}
    </motion.div>
  );
};

export type { PublicProjectDetail as Project };
