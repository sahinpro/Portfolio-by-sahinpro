import LightRays from "@/components/LightRays";
import { motion } from "framer-motion";
import { FaBehance, FaDribbble, FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { HeroContent } from "./HeroContent";

const socialLinks = [
  { href: "https://github.com/sahinhub", icon: FaGithub, label: "GitHub" },
  { href: "https://linkedin.com/in/sahinhub", icon: FaLinkedin, label: "LinkedIn" },
  { href: "https://x.com/sahinhub", icon: FaTwitter, label: "X (Twitter)" },
  { href: "https://behance.net/sahinhub", icon: FaBehance, label: "Behance" },
  { href: "https://dribbble.com/sahinhub", icon: FaDribbble, label: "Dribbble" },
];

// Main Hero Section Component
export const HeroSection = (): JSX.Element => {
  return (
    <section className="relative w-full overflow-hidden py-12 min-h-screen flex items-center justify-center">
      {/* Light Rays Background Effect */}
      <div className="absolute inset-0 w-full h-full z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#d400ff"
          raysSpeed={1}
          lightSpread={2.4}
          rayLength={2}
          pulsating={false}
          fadeDistance={0.9}
          saturation={1.7}
          followMouse
          mouseInfluence={0.35}
          noiseAmount={0}
          distortion={0}
        />
      </div>

      {/* Dark Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505]/60 z-[1]" />

      {/* Gradient Overlay at Bottom */}
      <div className="pointer-events-none absolute left-0 bottom-0 w-full h-[200px] bg-gradient-to-t from-[#050505] via-[#05050580] to-transparent z-[1]" />
      
      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for smooth easing
        }}
        className="relative flex flex-col items-center justify-center py-8 z-[2] w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.7, 
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <HeroContent />
        </motion.div>
        
        {/* Social Media Icons */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                delayChildren: 0.6,
                staggerChildren: 0.08,
              },
            },
          }}
          className="flex items-center gap-6 mt-8"
        >
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                variants={{
                  hidden: { 
                    opacity: 0, 
                    scale: 0.6,
                    y: 10,
                  },
                  visible: { 
                    opacity: 1, 
                    scale: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
                whileHover={{ 
                  scale: 1.15, 
                  y: -5,
                  transition: {
                    duration: 0.2,
                    ease: "easeOut",
                  },
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: {
                    duration: 0.1,
                  },
                }}
                className="text-white/70 hover:text-white transition-colors duration-300"
                aria-label={link.label}
              >
                {/* @ts-expect-error - react-icons type issue with strict mode */}
                {<Icon size={24} /> as any}
              </motion.a>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
};