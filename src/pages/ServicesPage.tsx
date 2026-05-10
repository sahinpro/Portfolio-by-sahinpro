import { CTAButton } from "@/components/CTAButton";
import Header from "@/components/Header";
import { PublicSeo } from "@/components/public/PublicSeo";
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

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  tag?: string;
  accent: string;
  border: string;
  buttonAccent: string;
}

const services: Service[] = [
  {
    icon: Palette,
    title: "UI/UX Design",
    description:
      "Beautiful, user-friendly interfaces that align with your brand, optimised for conversion and delight.",
    features: [
      "Figma Prototyping",
      "Design Systems",
      "Responsive Design",
      "Accessibility (WCAG)",
    ],
    tag: "Design",
    accent: "from-pink-500/10 to-rose-500/5",
    border: "border-pink-500/20",
    buttonAccent: "bg-pink-500/20 border-pink-500/30 hover:bg-pink-500/30",
  },
  {
    icon: Zap,
    title: "Full Stack Development",
    description:
      "End-to-end web applications from database design to pixel-perfect frontend — built to scale.",
    features: [
      "React & Next.js",
      "Node.js & Express",
      "MongoDB / PostgreSQL",
      "REST & GraphQL APIs",
    ],
    tag: "Dev",
    accent: "from-yellow-500/10 to-amber-500/5",
    border: "border-yellow-500/20",
    buttonAccent:
      "bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30",
  },
  {
    icon: LayoutTemplate,
    title: "WordPress Development",
    description:
      "Professional, fast, and SEO-ready WordPress builds — themes, plugins, and full custom sites.",
    features: [
      "Custom Themes",
      "Plugin Development",
      "WooCommerce",
      "Gutenberg Blocks",
    ],
    tag: "CMS",
    accent: "from-blue-500/10 to-cyan-500/5",
    border: "border-blue-500/20",
    buttonAccent: "bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30",
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce Solutions",
    description:
      "Complete e-commerce with WooCommerce or Shopify — from product pages to checkout and beyond.",
    features: [
      "WooCommerce & Shopify",
      "Payment Integration",
      "Inventory Management",
      "Order Automation",
    ],
    tag: "E-Commerce",
    accent: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-500/20",
    buttonAccent:
      "bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30",
  },
  {
    icon: TrendingUp,
    title: "Performance & SEO",
    description:
      "Speed optimisation, Core Web Vitals improvements, and technical SEO to help you rank and retain.",
    features: [
      "Core Web Vitals",
      "Technical SEO Audit",
      "Image & Code Optimisation",
      "Analytics Setup",
    ],
    tag: "Growth",
    accent: "from-violet-500/10 to-purple-500/5",
    border: "border-violet-500/20",
    buttonAccent:
      "bg-violet-500/20 border-violet-500/30 hover:bg-violet-500/30",
  },
  {
    icon: Wrench,
    title: "Maintenance & Support",
    description:
      "Ongoing peace of mind — regular updates, security monitoring, and fast response to any issues.",
    features: [
      "Regular Updates",
      "Security Scanning",
      "Daily Backups",
      "Priority Support",
    ],
    tag: "Support",
    accent: "from-orange-500/10 to-red-500/5",
    border: "border-orange-500/20",
    buttonAccent:
      "bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30",
  },
];

const process = [
  {
    step: "01",
    title: "Discovery",
    desc: "We align on goals, audience, and technical requirements.",
    icon: Search,
  },
  {
    step: "02",
    title: "Design",
    desc: "Wireframes and mockups — approved before a line is coded.",
    icon: Paintbrush,
  },
  {
    step: "03",
    title: "Build",
    desc: "Clean, tested code delivered in transparent milestones.",
    icon: Code,
  },
  {
    step: "04",
    title: "Launch",
    desc: "Deployed, optimised, and handed over with full docs.",
    icon: Rocket,
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

const scrollReveal = {
  once: true,
  amount: 0.2 as const,
  margin: "0px 0px -10% 0px" as const,
};

const SectionLabel = ({ children }: { children: string }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-widest
    uppercase bg-white/5 border border-white/10 text-white/50 mb-4"
  >
    {children}
  </span>
);

const ServiceCard = ({
  service,
  index,
}: {
  service: Service;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inV = useInView(ref, scrollReveal);
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
  const processRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const headerInV = useInView(headerRef, scrollReveal);
  const processInV = useInView(processRef, scrollReveal);
  const ctaInV = useInView(ctaRef, scrollReveal);

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <PublicSeo />
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
            <SectionLabel>Services</SectionLabel>
          </motion.div>
          <motion.h1
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0.05)}
            className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4"
          >
            What I build{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-800 bg-clip-text text-transparent">
              for you
            </span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0.1)}
            className="text-lg text-white/50 max-w-xl"
          >
            Comprehensive web development services — from concept to launch —
            crafted with precision and purpose.
          </motion.p>
        </div>
      </section>

      <section className="w-full pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <ServiceCard key={s.title} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full pb-24 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0
          bg-gradient-to-b from-white/[0.01] via-white/[0.02] to-transparent"
        />

        <div ref={processRef} className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={processInV ? "visible" : "hidden"}
            variants={fadeUp(0)}
            className="text-center mb-12"
          >
            <SectionLabel>Process</SectionLabel>
            <h2 className="text-4xl font-bold text-white tracking-tight">
              How I work
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {process.map((step, i) => (
              <motion.div
                key={step.step}
                initial="hidden"
                animate={processInV ? "visible" : "hidden"}
                variants={fadeUp(i * 0.1)}
                className="relative"
              >
                {/* connector line */}
                {i < process.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-9 left-[calc(50%+24px)] w-[calc(100%+20px-48px)]
                    h-px bg-gradient-to-r from-white/10 to-transparent pointer-events-none"
                  />
                )}

                <div
                  className="flex flex-col items-center text-center gap-4 p-7 rounded-2xl
                  border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]
                  hover:border-white/[0.12] transition-all duration-300"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                    <step.icon className="size-5 text-white/70" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold tracking-widest text-white/20 uppercase">
                      {step.step}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full pb-28">
        <motion.div
          ref={ctaRef}
          initial="hidden"
          animate={ctaInV ? "visible" : "hidden"}
          variants={fadeUp(0)}
          className="container mx-auto px-4"
        >
          <div
            className="relative flex flex-col lg:flex-row items-center justify-between gap-8
            rounded-3xl border border-white/[0.08] p-10 md:p-14 overflow-hidden
            bg-gradient-to-br from-white/[0.03] to-transparent"
          >
            <div
              className="pointer-events-none absolute -top-20 left-1/4 w-80 h-80
              bg-violet-600/8 rounded-full blur-3xl"
            />

            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-4 text-sm text-violet-400">
                <Sparkles className="w-4 h-4" />
                <span>Not sure what you need?</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
                Let's figure it out together
              </h3>
              <p className="text-white/50 max-w-md">
                Book a free 30-minute discovery call. No pitch, just a real
                conversation about your project and goals.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 flex-shrink-0 justify-center">
              <CTAButton href="/contact" variant="primary">
                <Zap className="w-4 h-4 mr-1.5" />
                Free consultation
              </CTAButton>
              <CTAButton href="/projects" variant="secondary">
                View work
              </CTAButton>
            </div>
          </div>
        </motion.div>
      </section>

      <FooterSection />
    </div>
  );
};
