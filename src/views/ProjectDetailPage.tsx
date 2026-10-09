"use client";

import { CTAButton } from "@/components/common/CTAButton";
import Header from "@/components/Header";
import { ProjectDetailHero } from "@/components/projects/ProjectDetailHero";
import { ProjectTestimonialCard } from "@/components/projects/ProjectTestimonialCard";
import {
  fadeInUp,
  pageHeroItem,
  pageHeroReveal,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import type {
  PublicCaseStudy,
  PublicProjectDetail,
} from "@/data/projectUiMapper";
import {
  bodyParagraphs,
  projectBuildLabel,
  projectCategoryLine,
} from "@/lib/projectMeta";
import { FooterSection } from "@/screens/sections/FooterSection";
import { ProjectCard } from "@/views/ProjectsPage/ProjectCard";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const CASE_STUDY_STEPS: { key: keyof PublicCaseStudy; label: string }[] = [
  { key: "problem", label: "Problem" },
  { key: "solution", label: "Solution" },
  { key: "result", label: "Result" },
];

export function ProjectDetailPage({
  project,
  relatedProjects,
}: {
  project: PublicProjectDetail;
  relatedProjects: PublicProjectDetail[];
}): JSX.Element {
  const categoryLine = projectCategoryLine(project);
  const buildLabel = projectBuildLabel(project);
  const overview = bodyParagraphs(project.description || "");
  const caseStudyLines = project.caseStudy
    ? CASE_STUDY_STEPS.filter(({ key }) => project.caseStudy?.[key])
    : [];
  const [galleryReady, setGalleryReady] = useState(
    project.screenshots.length === 0,
  );

  useEffect(() => {
    if (project.screenshots.length === 0) {
      setGalleryReady(true);
      return;
    }
    const timer = window.setTimeout(() => setGalleryReady(true), 150);
    return () => window.clearTimeout(timer);
  }, [project.screenshots.length]);

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen w-full flex-col items-start bg-[#050505] shading-effect"
    >
      <div className="relative z-[1] flex w-full flex-col">
        <Header />

        <article className="w-full pt-32 sm:pt-40">
          <motion.div
            className="container mx-auto px-4"
            initial="hidden"
            animate="visible"
            variants={pageHeroReveal}
          >
            <motion.div variants={pageHeroItem}>
              <Link
                href="/projects"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                All projects
              </Link>
            </motion.div>

            <motion.div
              className="mx-auto mt-12 "
              initial="hidden"
              whileInView="visible"
              viewport={scrollViewport}
              variants={fadeInUp}
            >
              <div className="overflow-hidden relative rounded-[1.75rem] border border-white/[0.08] bg-[#111]">
                <ProjectDetailHero
                  project={project}
                  galleryReady={galleryReady}
                />
                <motion.p
                  variants={pageHeroItem}
                  className="  z-20 text-[11px] absolute bottom-4 left-4 font-semibold uppercase tracking-[0.16em] text-white bg-[#0000006c] px-2 py-1 rounded-lg backdrop-blur-sm border border-white/60"
                >
                  {categoryLine}
                </motion.p>
                <motion.div
                  variants={pageHeroItem}
                  className=" absolute bottom-4 right-4 flex flex-wrap gap-3"
                >
                  {project.liveUrl ? (
                    <CTAButton href={project.liveUrl} variant="primary">
                      <ExternalLink className="h-4 w-4" aria-hidden />
                      Live url
                    </CTAButton>
                  ) : null}
                  {project.githubUrl ? (
                    <CTAButton href={project.githubUrl} variant="secondary">
                      <Github className="h-4 w-4" aria-hidden />
                      Source
                    </CTAButton>
                  ) : null}
                </motion.div>
              </div>
            </motion.div>

            {project.roleLabel ? (
              <motion.p
                variants={pageHeroItem}
                className="mt-3 text-sm text-white/45"
              >
                {project.roleLabel}
              </motion.p>
            ) : null}
            <motion.h1
              variants={pageHeroItem}
              className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl"
            >
              {project.title}
            </motion.h1>

            {overview.length > 0 && !project.caseStudy ? (
              <motion.div
                variants={pageHeroItem}
                className="mt-6 space-y-4 text-base leading-relaxed text-white/55"
              >
                {overview.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </motion.div>
            ) : null}

            {overview.length > 0 && project.caseStudy ? (
              <motion.p
                variants={pageHeroItem}
                className="mt-6 max-w-4xl text-base leading-relaxed text-white/55"
              >
                {overview[0]}
              </motion.p>
            ) : null}
          </motion.div>

          <motion.div
            className=" mt-8 container mx-auto px-4 space-y-14 pb-24"
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
            variants={sectionReveal}
          >
            {caseStudyLines.length > 0 ? (
              <motion.section
                variants={fadeInUp}
                aria-labelledby="case-study-heading"
              >
                <h2
                  id="case-study-heading"
                  className="text-sm font-semibold uppercase tracking-[0.16em] text-white/35"
                >
                  Case study
                </h2>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {caseStudyLines.map(({ key, label }) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#00BB7D]">
                        {label}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-white/70">
                        {project.caseStudy?.[key]}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>
            ) : null}

            {project.testimonial?.quote ? (
              <motion.section variants={fadeInUp}>
                <ProjectTestimonialCard testimonial={project.testimonial} />
              </motion.section>
            ) : null}

            <motion.section variants={fadeInUp} className="space-y-5">
              {project.technologies.length > 0 ? (
                <div>
                  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                    Tech stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-white/70"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/40">
                <span>
                  {project.buildKind === "custom" ? "Stack" : "Platform"}:{" "}
                  <span className="text-white/75">{buildLabel}</span>
                </span>
                {project.cmsThemeName ? (
                  <span>
                    Theme:{" "}
                    <span className="text-white/75">
                      {project.cmsThemeName}
                    </span>
                  </span>
                ) : null}
                {project.cmsExtensions.length > 0 ? (
                  <span>
                    Plugins:{" "}
                    <span className="text-white/75">
                      {project.cmsExtensions.join(", ")}
                    </span>
                  </span>
                ) : null}
              </div>
            </motion.section>

            {relatedProjects.length > 0 ? (
              <motion.section
                variants={fadeInUp}
                aria-labelledby="more-projects-heading"
              >
                <h2
                  id="more-projects-heading"
                  className="text-sm font-semibold uppercase tracking-[0.16em] text-white/35"
                >
                  More projects
                </h2>
                <div className="mt-5 grid lg:grid-cols-2 grid-cols-1 gap-5">
                  {relatedProjects.map((related, index) => (
                    <ProjectCard
                      key={related.id}
                      project={related}
                      index={index}
                    />
                  ))}
                </div>
              </motion.section>
            ) : null}
          </motion.div>
        </article>

        <FooterSection />
      </div>
    </main>
  );
}
