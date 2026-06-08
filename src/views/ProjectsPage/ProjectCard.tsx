"use client";

import type { PublicProject } from "@/data/projectUiMapper";
import { projectDetailPath } from "@/lib/projectPaths";
import { motion } from "framer-motion";
import { ExternalLink, EyeIcon, Github, Star } from "lucide-react";
import Link from "next/link";

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
  project: PublicProject;
  index?: number;
  /** Skip scroll-triggered entrance (e.g. homepage section with parent motion). */
  animateOnView?: boolean;
}

export const ProjectCard = ({
  project,
  index = 0,
  animateOnView = true,
}: ProjectCardProps): JSX.Element => {
  const techPreview = project.technologies.slice(0, 4).join(" · ");

  const card = (
    <div
      className="group relative h-[22rem] overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#111]
        transition-[border-color] duration-300 hover:border-white/[0.12]"
    >
      <Link
        href={projectDetailPath(project)}
        className="absolute inset-0 z-0 block"
      >
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
      </Link>

      {project.featured ? (
        <div
          className="absolute top-4 left-4 z-[4] flex items-center gap-1.5 px-3 py-1 rounded-full
            bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold pointer-events-none"
        >
          <Star className="w-3 h-3 fill-current" aria-hidden />
          Featured
        </div>
      ) : null}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[52%] bg-gradient-to-t
          from-[rgba(10,14,20,0.82)] via-[rgba(10,14,20,0.55)] via-45% to-transparent"
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[300px] bg-gradient-to-t
          from-white/[0.06] via-white/[0.03] via-50% to-transparent"
        style={{
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          maskImage: projectCardGlassMask,
          WebkitMaskImage: projectCardGlassMask,
        }}
      />

      <div className="pointer-events-none absolute inset-[7px] z-[2] rounded-[1.35rem] border border-white/10" />

      <div className="absolute inset-x-0 bottom-0 z-[3] px-5 pb-5">
        <Link
          href={projectDetailPath(project)}
          className="group/cardtitle block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00BB7D]/50 rounded-sm"
        >
          <h3 className="text-[1.45rem] font-bold leading-tight text-white transition-colors group-hover/cardtitle:text-white/95">
            {project.title}
          </h3>
        </Link>

        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00BB7D]">
          {project.category}
          {project.year ? ` · ${project.year}` : ""}
        </p>

        <Link
          href={projectDetailPath(project)}
          className="mt-2.5 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00BB7D]/50 rounded-sm"
        >
          <p className="text-[13px] leading-relaxed text-white/55 line-clamp-2 transition-colors hover:text-white/65">
            {project.description}
          </p>
        </Link>

        {techPreview ? (
          <p className="mt-1.5 text-[11px] leading-snug text-white/35 line-clamp-1">
            {techPreview}
            {project.technologies.length > 4
              ? ` +${project.technologies.length - 4}`
              : ""}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={projectDetailPath(project)}
            className="flex-1 min-w-[6.5rem] inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
              bg-amber-600/30 border border-amber-400/20 text-xs font-semibold text-amber-300/90
              hover:bg-amber-800/40 hover:border-amber-400/30 transition-all duration-200"
          >
            Details
            <EyeIcon className="w-3.5 h-3.5 shrink-0" />
          </Link>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[6.5rem] inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
                bg-white/[0.06] border border-white/10 text-xs font-semibold text-white/60
                hover:text-white hover:bg-white/10 hover:border-white/15 transition-all duration-200"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              Live
            </a>
          ) : null}
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[6.5rem] inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
                bg-white/[0.06] border border-white/10 text-xs font-semibold text-white/60
                hover:text-white hover:bg-white/10 hover:border-white/15 transition-all duration-200"
            >
              <Github className="w-3.5 h-3.5 shrink-0" />
              Code
            </a>
          ) : null}
        </div>
      </div>
    </div>
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
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
    >
      {card}
    </motion.div>
  );
};

export type { PublicProject as Project };
