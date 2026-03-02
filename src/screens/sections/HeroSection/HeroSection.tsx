import LightRays from "@/components/LightRays";
import { motion } from "framer-motion";
import { useRef } from "react";
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
  const socialLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.37, 0.04, 0.29, 1.01] } // power3.out equivalent
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7, delay: 0.2, ease: [0.37, 0.04, 0.29, 1.01] } // power3.out equivalent
    }
  };

  const socialVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 0.5, delay: 0.6 }
    }
  };


  const iconVariants = {
    hidden: { opacity: 0, scale: 0.6, y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0 
    },
    hover: { 
      scale: 1.15, 
      y: -5,
      transition: { duration: 0.2, ease: [0.42, 0, 0.58, 1] } // power2.out equivalent
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const badgeVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { duration: 0.6, delay: 0.1, ease: [0.37, 0.04, 0.29, 1.01] } // power3.out equivalent
    }
  };

  return (
    <section className="relative w-full overflow-hidden py-12 min-h-screen flex items-center justify-center">
      {/* Light Rays Background Effect */}
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

      {/* Gradient Overlay at Bottom */}
      <div className="pointer-events-none absolute left-0 bottom-0 w-full h-[200px] bg-gradient-to-t from-[#050505] via-[#05050580] to-transparent z-[1]" />
      
      {/* Lanyard 3D Component at Top */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={badgeVariants}
        className="absolute top-0 left-0 w-full h-[400px] sm:h-[500px] z-[3] pointer-events-auto"
      >      </motion.div>
      
      {/* Hero Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative flex flex-col items-center justify-center py-8 z-[2] w-full"
      >
        <motion.div variants={contentVariants}>
          <HeroContent />
        </motion.div>
        
        {/* Social Media Icons */}
        <motion.div 
          ref={el => { if (el) el.style.transform = 'translateZ(0)'; }} // Ensure the ref is still accessible if needed
          variants={socialVariants}
          className="flex items-center gap-6 mt-8"
        >
          {socialLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.label}
                ref={(el) => {
                  socialLinksRef.current[index] = el;
                }}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors duration-300"
                aria-label={link.label}
                variants={iconVariants}
                whileHover="hover"
                whileTap="tap"
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