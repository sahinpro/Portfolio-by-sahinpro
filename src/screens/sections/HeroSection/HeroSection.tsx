import LightRays from "@/components/LightRays";
import { motion } from "framer-motion";
import { Github, Linkedin } from "lucide-react";
import type { ComponentType } from "react";
import { useRef } from "react";
import { BsBehance, BsDribbble } from "react-icons/bs";
import { HeroContent } from "./HeroContent";

const socialLinks = [
  { name: "GitHub", href: "https://github.com/sahinhub", icon: Github, brandColor: "#f0f6fc", bg: "hover:bg-white/10" },
  { name: "LinkedIn", href: "https://linkedin.com/in/sahinhub", icon: Linkedin, brandColor: "#0A66C2", bg: "hover:bg-[#0A66C2]/20" },
  { name: "Behance", href: "https://behance.net/sahinhub", icon: BsBehance, brandColor: "#1769FF", bg: "hover:bg-[#1769FF]/20" },
  { name: "Dribbble", href: "https://dribbble.com/sahinhub", icon: BsDribbble, brandColor: "#EA4C89", bg: "hover:bg-[#EA4C89]/20" },
];

export const HeroSection = (): JSX.Element => {
  const socialLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.37, 0.04, 0.29, 1.01] },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: 0.2, ease: [0.37, 0.04, 0.29, 1.01] },
    },
  };

  const socialVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: 0.6 },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.6, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    hover: {
      scale: 1.15,
      y: -5,
      transition: { duration: 0.2, ease: [0.42, 0, 0.58, 1] },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, delay: 0.1, ease: [0.37, 0.04, 0.29, 1.01] },
    },
  };

  return (
    <section className="relative w-full overflow-hidden py-12 min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 w-full h-full z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#d400ff"
          raysSpeed={1}
          lightSpread={3.4}
          rayLength={3}
          pulsating={false}
          fadeDistance={0.5}
          saturation={1}
          followMouse
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
        />
      </div>

      <div className="pointer-events-none absolute left-0 bottom-0 w-full h-[200px] bg-gradient-to-t from-[#050505] via-[#05050580] to-transparent z-[1]" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={badgeVariants}
        className="absolute top-0 left-0 w-full h-[400px] sm:h-[500px] z-[3] pointer-events-auto"
      >
        {" "}
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative flex flex-col items-center justify-center py-8 z-[2] w-full"
      >
        <motion.div variants={contentVariants}>
          <HeroContent />
        </motion.div>

        <motion.div
          ref={(el) => {
            if (el) el.style.transform = "translateZ(0)";
          }}
          variants={socialVariants}
          className="flex items-center gap-2 mt-8"
        >
          {socialLinks.map((link, index) => {
            const Icon = link.icon as ComponentType<{ className?: string }>;
            return (
              <motion.a
                key={link.name}
                ref={(el) => {
                  socialLinksRef.current[index] = el;
                }}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                title={link.name}
                aria-label={link.name}
                variants={iconVariants}
                whileHover="hover"
                whileTap="tap"
                className={`group w-8 h-8 rounded-xl bg-white/5 border border-white/10
                  flex items-center justify-center ${link.bg}
                  transition-all duration-200`}
                style={{ ["--brand-color" as string]: link.brandColor }}
              >
                <span className="text-white/40 transition-colors duration-200 group-hover:[color:var(--brand-color)]">
                  <Icon className="w-4 h-4" />
                </span>
              </motion.a>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
};
