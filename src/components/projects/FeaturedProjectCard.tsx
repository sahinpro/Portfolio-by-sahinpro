"use client";

import { featuredProjectPointerHint } from "@/components/projects/featuredProjectPointerHint";
import {
  CLAUDE_BRAND_COLOR,
  FollowerPointerCard,
} from "@/components/ui/following-pointer";
import { PublicImage } from "@/components/ui/PublicImage";
import { scrollViewport } from "@/constants/scrollMotion";
import type { PublicProject } from "@/data/projectUiMapper";
import { projectImageAlt } from "@/lib/seoImages";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ExternalLink, Github, Tag } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const categoryBadge: Record<string, string> = {
  "Web Development": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "E-commerce": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "SaaS Platform": "bg-sky-500/20 text-sky-300 border-sky-500/30",
  "Front-end Web Design": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Full Stack": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Frontend: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  CMS: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.37, 0.04, 0.29, 1.01] },
  },
});

export interface FeaturedProjectCardProps {
  project: PublicProject;
  index: number;
}

export const FeaturedProjectCard = ({
  project,
  index,
}: FeaturedProjectCardProps): JSX.Element => {
  const even = index % 2 === 0;
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [followPointer, setFollowPointer] = useState(false);
  const [pointerHint, setPointerHint] = useState(project.title);
  const hintRaf = useRef(0);
  const pendingHint = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPointerHint(project.title);
  }, [project.title]);

  useEffect(() => {
    if (reduceMotion) {
      setFollowPointer(false);
      return;
    }

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const noHover = window.matchMedia("(hover: none)").matches;
    setFollowPointer(!coarse && !noHover);
  }, [reduceMotion]);

  const handlePointerMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      pendingHint.current = { x: event.clientX, y: event.clientY };
      if (hintRaf.current) return;
      hintRaf.current = requestAnimationFrame(() => {
        hintRaf.current = 0;
        const node = cardRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const { x, y } = pendingHint.current;
        const xRatio = (x - rect.left) / rect.width;
        const yRatio = (y - rect.top) / rect.height;
        setPointerHint(featuredProjectPointerHint(project, xRatio, yRatio));
      });
    },
    [project],
  );

  useEffect(() => {
    return () => {
      if (hintRaf.current) cancelAnimationFrame(hintRaf.current);
    };
  }, []);

  const card = (
    <div
      ref={cardRef}
      onMouseMove={followPointer ? handlePointerMove : undefined}
      className="group relative grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-white/[0.08]
        bg-gradient-to-br from-white/[0.03] to-transparent transition-[border-color] duration-500
        hover:border-white/[0.14] lg:grid-cols-2"
    >
      <div
        className={`relative aspect-auto h-[280px] overflow-hidden sm:h-[360px] lg:h-[480px] ${even ? "lg:order-1" : "lg:order-2"}`}
      >
        <PublicImage
          src={project.image}
          alt={projectImageAlt(project.title)}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-[#050505] via-transparent to-transparent lg:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent lg:hidden" />
      </div>

      <div
        className={`flex flex-col justify-center p-6 sm:p-8 md:p-10 ${even ? "lg:order-2" : "lg:order-1"}`}
      >
        <div className="mb-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold
              ${categoryBadge[project.category] ?? "border-white/10 bg-white/10 text-zinc-400"}`}
          >
            <Tag className="h-3 w-3" aria-hidden />
            {project.category}
          </span>
          {project.year ? (
            <span className="text-xs text-zinc-400">{project.year}</span>
          ) : null}
        </div>

        <h3 className="mb-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
          {project.title}
        </h3>
        <p className="mb-6 line-clamp-4 leading-relaxed text-zinc-300">
          {project.description}
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {project.technologies.map((t) => (
            <span
              key={t}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/60"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/15
              px-4 py-2 text-sm font-semibold text-violet-200 transition-all duration-200 hover:bg-violet-500/25"
          >
            View all projects
            <ArrowRight className="h-4 w-4" />
          </Link>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm
                font-semibold text-[#161616] transition-colors duration-200 hover:bg-white/90"
            >
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </a>
          ) : null}
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2
                text-sm font-semibold text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              <Github className="h-4 w-4" />
              Source
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={scrollViewport}
      variants={fadeUp(index * 0.1)}
    >
      {followPointer ? (
        <FollowerPointerCard
          accentColor={CLAUDE_BRAND_COLOR}
          title={pointerHint}
        >
          {card}
        </FollowerPointerCard>
      ) : (
        card
      )}
    </motion.div>
  );
};
