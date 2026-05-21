import {
  scrollViewport,
  sectionEase,
} from "@/constants/scrollMotion";
import type { TimelineEntry } from "@/screens/sections/CareerJourneySection/careerJourneyData";
import { motion } from "framer-motion";
import { CareerTimelineList } from "./CareerTimelineList";
import { SectionLabel } from "./SectionLabel";

const PROFILE_IMAGE = "/sahin.png";

const timelineCardClass =
  "rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0d0d0d] to-[#080808] p-6 sm:p-8 overflow-hidden relative h-full";

export const CareerJourneyPanel = ({
  entries,
  showImage = true,
  showMilestonesLabel = true,
  imageCaption = "Building the web one project at a time — WordPress to full stack.",
}: {
  entries: TimelineEntry[];
  showImage?: boolean;
  showMilestonesLabel?: boolean;
  imageCaption?: string;
}): JSX.Element => (
  <div
    className={
      showImage
        ? "w-full grid grid-cols-1 lg:grid-cols-[minmax(260px,340px)_1fr] gap-10 lg:gap-14 items-start"
        : "w-full"
    }
  >
    {showImage ? (
      <div className="flex flex-col items-center lg:items-start lg:sticky lg:top-28">
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
          <div className="relative p-1 rounded-2xl bg-gradient-to-br from-violet-500/30 via-white/10 to-purple-600/20">
            <img
              src={PROFILE_IMAGE}
              alt="Sahin Alam"
              className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none mx-auto lg:mx-0 aspect-[4/5] object-cover rounded-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            />
          </div>
        </motion.div>
        <p className="mt-5 text-center lg:text-left text-sm text-white/40 max-w-[280px] leading-relaxed">
          {imageCaption}
        </p>
      </div>
    ) : null}

    <div className="min-w-0">
      <div className={timelineCardClass}>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/[0.04] via-transparent to-purple-600/[0.03]"
          aria-hidden
        />
        <div className="relative">
          {showMilestonesLabel ? (
            <>
              <SectionLabel>Milestones</SectionLabel>
              <h3 className="mt-4 mb-6 text-xl sm:text-2xl font-bold text-white tracking-tight">
                Career path
              </h3>
            </>
          ) : null}
          <CareerTimelineList entries={entries} />
        </div>
      </div>
    </div>
  </div>
);
