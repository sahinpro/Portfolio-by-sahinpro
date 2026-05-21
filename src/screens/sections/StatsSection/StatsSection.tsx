import { PortfolioStatCard } from "@/components/section";
import {
  fadeInUp,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import { motion } from "framer-motion";
import { portfolioStats } from "./statsData";

export const StatsSection = (): JSX.Element => {
  return (
    <section
      id="stats"
      className="container mx-auto w-full px-4 pb-6 sm:pb-10 -mt-4 sm:-mt-8 relative z-10"
    >
      <motion.div
        className="w-full max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={sectionReveal}
      >
        <motion.div
          variants={fadeInUp}
          className="grid w-full grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {portfolioStats.map((stat) => (
            <PortfolioStatCard key={stat.label} stat={stat} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
