import { CTAButton } from "@/components/common/CTAButton";
import { FeaturedProjectCard } from "@/components/projects/FeaturedProjectCard";
import { FeaturedProjectsSectionSkeleton } from "@/screens/sections/FeaturedProjectsSection/FeaturedProjectsSectionSkeleton";
import { SectionHeader } from "@/components/sections";
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
import { sortProjectsByUpdatedDesc } from "@/lib/projectSort";
import { motion } from "framer-motion";
import { useMemo } from "react";

const HOMEPAGE_FEATURED_LIMIT = 3;

export const FeaturedProjectsSection = (): JSX.Element | null => {
  const { projects, loading } = usePublishedProjects();

  const featuredProjects = useMemo(
    () =>
      sortProjectsByUpdatedDesc(projects.filter((p) => p.featured)).slice(
        0,
        HOMEPAGE_FEATURED_LIMIT,
      ),
    [projects],
  );

  if (!loading && featuredProjects.length === 0) {
    return null;
  }

  if (loading && featuredProjects.length === 0) {
    return <FeaturedProjectsSectionSkeleton />;
  }

  return (
    <section id="featured-work" className={sectionShellClass}>
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

        <motion.div variants={fadeInUp} className="w-full space-y-5">
          {featuredProjects.map((project, index) => (
            <FeaturedProjectCard
              key={project.id}
              project={project}
              index={index}
            />
          ))}
        </motion.div>

        <motion.div variants={fadeInUp} className="flex justify-center">
          <CTAButton href="/projects" variant="secondary">
            View all projects
          </CTAButton>
        </motion.div>
      </motion.div>
    </section>
  );
};
