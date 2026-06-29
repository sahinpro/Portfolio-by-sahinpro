"use client";

import { CTAButton } from "@/components/common/CTAButton";
import Header from "@/components/Header";
import {
  LandscapePageCtaSection,
  SectionHeader,
  SectionLabel,
  WorkProcessPanel,
  type WorkProcessStep,
} from "@/components/sections";
import Glow from "@/components/ui/glow";
import { SERVICE_DEFINITIONS } from "@/constants/expertise";
import {
  fadeInUp,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import { FooterSection } from "@/screens/sections/FooterSection";
import { motion, useInView } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  Code,
  LayoutTemplate,
  Paintbrush,
  Palette,
  Rocket,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";

const SERVICE_ICONS: Record<string, LucideIcon> = {
  "ui-ux": Palette,
  "full-stack": Zap,
  wordpress: LayoutTemplate,
  ecommerce: ShoppingCart,
  performance: TrendingUp,
  maintenance: Wrench,
};

type Service = (typeof SERVICE_DEFINITIONS)[number] & { icon: LucideIcon };

const services: Service[] = SERVICE_DEFINITIONS.map((def) => ({
  ...def,
  icon: SERVICE_ICONS[def.id] ?? Code,
}));

const processSteps: WorkProcessStep[] = [
  {
    step: "01",
    title: "Discovery",
    description: "We align on goals, audience, and technical requirements.",
    icon: Search,
    accent: "from-blue-500/10 to-cyan-500/5",
    border: "border-blue-500/20",
  },
  {
    step: "02",
    title: "Design",
    description: "Wireframes and mockups    approved before a line is coded.",
    icon: Paintbrush,
    accent: "from-pink-500/10 to-rose-500/5",
    border: "border-pink-500/20",
  },
  {
    step: "03",
    title: "Build",
    description: "Clean, tested code delivered in transparent milestones.",
    icon: Code,
    accent: "from-yellow-500/10 to-amber-500/5",
    border: "border-yellow-500/20",
  },
  {
    step: "04",
    title: "Launch",
    description: "Deployed, optimised, and handed over with full docs.",
    icon: Rocket,
    accent: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-500/20",
  },
];

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.37, 0.04, 0.29, 1.01] },
  },
});

const ServiceCard = ({
  service,
  index,
}: {
  service: Service;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inV = useInView(ref, scrollViewport);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inV ? "visible" : "hidden"}
      variants={fadeUp(index * 0.07)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="h-full"
    >
      <div
        id={service.id}
        className={`relative flex flex-col h-full p-7 rounded-2xl border bg-gradient-to-br
        ${service.accent} ${service.border} overflow-hidden
        transition-shadow duration-300 ${hovered ? "shadow-xl shadow-black/20" : ""}`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
            <service.icon className="size-6 text-white/90" />
          </div>
          {service.tag && (
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-widest uppercase
              bg-white/5 border border-white/10 text-white/40"
            >
              {service.tag}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
          {service.title}
        </h3>
        <p className="text-sm text-white/50 leading-relaxed mb-6 flex-1">
          {service.description}
        </p>

        {/* Features */}
        <ul className="space-y-2.5 mb-7">
          {service.features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2.5 text-sm text-white/60"
            >
              <Check className="w-4 h-4 text-white/40 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <CTAButton
          href="/contact"
          variant="secondary"
          accentClassName={service.buttonAccent}
          className="w-full justify-center"
        >
          Get a quote
        </CTAButton>

        {/* Decorative blob */}
        <div
          className="pointer-events-none absolute -bottom-8 -right-8 w-24 h-24
          rounded-full bg-white/[0.04] blur-xl"
        />
      </div>
    </motion.div>
  );
};

export const ServicesPage = (): JSX.Element => {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInV = useInView(headerRef, scrollViewport);

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <Header />

      <section className="w-full pt-40 pb-16 relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
          bg-gradient-to-b from-violet-600/8 via-purple-600/4 to-transparent rounded-full blur-3xl"
        />

        <div ref={headerRef} className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0)}
          >
            <SectionLabel className="mb-4">Services</SectionLabel>
          </motion.div>
          <motion.h1
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0.05)}
            className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4"
          >
            What I build <span className="text-violet-400">for you</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0.1)}
            className="text-lg text-white/50 max-w-xl"
          >
            Comprehensive web development services from concept to launch
            crafted with precision and purpose.
          </motion.p>
        </div>
      </section>

      <section className="w-full pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full pb-24 relative overflow-hidden">
        <Glow variant="center" className="-z-10 blur-3xl opacity-50" />
        <div
          className="pointer-events-none absolute inset-0
          bg-gradient-to-b from-violet-600/[0.03] via-transparent to-transparent"
          aria-hidden
        />

        <motion.div
          className="container mx-auto px-4 max-w-6xl flex flex-col gap-12 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={sectionReveal}
        >
          <motion.div
            variants={fadeInUp}
            className="w-full py-10 max-w-3xl mx-auto"
          >
            <SectionHeader
              label="Process"
              title="How I work"
              description="A clear, collaborative workflow from first conversation to launch    with milestones you can track at every stage."
            />
          </motion.div>

          <motion.div variants={fadeInUp} className="w-full">
            <WorkProcessPanel steps={processSteps} />
          </motion.div>
        </motion.div>
      </section>

      <LandscapePageCtaSection
        eyebrow={
          <div className="inline-flex items-center gap-2 text-sm text-violet-400">
            <Sparkles className="w-4 h-4" />
            <span>Not sure what you need?</span>
          </div>
        }
        title="Let's figure it out together"
        description="Schedule a free 15-minute Google Meet. No pitch, just a real conversation about your project and goals."
        actions={
          <>
            <CTAButton href="/contact" variant="primary">
              <Zap className="w-4 h-4 mr-1.5" />
              Schedule a free Google Meet
            </CTAButton>
            <CTAButton href="/projects" variant="secondary">
              View work
            </CTAButton>
          </>
        }
      />

      <FooterSection />
    </div>
  );
};
