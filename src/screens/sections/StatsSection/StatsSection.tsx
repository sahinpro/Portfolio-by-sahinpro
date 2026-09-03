import { PortfolioStatCard } from "@/components/sections";
import { scrollViewport, sectionReveal } from "@/constants/scrollMotion";
import { motion } from "framer-motion";
import { portfolioStats } from "./statsData";

export const StatsSection = (): JSX.Element => {
  return (
    <section
      id="stats"
      className="container relative z-10 mx-auto w-full shrink-0 px-4 pb-8 pt-2 sm:pb-12 scroll-section"
    >
      <motion.div
        className="w-full max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={sectionReveal}
      >
        {portfolioStats.map((stat) => (
          <PortfolioStatCard key={stat.label} stat={stat} />
        ))}
      </motion.div>
    </section>
  );
};
