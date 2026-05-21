import {
  CareerJourneyPanel,
  SectionHeader,
} from "@/components/section";
import Glow from "@/components/ui/glow";
import {
  fadeInUp,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import { motion } from "framer-motion";
import { careerTimeline } from "./careerJourneyData";

const JOURNEY_DESCRIPTION =
  "From self-taught beginnings to agency work — building real products and growing with every project.";

export const CareerJourneySection = (): JSX.Element => {
  return (
    <section
      id="journey"
      className="relative flex flex-col container mx-auto items-center gap-12 px-4 py-10 sm:py-14 w-full"
    >
      <Glow variant="center" className="-z-20 blur-3xl opacity-60" />

      <motion.div
        className="flex flex-col w-full max-w-6xl items-center gap-12 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={sectionReveal}
      >
        <motion.div variants={fadeInUp} className="w-full max-w-3xl">
          <SectionHeader
            label="Journey"
            title="Career timeline"
            description={JOURNEY_DESCRIPTION}
          />
        </motion.div>

        <motion.div variants={fadeInUp} className="w-full">
          <CareerJourneyPanel entries={careerTimeline} />
        </motion.div>
      </motion.div>
    </section>
  );
};
