import { CTAButton } from "@/components/CTAButton";
import { FeaturedProjectCard } from "@/components/projects/FeaturedProjectCard";
import { SectionHeader } from "@/components/section";
import {
  sectionHeaderWrapClass,
  sectionInnerClass,
  sectionShellClass,
} from "@/constants/layout";
import {
  fadeInUp,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import { usePublishedProjects } from "@/hooks/usePublishedProjects";
import { motion } from "framer-motion";
import { useMemo } from "react";

const HOMEPAGE_FEATURED_LIMIT = 3;

export const FeaturedProjectsSection = (): JSX.Element | null => {
  const { projects, loading } = usePublishedProjects();

  const featuredProjects = useMemo(
    () => projects.filter((p) => p.featured).slice(0, HOMEPAGE_FEATURED_LIMIT),
    [projects],
  );

  if (!loading && featuredProjects.length === 0) {
    return null;
  }

  return (
    <section
      id="featured-work"
      className={sectionShellClass}
      aria-busy={loading && featuredProjects.length === 0}
    >
      <motion.div
        className={`${sectionInnerClass} items-center`}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={sectionReveal}
      >
        <motion.div variants={fadeInUp} className={sectionHeaderWrapClass}>
          <SectionHeader
            title="Featured projects"
            description="Selected client work    from e-commerce stores to full-stack web applications."
          />
        </motion.div>

        {loading && featuredProjects.length === 0 ? (
          <div className="w-full space-y-5">
            {Array.from({ length: HOMEPAGE_FEATURED_LIMIT }).map((_, i) => (
              <div
                key={i}
                className="h-[280px] sm:h-[360px] lg:h-[480px] animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.04]"
              />
            ))}
          </div>
        ) : (
          <motion.div variants={fadeInUp} className="w-full space-y-5">
            {featuredProjects.map((project, index) => (
              <FeaturedProjectCard
                key={project.id}
                project={project}
                index={index}
              />
            ))}
          </motion.div>
        )}

        <motion.div variants={fadeInUp} className="flex justify-center">
          <CTAButton href="/projects" variant="secondary">
            View all projects
          </CTAButton>
        </motion.div>
      </motion.div>
    </section>
  );
};
