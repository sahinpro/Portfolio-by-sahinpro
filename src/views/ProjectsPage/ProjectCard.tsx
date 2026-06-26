"use client";

import { PublicImage } from "@/components/ui/PublicImage";
import type { PublicProjectDetail } from "@/data/projectUiMapper";
import { projectCategoryLine } from "@/lib/projectMeta";
import { projectImageAlt } from "@/lib/seoImages";
import { scrollViewport } from "@/constants/scrollMotion";
import { cn } from "@/lib/utils";
import { ProjectDetailModal } from "@/views/ProjectsPage/ProjectDetailModal";
import {
  morphGpuLayer,
  projectCardActionBtn,
  projectCardGlassBlur,
  projectCardGlassGradient,
  projectCardGlassMask,
  projectCardInnerFrame,
  projectCardShell,
} from "@/views/ProjectsPage/projectModalStyles";
import { useProjectMorphMotion } from "@/views/ProjectsPage/useProjectMorphMotion";
import { motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import {
  useCallback,
  useId,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

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
  const [active, setActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const uid = useId();
  const layoutKey = `${project.id}-${uid}`;
  const { transition, layoutId, useMorph, isMobile } =
    useProjectMorphMotion(layoutKey);
  const techPreview = project.technologies.slice(0, 4).join(" · ");
  const categoryLine = projectCategoryLine(project);

  const CardShell = useMorph ? motion.article : "article";
  const ImageShell = useMorph ? motion.div : "div";
  const ActionBtn = useMorph ? motion.button : "button";
  const TitleShell = useMorph ? motion.h3 : "h3";
  const CategoryShell = useMorph ? motion.p : "p";

  const morphProps = (
    id: "project-card" | "project-image" | "project-btn" | "project-title" | "project-category",
  ): ComponentPropsWithoutRef<typeof motion.article> =>
    useMorph
      ? { layoutId: layoutId(id), transition }
      : {};

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

      <CardShell
        {...morphProps("project-card")}
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
          projectCardShell,
          "group cursor-pointer transition-[border-color] duration-300 hover:border-white/[0.12]",
          active && "pointer-events-none",
          active && useMorph && morphGpuLayer,
          active && !useMorph && "invisible opacity-0",
        )}
      >
        <div className="relative h-[24rem] overflow-hidden">
          <ImageShell
            {...morphProps("project-image")}
            className="absolute inset-0"
          >
            <PublicImage
              src={project.image}
              alt={projectImageAlt(project.title)}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03] max-md:group-hover:scale-100"
            />
          </ImageShell>

          {project.featured ? (
            <div
              className="pointer-events-none absolute top-4 left-4 z-[4] flex items-center gap-1.5 rounded-full
                border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300"
            >
              <Star className="h-3 w-3 fill-current" aria-hidden />
              Featured
            </div>
          ) : null}

          <ActionBtn
            type="button"
            {...morphProps("project-btn")}
            aria-label={`Open ${project.title}`}
            onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              openModal();
            }}
            className={cn(projectCardActionBtn, "absolute top-4 right-4 z-[5]")}
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </ActionBtn>

          <div className={projectCardGlassGradient} />

          <div
            className={projectCardGlassBlur}
            style={{
              maskImage: projectCardGlassMask,
              WebkitMaskImage: projectCardGlassMask,
            }}
          />

          <div className={cn(projectCardInnerFrame, "z-[2]")} />

          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-[3] px-5 pb-5",
              active && useMorph && "opacity-0 transition-opacity duration-150",
            )}
          >
            <TitleShell
              {...morphProps("project-title")}
              className="text-[1.45rem] font-bold leading-tight text-white"
            >
              {project.title}
            </TitleShell>

            <CategoryShell
              {...morphProps("project-category")}
              className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00BB7D]"
            >
              {categoryLine}
            </CategoryShell>

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
      </CardShell>
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
