import { CTAButton } from "@/components/CTAButton";
import Header from "@/components/Header";
import { PublicSeo } from "@/components/public/PublicSeo";
import { SocialLinksRow } from "@/components/public/SocialLinksRow";
import {
  CareerJourneyPanel,
  LandscapePageCtaSection,
  PortfolioStatCard,
  SectionHeader,
  SectionLabel,
} from "@/components/section";
import { PROFILE } from "@/constants/profile";
import {
  fadeInUp,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import { useActiveResume } from "@/hooks/useActiveResume";
import { triggerResumeDownload } from "@/lib/resumeDownload";
import {
  careerTimeline,
  JOURNEY_DESCRIPTION,
} from "@/screens/sections/CareerJourneySection/careerJourneyData";
import { FooterSection } from "@/screens/sections/FooterSection";
import { portfolioStats } from "@/screens/sections/StatsSection/statsData";
import { motion, useInView } from "framer-motion";
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
import { useRef, useState } from "react";

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
      "Modern full stack apps and platforms    including payment gateways with Next.js, TypeScript, and MongoDB.",
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

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.37, 0.04, 0.29, 1.01] },
  },
});
const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, delay } },
});
const scrollReveal = {
  once: true,
  amount: 0.2 as const,
  margin: "0px 0px -10% 0px" as const,
};

const heroStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
};

const fadeStep = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.37, 0.04, 0.29, 1.01] },
  },
};

export const AboutPage = (): JSX.Element => {
  const [copied, setCopied] = useState(false);
  const email = PROFILE.email;
  const { data: activeResume, loading: resumeLoading } = useActiveResume();

  const heroRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const heroInV = useInView(heroRef, scrollReveal);
  const highlightInV = useInView(highlightRef, scrollReveal);

  const handleCopy = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleResumeClick = () => {
    if (activeResume) void triggerResumeDownload(activeResume);
  };

  return (
    <main id="main-content" className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <PublicSeo />
      <Header />

      <section className="w-full pt-40 pb-20 relative overflow-hidden">
        {/* decorative gradient blob */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px]
          bg-gradient-to-b from-violet-600/10 via-purple-600/5 to-transparent rounded-full blur-3xl"
        />

        <motion.div
          ref={heroRef}
          initial="hidden"
          animate={heroInV ? "visible" : "hidden"}
          variants={heroStagger}
          className="container mx-auto px-4"
        >
          <motion.div variants={fadeStep}>
            <SectionLabel className="mb-4">About Me</SectionLabel>
          </motion.div>

          <motion.h1
            variants={fadeStep}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6 max-w-4xl"
          >
            Crafting digital{" "}
            <span className="text-violet-400">experiences</span> that matter
          </motion.h1>

          <motion.p
            variants={fadeStep}
            className="max-w-2xl text-lg text-white/60 leading-relaxed"
          >
            {PROFILE.aboutIntro}
          </motion.p>

          <motion.div variants={fadeStep}>
            <SocialLinksRow size="hero" />
          </motion.div>
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
        <div ref={highlightRef} className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={highlightInV ? "visible" : "hidden"}
            variants={fadeUp(0)}
            className="mb-10 max-w-3xl"
          >
            <SectionHeader
              label="What I Do"
              title="Core strengths"
              align="left"
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <motion.div
                  key={h.title}
                  initial="hidden"
                  animate={highlightInV ? "visible" : "hidden"}
                  variants={fadeUp(i * 0.08)}
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
          </div>
        </div>
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

          <motion.div variants={fadeInUp} className="w-full">
            <CareerJourneyPanel entries={careerTimeline} />
          </motion.div>
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
              >
                <Download className="w-4 h-4 mr-1.5" />
                Resume
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
          </>
        }
      />

      <section className="w-full pb-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn(0)}
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
