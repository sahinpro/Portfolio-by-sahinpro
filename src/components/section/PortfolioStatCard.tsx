import { sectionEase } from "@/constants/scrollMotion";
import type { PortfolioStat } from "@/screens/sections/StatsSection/statsData";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useStatCountUp } from "./useStatCountUp";

const statCardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: sectionEase },
  },
};

type PortfolioStatCardProps = {
  stat: PortfolioStat;
};

export const PortfolioStatCard = ({
  stat,
}: PortfolioStatCardProps): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const reduceMotion = useReducedMotion();
  const displayValue = useStatCountUp(stat.value, inView && !reduceMotion);
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      variants={statCardVariants}
      className={`relative flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl border bg-gradient-to-br ${stat.color} ${stat.border}
      backdrop-blur-sm transition-shadow duration-300 group overflow-hidden
      `}
    >
      <motion.div
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
        initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
        animate={
          inView ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0 }
        }
        transition={{ duration: 0.4, delay: 0.15, ease: sectionEase }}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
      </motion.div>
      <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">
        {reduceMotion ? stat.value : displayValue}
      </p>
      <p className="text-xs sm:text-sm text-white/50 text-center leading-tight">
        {stat.label}
      </p>
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/[0.03] blur-xl pointer-events-none transition-opacity duration-300 group-hover:opacity-80" />
    </motion.div>
  );
};
