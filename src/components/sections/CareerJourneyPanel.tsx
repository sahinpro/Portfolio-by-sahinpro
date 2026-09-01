import { PublicImage } from "@/components/ui/PublicImage";
import { scrollViewport, sectionEase } from "@/constants/scrollMotion";
import { PROFILE_PORTRAIT } from "@/lib/seoImages";
import type { TimelineEntry } from "@/screens/sections/CareerJourneySection/careerJourneyData";
import { motion } from "framer-motion";
import { CareerTimelineList } from "./CareerTimelineList";

const PROFILE_IMAGE = PROFILE_PORTRAIT.path;

const timelineCardClass = "p-0 lg:p-6 sm:p-8 overflow-hidden relative h-full";

export const CareerJourneyPanel = ({
  entries,
  showImage = true,
}: {
  entries: TimelineEntry[];
  showImage?: boolean;
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
            className="pointer-events-none absolute -inset-4 rounded-full  blur-2xl"
            aria-hidden
          />
          <div className="w-full h-full relative p-1 rounded-full bg-gradient-to-br from-violet-500/30 via-white/10 to-purple-600/20">
            <PublicImage
              src={PROFILE_IMAGE}
              alt={PROFILE_PORTRAIT.alt}
              width={PROFILE_PORTRAIT.width}
              height={PROFILE_PORTRAIT.height}
              sizes="(max-width: 900px) 50vw, 25vw"
              className="relative w-full h-full object-cover rounded-full border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            />
          </div>
        </motion.div>
      </div>
    ) : null}

    <div className="flex-1">
      <div className={timelineCardClass}>
        <div className="relative">
          <CareerTimelineList entries={entries} />
        </div>
      </div>
    </div>
  </div>
);
