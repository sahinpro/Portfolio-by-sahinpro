import { CTAButton } from "@/components/CTAButton";
import Header from "@/components/Header";
import { FooterSection } from "@/screens/sections/FooterSection";
import { motion, useInView } from "framer-motion";
import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Code2,
  Coffee,
  Copy,
  Download,
  ExternalLink,
  Heart,
  MessageCircle,
  Rocket,
  Users,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";

/* ─── Data ─────────────────────────────────────────── */
const stats = [
  {
    icon: Calendar,
    value: "2+",
    label: "Years Experience",
    color: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: Code2,
    value: "200+",
    label: "Projects Completed",
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Users,
    value: "100%",
    label: "Client Satisfaction",
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Heart,
    value: "15+",
    label: "Technologies Mastered",
    color: "from-rose-500/20 to-pink-500/10",
    border: "border-rose-500/20",
  },
];

const highlights = [
  {
    icon: "🎨",
    title: "WordPress Expert",
    description:
      "Custom plugin development and theme customization with 200+ successful projects.",
    tag: "CMS",
    color: "from-orange-500/10 to-amber-500/5",
    border: "border-orange-500/20",
  },
  {
    icon: "⚡",
    title: "Full Stack Dev",
    description:
      "Building modern web applications with React, Next.js, Express.js, and MongoDB.",
    tag: "Full Stack",
    color: "from-yellow-500/10 to-lime-500/5",
    border: "border-yellow-500/20",
  },
  {
    icon: "🚀",
    title: "Problem Solver",
    description:
      "Transforming complex requirements into elegant, scalable solutions.",
    tag: "Strategy",
    color: "from-sky-500/10 to-indigo-500/5",
    border: "border-sky-500/20",
  },
  {
    icon: "📚",
    title: "Continuous Learner",
    description:
      "Always exploring new technologies and best practices to stay ahead.",
    tag: "Growth",
    color: "from-violet-500/10 to-purple-500/5",
    border: "border-violet-500/20",
  },
];

const techStack = [
  { name: "React", level: 92 },
  { name: "Next.js", level: 85 },
  { name: "WordPress", level: 97 },
  { name: "Node.js", level: 78 },
  { name: "MongoDB", level: 74 },
  { name: "Tailwind", level: 90 },
];

const timeline = [
  {
    year: "2023",
    role: "Junior Web Developer",
    company: "We Next Coder Agency",
    desc: "Joined the agency and started honing skills in WordPress and modern web technologies.",
    icon: Briefcase,
  },
  {
    year: "2022",
    role: "Freelance Developer",
    company: "Self-Employed",
    desc: "Began freelancing, building custom WordPress sites and React projects for clients worldwide.",
    icon: Rocket,
  },
  {
    year: "2021",
    role: "Started Learning",
    company: "Self-Taught",
    desc: "Began the coding journey with HTML/CSS, JavaScript, and WordPress development.",
    icon: BookOpen,
  },
];

/* ─── Animation Variants ───────────────────────────── */
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
const scaleIn = (delay = 0) => ({
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay, ease: [0.37, 0.04, 0.29, 1.01] },
  },
});

/* ─── Sub-components ────────────────────────────────── */
const SectionLabel = ({ children }: { children: string }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase
    bg-white/5 border border-white/10 text-white/50 mb-4"
  >
    {children}
  </span>
);

const StatCard = ({
  stat,
  index,
}: {
  stat: (typeof stats)[0];
  index: number;
}) => {
  const Icon = stat.icon;
  const ref = useRef<HTMLDivElement>(null);
  const inV = useInView(ref, { once: true, margin: "-10%" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inV ? "visible" : "hidden"}
      variants={scaleIn(index * 0.1)}
    >
      <div
        className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border bg-gradient-to-br ${stat.color} ${stat.border}
        backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300 group overflow-hidden`}
      >
        <div
          className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
          group-hover:scale-110 transition-transform duration-300"
        >
          <Icon className="w-6 h-6 text-white/80" />
        </div>
        <p className="text-4xl font-bold text-white tracking-tight">
          {stat.value}
        </p>
        <p className="text-sm text-white/50 text-center leading-tight">
          {stat.label}
        </p>
        {/* subtle corner glow */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/[0.03] blur-xl pointer-events-none" />
      </div>
    </motion.div>
  );
};

const SkillBar = ({
  skill,
  index,
  inView,
}: {
  skill: (typeof techStack)[0];
  index: number;
  inView: boolean;
}) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-sm">
      <span className="text-white/80 font-medium">{skill.name}</span>
      <span className="text-white/40">{skill.level}%</span>
    </div>
    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
        initial={{ width: 0 }}
        animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
        transition={{ duration: 1, delay: 0.2 + index * 0.1, ease: "easeOut" }}
      />
    </div>
  </div>
);

/* ─── Main Component ────────────────────────────────── */
export const AboutPage = (): JSX.Element => {
  const [copied, setCopied] = useState(false);
  const email = "sahinhub@gmail.com";

  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const heroInV = useInView(heroRef, { once: true, margin: "-10%" });
  const highlightInV = useInView(highlightRef, { once: true, margin: "-10%" });
  const skillsInV = useInView(skillsRef, { once: true, margin: "-10%" });
  const timelineInV = useInView(timelineRef, { once: true, margin: "-10%" });
  const ctaInV = useInView(ctaRef, { once: true, margin: "-10%" });

  const handleCopy = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleResumeClick = () => {
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "Sahin_Alam_Resume.pdf";
    link.click();
  };

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <Header />

      {/* ── HERO ───────────────────────────────────────────── */}
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
          className="container mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={fadeUp(0)}>
            <SectionLabel>About Me</SectionLabel>
          </motion.div>

          <motion.h1
            variants={fadeUp(0.05)}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6 max-w-4xl"
          >
            Crafting digital{" "}
            <span
              className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400
              bg-clip-text text-transparent"
            >
              experiences
            </span>{" "}
            that matter
          </motion.h1>

          <motion.p
            variants={fadeUp(0.1)}
            className="max-w-2xl text-lg text-white/60 leading-relaxed mb-8"
          >
            Since 2023 I've been a{" "}
            <span className="text-white font-semibold">
              Junior Web Developer
            </span>{" "}
            at{" "}
            <a
              href="https://wenextcoder.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
            >
              We Next Coder Agency
            </a>
            . My journey started with WordPress and has grown into Full Stack
            Development — always pushing for clean code, great UX, and real
            business impact.
          </motion.p>

          <motion.div variants={fadeUp(0.15)} className="flex flex-wrap gap-3">
            <a
              href="https://github.com/sahincoderbd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10
                text-sm text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub Profile
            </a>
            <a
              href="https://linkedin.com/in/sahincoder"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10
                text-sm text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
              LinkedIn
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section className="w-full pb-20">
        <div
          ref={statsRef}
          className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* ── HIGHLIGHTS ─────────────────────────────────────── */}
      <section className="w-full pb-24">
        <div
          ref={highlightRef}
          className="container mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div
            initial="hidden"
            animate={highlightInV ? "visible" : "hidden"}
            variants={fadeUp(0)}
            className="mb-10"
          >
            <SectionLabel>What I Do</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Core strengths
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial="hidden"
                animate={highlightInV ? "visible" : "hidden"}
                variants={fadeUp(i * 0.08)}
                className={`relative flex flex-col gap-4 p-6 rounded-2xl border bg-gradient-to-br ${h.color} ${h.border}
                  backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300 group overflow-hidden`}
              >
                <span className="text-4xl">{h.icon}</span>
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
            ))}
          </div>
        </div>
      </section>

      {/* ── SKILLS + TIMELINE ──────────────────────────────── */}
      <section className="w-full pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Skills */}
          <motion.div
            ref={skillsRef}
            initial="hidden"
            animate={skillsInV ? "visible" : "hidden"}
            variants={fadeUp(0)}
          >
            <SectionLabel>Proficiency</SectionLabel>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-8">
              Tech stack
            </h2>
            <div className="space-y-5">
              {techStack.map((s, i) => (
                <SkillBar key={s.name} skill={s} index={i} inView={skillsInV} />
              ))}
            </div>
            <p className="mt-6 text-sm text-white/30 flex items-center gap-1.5">
              <Coffee className="w-4 h-4" />
              Fuelled by coffee and curiosity
            </p>
          </motion.div>

          {/* Timeline */}
          <motion.div
            ref={timelineRef}
            initial="hidden"
            animate={timelineInV ? "visible" : "hidden"}
            variants={fadeUp(0.1)}
          >
            <SectionLabel>Journey</SectionLabel>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-8">
              Career timeline
            </h2>
            <div className="relative space-y-0">
              {/* vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/40 via-violet-500/20 to-transparent" />

              {timeline.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.year}
                    initial="hidden"
                    animate={timelineInV ? "visible" : "hidden"}
                    variants={fadeUp(i * 0.12)}
                    className="relative flex gap-6 pb-10 last:pb-0"
                  >
                    {/* dot */}
                    <div
                      className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-[#0d0d0d]
                      border border-violet-500/30 flex items-center justify-center"
                    >
                      <Icon className="w-4 h-4 text-violet-400" />
                    </div>

                    <div className="pt-1.5">
                      <span className="inline-block text-xs font-semibold tracking-widest text-violet-400/70 mb-1">
                        {item.year}
                      </span>
                      <h3 className="text-base font-semibold text-white">
                        {item.role}
                      </h3>
                      <p className="text-sm text-white/40 mb-2">
                        {item.company}
                      </p>
                      <p className="text-sm text-white/50 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA STRIP ──────────────────────────────────────── */}
      <section className="w-full pb-28">
        <motion.div
          ref={ctaRef}
          initial="hidden"
          animate={ctaInV ? "visible" : "hidden"}
          variants={fadeUp(0)}
          className="container mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div
            className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01]
            backdrop-blur-sm p-10 md:p-14 overflow-hidden flex flex-col md:flex-row
            items-center justify-between gap-8"
          >
            {/* glow */}
            <div
              className="pointer-events-none absolute -top-20 left-1/3 w-64 h-64
              bg-violet-600/10 rounded-full blur-3xl"
            />

            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                Let's work together
              </h3>
              <p className="text-white/50 max-w-md leading-relaxed">
                Open to new opportunities, freelance projects, and interesting
                collaborations. Reach out and let's make something great.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <CTAButton
                onClick={handleResumeClick}
                variant="primary"
                showArrow={false}
              >
                <Download className="w-4 h-4 mr-1.5" />
                Resume
              </CTAButton>
              <CTAButton
                onClick={handleCopy}
                variant="secondary"
                showArrow={false}
              >
                <Copy className="w-4 h-4 mr-1.5" />
                {copied ? "Copied!" : "Copy Email"}
              </CTAButton>
              <CTAButton href="/contact" variant="primary">
                <MessageCircle className="w-4 h-4 mr-1.5" />
                Schedule Call
              </CTAButton>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FUN FACTS ──────────────────────────────────────── */}
      <section className="w-full pb-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn(0)}
          className="container mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { icon: Zap, text: "Obsessed with performance" },
              { icon: Award, text: "Detail-oriented by default" },
              { icon: Coffee, text: "Powered by coffee ☕" },
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
    </div>
  );
};
