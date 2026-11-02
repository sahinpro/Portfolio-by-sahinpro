import { CTAButton } from "@/components/common/CTAButton";
import { SocialLinksRow } from "@/components/public/SocialLinksRow";
import {
  heroCopyColumn,
  heroCtaStagger,
  heroFadeStep,
  heroItem,
} from "@/constants/scrollMotion";
import { motion } from "framer-motion";
import { HeroDescription } from "./HeroDescription";
import { HeroSubtitle } from "./HeroSubtitle";
import { HeroTitle } from "./HeroTitle";

export const HeroContent = (): JSX.Element => {
  return (
    <motion.div
      variants={heroCopyColumn}
      className="flex flex-col items-center lg:items-start gap-7 w-full max-w-xl lg:max-w-2xl"
    >
      <motion.div variants={heroItem} className="w-full">
        <HeroTitle />
      </motion.div>

      <motion.div variants={heroItem} className="w-full">
        <HeroSubtitle />
      </motion.div>

      <motion.div variants={heroItem}>
        <HeroDescription />
      </motion.div>

      <motion.div variants={heroItem}>
        <motion.div
          variants={heroCtaStagger}
          className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 lg:justify-start lg:gap-3 min-h-10"
        >
          <motion.div variants={heroFadeStep}>
            <CTAButton
              className="px-2.5 sm:px-3.5 text-sm lg:text-md font-medium"
              href="/contact?topic=free-website-check"
              variant="primary"
            >
              Get a free website check
            </CTAButton>
          </motion.div>

          <motion.div variants={heroFadeStep}>
            <CTAButton
              className="px-2.5 sm:px-3.5 text-sm lg:text-md font-medium"
              href="/projects"
              variant="secondary"
            >
              View my work
            </CTAButton>
          </motion.div>
        </motion.div>
      </motion.div>

      <SocialLinksRow size="hero" variants={heroItem} />
    </motion.div>
  );
};
