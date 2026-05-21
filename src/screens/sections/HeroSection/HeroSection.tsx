import LightRays from "@/components/LightRays";
import { getSocialBrand } from "@/components/public/socialBrands";
import { SocialLinkGlyph } from "@/components/public/socialLinkIcon";
import { useVisibleSocialLinks } from "@/hooks/useVisibleSocialLinks";
import { AboutCodeWindow } from "@/screens/sections/AboutCodeSection/AboutCodeWindow";
import { motion } from "framer-motion";
import { useRef } from "react";
import { HeroContent } from "./HeroContent";

export const HeroSection = (): JSX.Element => {
  const socialLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const { links: socialLinks, loading: socialLoading } =
    useVisibleSocialLinks();

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.37, 0.04, 0.29, 1.01] },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.65,
        delay: 0.1,
        ease: [0.37, 0.04, 0.29, 1.01],
      },
    },
  };

  const editorVariants = {
    hidden: { opacity: 0, x: 24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, delay: 0.2, ease: [0.37, 0.04, 0.29, 1.01] },
    },
  };

  const socialVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.45,
        staggerChildren: 0.07,
      },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.6, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.37, 0.04, 0.29, 1.01] },
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
    <section className="relative w-full overflow-hidden min-h-screen flex items-center pt-24 sm:pt-28 pb-12 lg:pb-16">
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
        variants={containerVariants}
        className="relative z-[2] container mx-auto px-4 "
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 xl:gap-16 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div variants={contentVariants} className="w-full">
              <HeroContent />
            </motion.div>

            <motion.div
              variants={socialVariants}
              className="flex items-center justify-center lg:justify-start gap-2 mt-8 min-h-[32px] w-full"
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
          </div>

          <motion.div variants={editorVariants} className="w-full min-w-0">
            <AboutCodeWindow startOnMount />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
