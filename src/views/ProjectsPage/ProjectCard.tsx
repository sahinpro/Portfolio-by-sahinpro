"use client";

import { PublicImage } from "@/components/ui/PublicImage";
import type { PublicProjectDetail } from "@/data/projectUiMapper";
import { projectCategoryLine } from "@/lib/projectMeta";
import { projectImageAlt } from "@/lib/seoImages";
import { cn } from "@/lib/utils";
import { ProjectDetailModal } from "@/views/ProjectsPage/ProjectDetailModal";
import { layoutSpring } from "@/views/ProjectsPage/projectModalStyles";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import {
  useCallback,
  useId,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

const cardViewport = {
  once: true as const,
  amount: 0.08,
  margin: "80px 0px 80px 0px",
};

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.37, 0.04, 0.29, 1.01] },
  },
});

const projectCardGlassMask =
  "linear-gradient(to top, black 0%, black 55%, rgba(0, 0, 0, 0.6) 72%, transparent 100%)";

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
  const [active, setActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const uid = useId();
  const layoutKey = `${project.id}-${uid}`;
  const reduceMotion = useReducedMotion();
  const techPreview = project.technologies.slice(0, 4).join(" · ");
  const categoryLine = projectCategoryLine(project);

  const transition = reduceMotion ? { duration: 0.2 } : layoutSpring;
  const layoutId = (id: string) =>
    reduceMotion ? undefined : `${id}-${layoutKey}`;

  const openModal = useCallback(() => {
    setShowModal(true);
    setActive(true);
  }, []);

  const closeModal = useCallback(() => {
    setActive(false);
  }, []);

  const handleExitComplete = useCallback(() => {
    setShowModal(false);
  }, []);

  const card = (
    <>
      {showModal ? (
        <ProjectDetailModal
          open={active}
          project={project}
          layoutKey={layoutKey}
          categoryLine={categoryLine}
          onClose={closeModal}
          onExitComplete={handleExitComplete}
        />
      ) : null}

      <motion.article
        layoutId={layoutId("project-card")}
        transition={transition}
        role="button"
        tabIndex={active ? -1 : 0}
        aria-expanded={active}
        onClick={() => !active && openModal()}
        onKeyDown={(e: ReactKeyboardEvent<HTMLElement>) => {
          if (active) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openModal();
          }
        }}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#111]",
          "transition-[border-color] duration-300 hover:border-white/[0.12]",
          active && "pointer-events-none",
        )}
      >
        <div className="relative h-[22rem] overflow-hidden">
          <motion.div
            layoutId={layoutId("project-image")}
            transition={transition}
            className="absolute inset-0"
          >
            <PublicImage
              src={project.image}
              alt={projectImageAlt(project.title)}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03] max-md:group-hover:scale-100"
            />
          </motion.div>

          {project.featured ? (
            <div
              className="pointer-events-none absolute top-4 left-4 z-[4] flex items-center gap-1.5 rounded-full
                border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300"
            >
              <Star className="h-3 w-3 fill-current" aria-hidden />
              Featured
            </div>
          ) : null}

          <motion.button
            type="button"
            layoutId={layoutId("project-btn")}
            transition={transition}
            aria-label={`Open ${project.title}`}
            onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              openModal();
            }}
            className="absolute top-4 right-4 z-[5] flex h-9 w-9 items-center justify-center rounded-full
              border border-white/15 bg-black/45 text-white/80 backdrop-blur-sm transition-colors
              hover:border-white/25 hover:bg-black/60 hover:text-white"
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </motion.button>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[52%] bg-gradient-to-t
              from-[rgba(10,14,20,0.82)] via-[rgba(10,14,20,0.55)] via-45% to-transparent"
          />

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[300px] bg-gradient-to-t
              from-white/[0.06] via-white/[0.03] via-50% to-transparent max-md:backdrop-blur-md md:backdrop-blur-[22px]"
            style={{
              maskImage: projectCardGlassMask,
              WebkitMaskImage: projectCardGlassMask,
            }}
          />

          <div className="pointer-events-none absolute inset-[7px] z-[2] rounded-[1.35rem] border border-white/10" />

          <div className="absolute inset-x-0 bottom-0 z-[3] px-5 pb-5">
            <motion.h3
              layoutId={layoutId("project-title")}
              transition={transition}
              className="text-[1.45rem] font-bold leading-tight text-white"
            >
              {project.title}
            </motion.h3>

            <motion.p
              layoutId={layoutId("project-category")}
              transition={transition}
              className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00BB7D]"
            >
              {categoryLine}
            </motion.p>

            <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-white/55">
              {project.description}
            </p>

            {techPreview ? (
              <p className="mt-1.5 line-clamp-1 text-[11px] leading-snug text-white/35">
                {techPreview}
                {project.technologies.length > 4
                  ? ` +${project.technologies.length - 4}`
                  : ""}
              </p>
            ) : null}
          </div>
        </div>
      </motion.article>
    </>
  );

  if (!animateOnView) {
    return card;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={cardViewport}
      variants={fadeUp(index * 0.08)}
    >
      {card}
    </motion.div>
  );
};

export type { PublicProjectDetail as Project };
