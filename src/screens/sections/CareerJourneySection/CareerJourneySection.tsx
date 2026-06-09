import {
  CareerJourneyPanel,
  SectionHeader,
  SectionShell,
} from "@/components/sections";
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
import { careerTimeline, JOURNEY_DESCRIPTION } from "./careerJourneyData";

export const CareerJourneySection = (): JSX.Element => {
  return (
    <SectionShell id="journey">
      <motion.div
        className={sectionMotionClass}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={sectionReveal}
      >
        <motion.div variants={fadeInUp} className={sectionHeaderWrapClass}>
          <SectionHeader
            title="Career timeline"
            description={JOURNEY_DESCRIPTION}
          />
        </motion.div>

        <motion.div variants={fadeInUp} className={sectionContentClass}>
          <CareerJourneyPanel entries={careerTimeline} />
        </motion.div>
      </motion.div>
    </SectionShell>
  );
};
