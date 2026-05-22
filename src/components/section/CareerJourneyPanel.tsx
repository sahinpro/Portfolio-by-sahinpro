import { PROFILE } from "@/constants/profile";
import { scrollViewport, sectionEase } from "@/constants/scrollMotion";
import type { TimelineEntry } from "@/screens/sections/CareerJourneySection/careerJourneyData";
import { motion } from "framer-motion";
import { CareerTimelineList } from "./CareerTimelineList";

const PROFILE_IMAGE = "/sahin.png";

const timelineCardClass =
  "rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0d0d0d] to-[#080808] p-6 sm:p-8 overflow-hidden relative h-full";

export const CareerJourneyPanel = ({
  entries,
  showImage = true,
  imageCaption = PROFILE.imageCaption,
}: {
  entries: TimelineEntry[];
  showImage?: boolean;
  showMilestonesLabel?: boolean;
  imageCaption?: string;
}): JSX.Element => (
  <div
    className={
      showImage
        ? "w-full flex flex-col lg:flex-row gap-10 lg:gap-14 items-center"
        : "w-full"
    }
  >
    {showImage ? (
      <div className="lg:w-1/3 w-full flex flex-col items-center justify-center ">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={scrollViewport}
          transition={{ duration: 0.6, ease: sectionEase }}
          className="relative w-full"
        >
          <div
            className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-blue-600/15 blur-2xl"
            aria-hidden
          />
          <div className="w-full h-full relative p-1 rounded-full bg-gradient-to-br from-violet-500/30 via-white/10 to-purple-600/20">
            <img
              src={PROFILE_IMAGE}
              alt="Sahin Alam"
              className="relative w-full h-full object-cover rounded-full border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            />
          </div>
        </motion.div>
        <p className="mt-5 text-center text-sm text-white/40 max-w-[480px] leading-relaxed">
          {imageCaption}
        </p>
      </div>
    ) : null}

    <div className="flex-1">
      <div className={timelineCardClass}>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/[0.04] via-transparent to-purple-600/[0.03]"
          aria-hidden
        />
        <div className="relative">
          <CareerTimelineList entries={entries} />
        </div>
      </div>
    </div>
  </div>
);
