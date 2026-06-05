import ChromaGrid from "@/components/ChromaGrid";
import { SectionHeader, SectionShell } from "@/components/section";
import {
  sectionContentClass,
  sectionHeaderWrapClass,
  sectionMotionClass,
} from "@/constants/layout";
import {
  fadeInUp,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import { motion } from "framer-motion";

export const WhyChooseUsSection = (): JSX.Element => {
  return (
    <SectionShell>
      <motion.div
        className={sectionMotionClass}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={sectionReveal}
      >
        <motion.div variants={fadeInUp} className={sectionHeaderWrapClass}>
          <SectionHeader
            title="Why choose me"
            description="Trusted by agencies and direct clients for quality delivery, on-time launches, and reliable support."
          />
        </motion.div>

        <motion.div variants={fadeInUp} className={sectionContentClass}>
          <ChromaGrid />
        </motion.div>
      </motion.div>
    </SectionShell>
  );
};
