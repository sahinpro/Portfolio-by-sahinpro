import type { PublicProject } from "@/data/projectUiMapper";
import { projectDetailPath } from "@/lib/projectPaths";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ExternalLink,
  Github,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";

const categoryBadge: Record<string, string> = {
  "Web Development": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "E-commerce": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "SaaS Platform": "bg-sky-500/20 text-sky-300 border-sky-500/30",
  "Front-end Web Design": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Full Stack": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Frontend: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  CMS: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const featuredViewport = {
  once: true as const,
  amount: 0.08,
  margin: "120px 0px 80px 0px",
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

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={featuredViewport}
      variants={fadeUp(index * 0.1)}
    >
      <div
        className="group relative grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl border border-white/[0.08]
          bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden
          hover:border-white/[0.14] transition-all duration-500"
      >
        <Link
          to={projectDetailPath(project)}
          className={`relative overflow-hidden aspect-auto h-[280px] sm:h-[360px] lg:h-[480px] block ${even ? "lg:order-1" : "lg:order-2"}`}
        >
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent lg:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent lg:hidden" />
        </Link>

        <div
          className={`flex flex-col justify-center p-6 sm:p-8 md:p-10 ${even ? "lg:order-2" : "lg:order-1"}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border
                ${categoryBadge[project.category] ?? "bg-white/10 text-white/50 border-white/10"}`}
            >
              <Tag className="w-3 h-3" aria-hidden />
              {project.category}
            </span>
            {project.year ? (
              <span className="text-xs text-white/30">{project.year}</span>
            ) : null}
          </div>

          <Link to={projectDetailPath(project)} className="group/title block">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight group-hover/title:text-violet-200/95 transition-colors">
              {project.title}
            </h3>
          </Link>
          <Link to={projectDetailPath(project)} className="block mb-6">
            <p className="text-white/50 leading-relaxed line-clamp-4 hover:text-white/60 transition-colors">
              {project.longDescription || project.description}
            </p>
          </Link>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.technologies.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-lg text-xs font-medium
                  bg-white/5 border border-white/10 text-white/60"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={projectDetailPath(project)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30
                text-sm font-semibold text-violet-200 hover:bg-violet-500/25 transition-all duration-200"
            >
              View project
              <ArrowRight className="w-4 h-4" />
            </Link>
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#161616]
                  text-sm font-semibold hover:bg-white/90 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            ) : null}
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10
                  text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Github className="w-4 h-4" />
                Source
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
