import LightRays from "@/components/LightRays";
import { SocialLinkGlyph } from "@/components/public/socialLinkIcon";
import { getSocialBrand } from "@/components/public/socialBrands";
import { useVisibleSocialLinks } from "@/hooks/useVisibleSocialLinks";
import { motion } from "framer-motion";
import { useRef } from "react";
import { HeroContent } from "./HeroContent";

export const HeroSection = (): JSX.Element => {
  const socialLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const { links: socialLinks, loading: socialLoading } = useVisibleSocialLinks();

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

  const badgeVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, delay: 0.1, ease: [0.37, 0.04, 0.29, 1.01] },
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
          className="flex items-center gap-2 mt-8 min-h-[32px]"
        >
          {!socialLoading || socialLinks.length > 0
            ? socialLinks.map((link, index) => {
                const { brandColor, bg } = getSocialBrand(link);
                return (
                  <motion.a
                    key={link.id}
                    ref={(el) => {
                      socialLinksRef.current[index] = el;
                    }}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.platform}
                    aria-label={link.platform}
                    variants={iconVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className={`group w-8 h-8 rounded-xl bg-white/5 border border-white/10
                  flex items-center justify-center ${bg}
                  transition-all duration-200`}
                    style={{ ["--brand-color" as string]: brandColor }}
                  >
                    <span className="text-white/40 transition-colors duration-200 group-hover:[color:var(--brand-color)]">
                      <SocialLinkGlyph link={link} />
                    </span>
                  </motion.a>
                );
              })
            : null}
        </motion.div>
      </motion.div>
    </section>
  );
};
