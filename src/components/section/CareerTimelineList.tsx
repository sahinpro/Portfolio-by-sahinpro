import {
  scrollViewport,
  sectionEase,
} from "@/constants/scrollMotion";
import type { TimelineEntry } from "@/screens/sections/CareerJourneySection/careerJourneyData";
import { motion } from "framer-motion";

export const CareerTimelineList = ({
  entries,
}: {
  entries: TimelineEntry[];
}): JSX.Element => (
  <div className="relative space-y-0">
    <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/60 via-violet-500/25 to-transparent" />

    {entries.map((item, i) => {
      const Icon = item.icon;
      return (
        <motion.div
          key={item.year}
          initial={{ opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={scrollViewport}
          transition={{
            duration: 0.5,
            delay: i * 0.1,
            ease: sectionEase,
          }}
          className="relative flex gap-5 sm:gap-6 pb-10 last:pb-0 group"
        >
          <div
            className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-[#0a0a0a]
            border border-violet-500/40 flex items-center justify-center
            shadow-[0_0_20px_rgba(139,92,246,0.15)] group-hover:border-violet-400/60
            group-hover:shadow-[0_0_24px_rgba(139,92,246,0.25)] transition-all duration-300"
          >
            <Icon className="w-4 h-4 text-violet-400" />
          </div>

          <div className="pt-0.5 flex-1 min-w-0">
            <span className="inline-block text-xs font-semibold tracking-widest text-violet-400 mb-1">
              {item.year}
            </span>
            <h4 className="text-base sm:text-lg font-semibold text-white">
              {item.role}
            </h4>
            <p className="text-sm text-white/40 mb-2">{item.company}</p>
            <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
          </div>
        </motion.div>
      );
    })}
  </div>
);
