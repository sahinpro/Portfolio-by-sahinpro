"use client";

import { PublicImage } from "@/components/ui/PublicImage";
import type { PublicProjectDetail } from "@/data/projectUiMapper";
import { projectImageAlt } from "@/lib/seoImages";
import { cn } from "@/lib/utils";
import { ProjectExpandedContent } from "@/views/ProjectsPage/ProjectExpandedContent";
import {
  layoutSpring,
  modalHeroHeight,
  modalShell,
  projectCardActionBtn,
  projectCardInnerFrame,
} from "@/views/ProjectsPage/projectModalStyles";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Star, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";

const ProjectImageGallery = dynamic(
  () =>
    import("@/components/projects/ProjectImageGallery").then((m) => ({
      default: m.ProjectImageGallery,
    })),
  {
    ssr: false,
    loading: () => (
      <div className={`${modalHeroHeight} animate-pulse bg-white/[0.04]`} />
    ),
  },
);

export interface ProjectDetailModalProps {
  open: boolean;
  project: PublicProjectDetail;
  layoutKey: string;
  categoryLine: string;
  onClose: () => void;
  onExitComplete?: () => void;
}

export function ProjectDetailModal({
  open,
  project,
  layoutKey,
  categoryLine,
  onClose,
  onExitComplete,
}: ProjectDetailModalProps): JSX.Element {
  const modalRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const hasGallery = project.screenshots.length > 0;
  const transition = reduceMotion ? { duration: 0.2 } : layoutSpring;
  const layoutId = (id: string) =>
    reduceMotion ? undefined : `${id}-${layoutKey}`;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open, onClose]);

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[110] bg-black/50 max-md:backdrop-blur-sm md:backdrop-blur-xl"
            aria-hidden
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence onExitComplete={onExitComplete}>
        {open ? (
          <div
            key="modal-shell"
            className="pointer-events-none fixed inset-0 z-[120] grid place-items-center p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`project-modal-title-${project.id}`}
          >
            <motion.div
              layoutId={layoutId("project-card")}
              ref={modalRef}
              transition={transition}
              className={cn(
                "pointer-events-auto w-full max-w-3xl touch-pan-y",
                modalShell,
              )}
            >
              <div className={projectCardInnerFrame} aria-hidden />

              <motion.button
                type="button"
                layoutId={layoutId("project-btn")}
                transition={transition}
                aria-label={`Close ${project.title}`}
                onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  onClose();
                }}
                className={cn(
                  projectCardActionBtn,
                  "absolute top-4 right-4 z-30",
                )}
              >
                <X className="h-4 w-4" aria-hidden />
              </motion.button>

              <motion.div
                layoutId={layoutId("project-image")}
                transition={transition}
                className="relative shrink-0"
              >
                {hasGallery ? (
                  <ProjectImageGallery project={project} />
                ) : (
                  <div
                    className={`relative overflow-hidden ${modalHeroHeight}`}
                  >
                    <PublicImage
                      src={project.image}
                      alt={projectImageAlt(project.title)}
                      fill
                      sizes="(max-width: 768px) 100vw, 768px"
                      className="object-cover object-center"
                      priority
                    />
                  </div>
                )}
                {project.featured ? (
                  <div
                    className="absolute top-4 left-4 z-[4] flex items-center gap-1.5 rounded-full border border-amber-400/30
                      bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300"
                  >
                    <Star className="h-3 w-3 fill-current" aria-hidden />
                    Featured
                  </div>
                ) : null}
              </motion.div>

              <div
                className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]
                  [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="relative px-5 pb-2 pt-4 sm:px-8 sm:pt-6">
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#111] to-transparent"
                    aria-hidden
                  />
                  <motion.p
                    layoutId={layoutId("project-category")}
                    transition={transition}
                    className="relative text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00BB7D]"
                  >
                    {categoryLine}
                  </motion.p>
                  <motion.h3
                    layoutId={layoutId("project-title")}
                    id={`project-modal-title-${project.id}`}
                    transition={transition}
                    className="relative mt-1 text-xl font-bold leading-tight text-white sm:text-3xl"
                  >
                    {project.title}
                  </motion.h3>
                </div>

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{
                    duration: 0.3,
                    delay: reduceMotion ? 0 : 0.08,
                  }}
                  className="px-5 pb-6 pt-2 sm:px-8 sm:pb-10"
                >
                  <ProjectExpandedContent project={project} />
                </motion.div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
