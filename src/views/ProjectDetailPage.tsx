"use client";

import { CTAButton } from "@/components/common/CTAButton";
import Header from "@/components/Header";
import { ProjectDetailHero } from "@/components/projects/ProjectDetailHero";
import { ProjectTestimonialCard } from "@/components/projects/ProjectTestimonialCard";
import { PublicImage } from "@/components/ui/PublicImage";
import {
  fadeInUp,
  pageHeroItem,
  pageHeroReveal,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import type { PublicProjectDetail } from "@/data/projectUiMapper";
import {
  bodyParagraphs,
  projectBuildLabel,
  projectCategoryLine,
} from "@/lib/projectMeta";
import { projectImageAlt } from "@/lib/seoImages";
import { isRepositoryUrl } from "@/lib/repositoryUrl";
import { visibleLabels } from "@/lib/visibleLabels";
import { FooterSection } from "@/screens/sections/FooterSection";
import { ProjectCard } from "@/views/ProjectsPage/ProjectCard";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const caseHeadingClass =
  "text-sm font-semibold uppercase tracking-[0.16em] text-white/35";

function CaseStudyCopy({
  id,
  title,
  text,
}: {
  id: string;
  title: string;
  text: string;
}): JSX.Element | null {
  const paragraphs = bodyParagraphs(text);
  if (paragraphs.length === 0) return null;

  return (
    <motion.section variants={fadeInUp} aria-labelledby={id}>
      <h2 id={id} className={caseHeadingClass}>
        {title}
      </h2>
      <div className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-white/70">
        {paragraphs.map((para) => (
          <p key={para}>{para}</p>
        ))}
      </div>
    </motion.section>
  );
}

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
  const problem = project.caseStudy?.problem.trim() ?? "";
  const solution = project.caseStudy?.solution.trim() ?? "";
  const result = project.caseStudy?.result.trim() ?? "";
  const metrics = project.metrics.filter(
    (metric) => metric.label.trim() || metric.value.trim(),
  );
  const beforeImage = project.beforeImage?.trim() ?? "";
  const afterImage = project.afterImage?.trim() ?? "";
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
                  {isRepositoryUrl(project.githubUrl) ? (
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

            {overview.length > 0 ? (
              <motion.div
                variants={pageHeroItem}
                className="mt-6 space-y-4 text-base leading-relaxed text-white/55"
              >
                {overview.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </motion.div>
            ) : null}
          </motion.div>

          <motion.div
            className=" mt-8 container mx-auto px-4 space-y-14 pb-24"
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
            variants={sectionReveal}
          >
            <CaseStudyCopy
              id="case-problem-heading"
              title="The problem"
              text={problem}
            />
            <CaseStudyCopy
              id="case-solution-heading"
              title="What I did"
              text={solution}
            />
            {result || metrics.length > 0 ? (
              <motion.section
                variants={fadeInUp}
                aria-labelledby="case-result-heading"
              >
                <h2 id="case-result-heading" className={caseHeadingClass}>
                  The result
                </h2>
                {result ? (
                  <div className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-white/70">
                    {bodyParagraphs(result).map((para) => (
                      <p key={para}>{para}</p>
                    ))}
                  </div>
                ) : null}
                {metrics.length > 0 ? (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {metrics.map((metric) => (
                      <div
                        key={`${metric.label}-${metric.value}`}
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
                      >
                        {metric.value ? (
                          <p className="text-lg font-semibold tracking-tight text-white">
                            {metric.value}
                          </p>
                        ) : null}
                        {metric.label ? (
                          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                            {metric.label}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </motion.section>
            ) : null}

            {beforeImage || afterImage ? (
              <motion.section
                variants={fadeInUp}
                aria-label="Before and after"
                className={`grid grid-cols-1 gap-4 ${
                  beforeImage && afterImage ? "md:grid-cols-2" : ""
                }`}
              >
                {beforeImage ? (
                  <figure className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111]">
                    <PublicImage
                      src={beforeImage}
                      alt={`${projectImageAlt(project.title)} — before`}
                      width={1200}
                      height={800}
                      sizes="(max-width: 768px) 100vw, 560px"
                      className="h-auto w-full"
                    />
                    <figcaption className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      Before
                    </figcaption>
                  </figure>
                ) : null}
                {afterImage ? (
                  <figure className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111]">
                    <PublicImage
                      src={afterImage}
                      alt={`${projectImageAlt(project.title)} — after`}
                      width={1200}
                      height={800}
                      sizes="(max-width: 768px) 100vw, 560px"
                      className="h-auto w-full"
                    />
                    <figcaption className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      After
                    </figcaption>
                  </figure>
                ) : null}
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
                    {visibleLabels(project.technologies).map((tech) => (
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
                {visibleLabels(project.cmsExtensions).length > 0 ? (
                  <span>
                    Plugins:{" "}
                    <span className="text-white/75">
                      {visibleLabels(project.cmsExtensions).join(", ")}
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

            <motion.section
              variants={fadeInUp}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-8 sm:px-8"
            >
              <CTAButton
                href="/contact?topic=free-website-check"
                className="h-auto max-w-full whitespace-normal text-center"
              >
                Want results like this? Get a free website check
              </CTAButton>
            </motion.section>
          </motion.div>
        </article>

        <FooterSection />
      </div>
    </main>
  );
}
