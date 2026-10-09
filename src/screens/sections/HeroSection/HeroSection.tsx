import { AuroraBackground } from "@/components/effects/AuroraBackground";
import { PublicImage } from "@/components/ui/PublicImage";
import { editorItem, heroContainer } from "@/constants/scrollMotion";
import { HeroContent } from "@/screens/sections/HeroSection/HeroContent";
import { motion, useReducedMotion } from "framer-motion";

export const HeroSection = (): JSX.Element => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      className="relative flex w-full flex-1 items-center overflow-hidden pt-24 sm:pt-28 pb-6 sm:pb-8"
      variants={heroContainer}
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
    >
      <div className="absolute inset-0 w-full h-full z-0">
        <AuroraBackground />
      </div>

      <div className="pointer-events-none absolute left-0 bottom-0 w-full h-[200px] bg-gradient-to-t from-[#050505] via-[#05050580] to-transparent z-[1]" />

      <div className="relative z-[2] container mx-auto px-1 lg:px-4 pt-5">
        <div className="relative flex flex-col lg:flex-row gap-0 lg:gap-12 xl:gap-16 justify-between items-center max-lg:items-stretch max-lg:pt-2 max-lg:pb-4">
          <div className="order-2 lg:order-1 relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-auto max-lg:px-1 mb-10 lg:mb-0">
            <HeroContent />
          </div>

          <motion.div
            variants={editorItem}
            className="order-1 lg:order-2 relative z-0 w-full min-w-0 lg:w-1/2"
          >
            <PublicImage
              src="/hero.png"
              alt="Isometric illustration of a customer, integrator platform, and connected business apps"
              width={758}
              height={538}
              priority
              sizes="(max-width: 1024px) 94vw, 50vw"
              className="h-auto w-full object-contain pointer-events-none select-none origin-center"
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
