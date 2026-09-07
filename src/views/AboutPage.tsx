"use client";

import { CTAButton } from "@/components/common/CTAButton";
import Header from "@/components/Header";
import { SocialLinksRow } from "@/components/public/SocialLinksRow";
import {
  CareerJourneyPanel,
  LandscapePageCtaSection,
  PortfolioStatCard,
  SectionHeader,
} from "@/components/sections";
import { PublicImage } from "@/components/ui/PublicImage";
import { PROFILE } from "@/constants/profile";
import {
  fadeInUp,
  heroFadeStep,
  pageHeroItem,
  pageHeroReveal,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import { useActiveResume } from "@/hooks/useActiveResume";
import { useResumeDownload } from "@/hooks/useResumeDownload";
import { PROFILE_DESK } from "@/lib/seoImages";
import {
  careerTimeline,
  JOURNEY_DESCRIPTION,
} from "@/screens/sections/CareerJourneySection/careerJourneyData";
import { FooterSection } from "@/screens/sections/FooterSection";
import { portfolioStats } from "@/screens/sections/StatsSection/statsData";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  Code2,
  Coffee,
  Copy,
  Download,
  Paintbrush,
  Rocket,
  Zap,
} from "lucide-react";
import { useState } from "react";

const highlights: {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
  color: string;
  border: string;
}[] = [
  {
    icon: Paintbrush,
    title: "WordPress, Shopify & WooCommerce",
    description:
      "200+ delivered sites and stores    WordPress themes, WooCommerce and Shopify builds, Elementor, and on-page SEO for international clients.",
    tag: "CMS",
    color: "from-orange-500/10 to-amber-500/5",
    border: "border-orange-500/20",
  },
  {
    icon: Zap,
    title: "React & Next.js",
    description:
      "Modern full stack apps and platforms — including payment gateways with Next.js, JavaScript, and MongoDB.",
    tag: "Full Stack",
    color: "from-yellow-500/10 to-lime-500/5",
    border: "border-yellow-500/20",
  },
  {
    icon: Rocket,
    title: "Design to Web",
    description:
      "200+ Figma and PSD conversions into pixel-perfect, responsive pages across browsers and devices.",
    tag: "UI",
    color: "from-sky-500/10 to-indigo-500/5",
    border: "border-sky-500/20",
  },
  {
    icon: BookOpen,
    title: "Performance & SEO",
    description:
      "Core Web Vitals optimization, lazy loading, and asset tuning    often improving load speed 40%+ on client projects.",
    tag: "Speed",
    color: "from-violet-500/10 to-purple-500/5",
    border: "border-violet-500/20",
  },
];

export const AboutPage = (): JSX.Element => {
  const [copied, setCopied] = useState(false);
  const email = PROFILE.email;
  const { data: activeResume, loading: resumeLoading } = useActiveResume();
  const {
    download: downloadResume,
    downloading: resumeDownloading,
    error: resumeDownloadError,
  } = useResumeDownload();

  const handleCopy = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleResumeClick = () => {
    if (activeResume) void downloadResume(activeResume);
  };

  return (
    <main
      id="main-content"
      className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect"
    >
      <Header />

      <section className="w-full pt-40 pb-20 relative overflow-hidden">
        {/* decorative gradient blob */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px]
          bg-gradient-to-b from-violet-600/10 via-purple-600/5 to-transparent rounded-full blur-3xl"
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={pageHeroReveal}
          className="container mx-auto px-4"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-10 lg:gap-10">
            <div className="flex-1 min-w-0 max-w-2xl">
              <motion.h1
                variants={pageHeroItem}
                className="text-4xl lg:text-[63px] font-bold text-white tracking-tight leading-[1.05] mb-6"
              >
                Crafting digital{" "}
                <span className="text-green-500">experiences</span> that matter
              </motion.h1>

              <motion.p
                variants={pageHeroItem}
                className="text-lg text-white/60 leading-relaxed"
              >
                {PROFILE.aboutIntro}
              </motion.p>

              <motion.div variants={pageHeroItem} className="flex flex-col mt-4">
                <SocialLinksRow size="hero" variants={heroFadeStep} />
              </motion.div>
            </div>

            <motion.div
              variants={pageHeroItem}
              className="relative w-full max-w-sm sm:max-w-md lg:max-w-[420px] xl:max-w-[480px]  mx-auto lg:mx-0"
            >
              <div
                className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-blue-600/15 blur-2xl"
                aria-hidden
              />
              <div className="liquid-border-frame w-full">
                <div className="liquid-border-frame__media aspect-square w-full">
                  <PublicImage
                    src={PROFILE_DESK.path}
                    alt={PROFILE_DESK.alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 480px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="w-full pb-20">
        <motion.div
          className="container mx-auto px-4 max-w-6xl grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={sectionReveal}
        >
          {portfolioStats.map((stat) => (
            <PortfolioStatCard key={stat.label} stat={stat} />
          ))}
        </motion.div>
      </section>

      <section className="w-full pb-24">
        <motion.div
          className="container mx-auto px-4"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={sectionReveal}
        >
          <motion.div variants={fadeInUp} className="mb-10 max-w-3xl">
            <SectionHeader
              label="What I Do"
              title="Core strengths"
              align="left"
            />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={sectionReveal}
          >
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <motion.div
                  key={h.title}
                  variants={fadeInUp}
                  className={`relative flex flex-col gap-4 p-6 rounded-2xl border bg-gradient-to-br ${h.color} ${h.border}
                  backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300 group overflow-hidden`}
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                    <Icon className="size-6 text-white/90" />
                  </div>
                  <div>
                    <span
                      className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-widest uppercase
                    bg-white/10 text-white/50 mb-2"
                    >
                      {h.tag}
                    </span>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {h.title}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {h.description}
                    </p>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/[0.04] blur-lg pointer-events-none" />
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      <section className="w-full pb-24">
        <motion.div
          className="container mx-auto px-4 max-w-6xl flex flex-col gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={sectionReveal}
        >
          <motion.div variants={fadeInUp} className="w-full max-w-3xl mx-auto">
            <SectionHeader
              label="Journey"
              title="Career timeline"
              description={JOURNEY_DESCRIPTION}
            />
          </motion.div>

          <div className="w-full">
            <CareerJourneyPanel entries={careerTimeline} />
          </div>
        </motion.div>
      </section>

      <LandscapePageCtaSection
        title="Let's work together"
        description="Available for freelance, full-time, and remote collaboration    startups, redesigns, or joining your team. Let's build something great."
        actions={
          <>
            {!resumeLoading && activeResume ? (
              <CTAButton
                onClick={handleResumeClick}
                variant="primary"
                showArrow={false}
                disabled={resumeDownloading}
              >
                <Download className="w-4 h-4 mr-1.5" />
                {resumeDownloading ? "Downloading…" : "Resume"}
              </CTAButton>
            ) : null}
            <CTAButton
              className="text-md font-medium"
              onClick={handleCopy}
              variant="secondary"
              showArrow={false}
              leftIcon={
                copied ? (
                  <ClipboardCheck className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )
              }
            >
              {copied ? "Copied!" : "Copy Email"}
            </CTAButton>
            <CTAButton
              className="text-md font-medium"
              href="/contact"
              variant="secondary"
              showArrow={true}
            >
              Schedule Call
            </CTAButton>
            {resumeDownloadError ? (
              <p role="status" className="basis-full text-xs text-red-400/90">
                {resumeDownloadError}
              </p>
            ) : null}
          </>
        }
      />

      <section className="w-full pb-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="container mx-auto px-4"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { icon: Zap, text: "Obsessed with performance" },
              { icon: Award, text: "Detail-oriented by default" },
              { icon: Coffee, text: "Powered by coffee" },
              { icon: Code2, text: "Open source enthusiast" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03]
                  border border-white/[0.06] text-sm text-white/40"
              >
                <Icon className="w-3.5 h-3.5 text-white/30" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <FooterSection />
    </main>
  );
};
