"use client";

import { CTAButton } from "@/components/common/CTAButton";
import Header from "@/components/Header";
import { absoluteUrl, canonicalPath, getSiteUrl } from "@/constants/site";
import { LandscapePageCtaSection } from "@/components/sections";
import type { PublicProjectDetail } from "@/data/projectUiMapper";
import { usePublishedProject } from "@/hooks/usePublishedProject";
import { usePublishedProjects } from "@/hooks/usePublishedProjects";
import { isLegacyProjectIdParam, projectDetailPath } from "@/lib/projectPaths";
import { FooterSection } from "@/screens/sections/FooterSection";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  ExternalLink,
  Github,
  Images,
  Layers,
  LayoutGrid,
  Sparkles,
  Star,
  Tag,
  Wrench,
} from "lucide-react";
import { useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SITE = "Sahin Alam";

const categoryBadge: Record<string, string> = {
  "Web Development": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "E-commerce": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "SaaS Platform": "bg-sky-500/20 text-sky-300 border-sky-500/30",
  "Front-end Web Design": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Full Stack": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Frontend: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  CMS: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

/** Parent orchestrates a single entrance timeline; children use `fadeChild` (no per-block delay). */
const pageReveal = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.05,
    },
  },
};

const fadeChild = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.37, 0.04, 0.29, 1.01] },
  },
};

function frameworkLabel(
  fw: PublicProjectDetail["customFramework"],
  customLabel: string | null,
): string {
  if (fw === "other" && customLabel?.trim()) return customLabel.trim();
  if (fw === "react_vanilla") return "React (Vanilla)";
  if (fw === "vanilla_js") return "Vanilla JS";
  if (fw === "next") return "Next.js";
  if (fw === "react") return "React";
  if (fw === "vue") return "Vue";
  if (fw === "other") return "Custom stack";
  return "";
}

function cmsPlatformLabel(p: PublicProjectDetail["cmsPlatform"]): string {
  if (p === "wordpress") return "WordPress";
  if (p === "shopify") return "Shopify";
  if (p === "wix") return "Wix";
  return "";
}

function bodyParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8 max-w-container mx-auto">
      <div className="h-4 w-32 rounded-full bg-white/10" />
      <div className="h-12 max-w-full rounded-lg bg-white/10" />
      <div className="w-full max-h-[420px] rounded-2xl bg-white/[0.06]" />
      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-4 rounded bg-white/[0.06] ${i % 4 === 3 ? "w-4/5" : "w-full"}`}
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-white/[0.04]" />
      </div>
    </div>
  );
}

function RelatedCard({
  project,
}: {
  project: { slug: string; title: string; image: string; category: string };
}) {
  return (
    <Link
      href={projectDetailPath(project)}
      className="group flex flex-col rounded-2xl border border-white/[0.08] overflow-hidden bg-gradient-to-b from-white/[0.04] to-transparent
        hover:border-white/[0.14] transition-all duration-300"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <span
          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border mb-2
          ${categoryBadge[project.category] ?? "bg-white/10 text-white/50 border-white/10"}`}
        >
          {project.category}
        </span>
        <p className="text-sm font-semibold text-white/90 group-hover:text-white line-clamp-2 transition-colors">
          {project.title}
        </p>
        <span className="inline-flex items-center gap-1 mt-3 text-xs text-violet-400/90 font-medium">
          View project
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function ProjectDetailPage({ slug }: { slug: string }): JSX.Element | null {
  const router = useRouter();
  const { project, loading, error } = usePublishedProject(slug);
  const { projects: allProjects } = usePublishedProjects();

  const related = useMemo(() => {
    if (!project) return [];
    const others = allProjects.filter((p) => p.id !== project.id);
    const sameCat = others.filter((p) => p.category === project.category);
    const rest = others.filter((p) => p.category !== project.category);
    return [...sameCat, ...rest].slice(0, 3);
  }, [project, allProjects]);

  useEffect(() => {
    if (!loading && project && slug && isLegacyProjectIdParam(slug)) {
      router.replace(projectDetailPath(project));
    }
  }, [loading, project, slug, router]);

  const pathname = slug ? `/projects/${project?.slug ?? slug}` : "/projects";
  const metaDescription = project
    ? project.longDescription?.trim() || project.description || undefined
    : undefined;

  if (!slug) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
        <p className="text-white/50 text-sm">Invalid link.</p>
      </div>
    );
  }

  if (!loading && project && isLegacyProjectIdParam(slug)) {
    return null;
  }

  return (
    <main id="main-content" className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      {project && metaDescription ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              name: project.title,
              description: metaDescription.slice(0, 320),
              image: absoluteUrl(project.image),
              url: canonicalPath(pathname),
              author: {
                "@type": "Person",
                name: SITE,
                url: getSiteUrl(),
              },
            }),
          }}
        />
      ) : null}

      <Header />

      <article className="w-full pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24">
        <div className="container mx-auto px-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/75 mb-8 sm:mb-10 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            All projects
          </Link>

          {loading ? (
            <DetailSkeleton />
          ) : error ? (
            <div className="py-20 text-center max-w-md mx-auto">
              <p className="text-red-300/80 text-sm mb-2">
                Something went wrong loading this project.
              </p>
              <Link
                href="/projects"
                className="text-violet-400 hover:text-violet-300 text-sm"
              >
                Back to projects
              </Link>
            </div>
          ) : !project ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Layers className="w-8 h-8 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-4">
                This project could not be found or is not published.
              </p>
              <Link
                href="/projects"
                className="text-violet-400 hover:text-violet-300 text-sm font-medium"
              >
                Back to projects
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={pageReveal}
              className="max-w-container mx-auto"
            >
              {/* Header */}
              <motion.header variants={fadeChild} className="mb-8 sm:mb-10">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border
                    ${categoryBadge[project.category] ?? "bg-white/10 text-white/50 border-white/10"}`}
                  >
                    <Tag className="w-3 h-3" />
                    {project.category}
                  </span>
                  {project.year && (
                    <span className="text-xs text-white/35 font-medium">
                      {project.year}
                    </span>
                  )}
                  {project.featured && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold
                      bg-amber-400/10 border border-amber-400/30 text-amber-300"
                    >
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.12] mb-4">
                  {project.title}
                </h1>

                <p className="text-lg text-white/55 leading-relaxed max-w-3xl">
                  {project.description}
                </p>
              </motion.header>

              {/* Hero image */}
              <motion.div variants={fadeChild} className="mb-10 sm:mb-12">
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50">
                  <div className=" ">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-auto object-cover min-h-[650px]"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505]/90 to-transparent" />
                </div>
              </motion.div>

              {project.screenshots.length > 0 ? (
                <motion.section variants={fadeChild} className="mb-10 sm:mb-12">
                  <div className="flex items-center gap-2 mb-5">
                    <Images className="w-4 h-4 text-white/35" />
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
                      Screenshots
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {project.screenshots.map((src, i) => (
                      <a
                        key={`${src}-${i}`}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex rounded-xl border border-white/[0.08] bg-white/[0.02] p-1.5 shadow-lg shadow-black/20 transition-colors hover:border-white/[0.14]"
                      >
                        <img
                          src={src}
                          alt={`${project.title}    screenshot ${i + 1}`}
                          className="block max-h-36 max-w-[320px] w-auto h-auto  transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </a>
                    ))}
                  </div>
                </motion.section>
              ) : null}

              <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-10 xl:gap-14">
                {/* Main copy */}
                <motion.div variants={fadeChild} className="min-w-0">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-4 h-4 text-violet-400/80" />
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
                      Overview
                    </h2>
                  </div>

                  <div className="space-y-5 text-white/65 leading-relaxed text-[15px] sm:text-base">
                    {bodyParagraphs(
                      project.longDescription?.trim() ||
                        project.description ||
                        "",
                    ).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  {project.technologies.length > 0 && (
                    <div className="mt-10 pt-8 border-t border-white/[0.07]">
                      <div className="flex items-center gap-2 mb-4">
                        <LayoutGrid className="w-4 h-4 text-white/35" />
                        <h3 className="text-sm font-semibold text-white/80">
                          Tech stack
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((t) => (
                          <span
                            key={t}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.06] border border-white/[0.1] text-white/70"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Sidebar */}
                <motion.aside
                  variants={fadeChild}
                  className="space-y-6 xl:sticky xl:top-28 self-start"
                >
                  {/* Primary actions */}
                  <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent p-5 sm:p-6">
                    <p className="text-xs uppercase tracking-widest text-white/35 font-semibold mb-4">
                      Links
                    </p>
                    <div className="flex flex-col gap-2">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-[#161616] text-sm font-semibold hover:bg-white/90 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Live demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Github className="w-4 h-4" />
                          Source code
                        </a>
                      )}
                      {!project.liveUrl && !project.githubUrl && (
                        <p className="text-sm text-white/40 text-center py-2">
                          No public links for this project.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Build / CMS meta */}
                  <div className="rounded-2xl border border-white/[0.08] p-5 sm:p-6">
                    <p className="text-xs uppercase tracking-widest text-white/35 font-semibold mb-4">
                      Build
                    </p>
                    {project.buildKind === "custom" ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <Box className="w-4 h-4 text-violet-400/90 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white/45 text-xs mb-0.5">
                              Stack
                            </p>
                            <p className="text-white/85 font-medium">
                              {frameworkLabel(
                                project.customFramework,
                                project.customFrameworkLabel,
                              ) || "Custom"}
                            </p>
                          </div>
                        </div>
                        {project.stackDetails.length > 0 && (
                          <ul className="space-y-2 pt-2 border-t border-white/[0.06]">
                            {project.stackDetails.map((row) => (
                              <li
                                key={row.label}
                                className="flex justify-between gap-3 text-xs"
                              >
                                <span className="text-white/40">
                                  {row.label}
                                </span>
                                <span className="text-white/75 text-right font-medium">
                                  {row.value}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <Wrench className="w-4 h-4 text-emerald-400/90 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white/45 text-xs mb-0.5">
                              Platform
                            </p>
                            <p className="text-white/85 font-medium">
                              {cmsPlatformLabel(project.cmsPlatform) || "CMS"}
                            </p>
                          </div>
                        </div>
                        {project.cmsThemeName && (
                          <p className="text-xs text-white/50 pl-7">
                            Theme:{" "}
                            <span className="text-white/70">
                              {project.cmsThemeName}
                            </span>
                          </p>
                        )}
                        {project.cmsExtensions.length > 0 && (
                          <div className="pt-2 border-t border-white/[0.06]">
                            <p className="text-[11px] text-white/35 mb-2">
                              Extensions
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {project.cmsExtensions.map((ext) => (
                                <span
                                  key={ext}
                                  className="px-2 py-0.5 rounded-md text-[11px] bg-white/[0.05] text-white/55 border border-white/[0.07]"
                                >
                                  {ext}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.aside>
              </div>

              {/* Related */}
              {related.length > 0 && (
                <motion.section
                  variants={fadeChild}
                  className="mt-16 sm:mt-20 pt-12 border-t border-white/[0.07]"
                >
                  <h2 className="text-lg font-bold text-white mb-6">
                    More projects
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {related.map((p) => (
                      <RelatedCard key={p.id} project={p} />
                    ))}
                  </div>
                </motion.section>
              )}
            </motion.div>
          )}
        </div>
      </article>

      {!loading && !error && project ? (
        <LandscapePageCtaSection
          title="Let's work together"
          description="Have an exciting project in mind? Let's discuss how I can help bring your vision to life."
          actions={
            <>
              <CTAButton href="/projects" variant="primary">
                View my work
              </CTAButton>
              <CTAButton href="/contact" variant="secondary" showArrow>
                Get in touch
              </CTAButton>
            </>
          }
        />
      ) : null}

      <FooterSection />
    </main>
  );
}
