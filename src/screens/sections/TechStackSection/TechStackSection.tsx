import { SectionHeader, SectionShell } from "@/components/sections";
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
import {
  TECH_STACK_DESCRIPTION,
  TECH_STACK_GROUPS,
} from "@/constants/techStack";
import { motion } from "framer-motion";
import { TechStackGitTree } from "./TechStackGitTree";

export const TechStackSection = (): JSX.Element => {
  return (
    <SectionShell id="tech-stack">
      <motion.div
        className={sectionMotionClass}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={sectionReveal}
      >
        <motion.div variants={fadeInUp} className={sectionHeaderWrapClass}>
          <SectionHeader
            title="Tech stack"
            description={TECH_STACK_DESCRIPTION}
          />
        </motion.div>

        <motion.div variants={fadeInUp} className={sectionContentClass}>
          <TechStackGitTree groups={TECH_STACK_GROUPS} />
        </motion.div>
      </motion.div>
    </SectionShell>
  );
};
