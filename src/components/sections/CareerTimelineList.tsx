import {
  fadeInUp,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import type { TimelineEntry } from "@/screens/sections/CareerJourneySection/careerJourneyData";
import { motion } from "framer-motion";

export const CareerTimelineList = ({
  entries,
}: {
  entries: TimelineEntry[];
}): JSX.Element => (
  <motion.div
    className="relative"
    initial="hidden"
    whileInView="visible"
    viewport={scrollViewport}
    variants={sectionReveal}
  >
    <div
      className="absolute left-5 top-5 bottom-5 w-px -translate-x-1/2 bg-gradient-to-b from-green-500/60 via-green-500/25 to-transparent"
      aria-hidden
    />

    {entries.map((item) => {
      const Icon = item.icon;
      return (
        <motion.div
          key={`${item.year}-${item.company}`}
          variants={fadeInUp}
          className="relative flex items-start gap-5 sm:gap-6 pb-10 last:pb-0 group"
        >
          <div
            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a]
            border border-green-500/40
            shadow-[0_0_20px_rgba(139,92,246,0.15)] group-hover:border-green-400/60
            group-hover:shadow-[0_0_24px_rgba(139,92,246,0.25)] transition-all duration-300"
          >
            <Icon className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="min-w-0 flex-1 pt-3">
            <span className="inline-block text-xs font-semibold tracking-widest text-emerald-500 mb-1">
              {item.year}
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              {item.role}
            </h3>
            <p className="text-sm text-zinc-400 mb-2">{item.company}</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{item.desc}</p>
          </div>
        </motion.div>
      );
    })}
  </motion.div>
);
