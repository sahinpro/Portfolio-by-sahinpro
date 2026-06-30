"use client";

import { PROFILE } from "@/constants/profile";
import { motion } from "framer-motion";

/** Sylhet, Bangladesh on Simplemaps world.svg (2000×857 viewBox). */
const MARKER_LEFT_PERCENT = 75.5;
const MARKER_TOP_PERCENT = 36.2;

const mapReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.37, 0.04, 0.29, 1.01] as const },
  },
};

type ContactHeroMapProps = {
  visible: boolean;
};

export function ContactHeroMap({ visible }: ContactHeroMapProps): JSX.Element {
  return (
    <motion.div
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      variants={mapReveal}
      className="pointer-events-none absolute inset-x-0 top-[4.5rem] sm:top-8 mx-auto w-full max-w-6xl px-4"
      aria-hidden
    >
      <div className="relative mx-auto aspect-[2000/857] w-full max-h-[200px] sm:max-h-[280px] lg:max-h-[360px]">
        <img
          src="/world.svg"
          alt=""
          className="absolute inset-0 h-full w-full object-contain opacity-[0.22] sm:opacity-[0.28] lg:opacity-[0.32]"
        />

        {/* Radial vignette — spotlight on center */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 65% at 50% 42%, transparent 0%, rgba(5,5,5,0.35) 55%, rgba(5,5,5,0.92) 100%)",
          }}
        />

        {/* Brand tint */}
        <div className="absolute inset-0 bg-violet-600/[0.04] mix-blend-soft-light" />

        {/* Bottom fade into page */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />

        {/* Top fade under nav */}
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#050505]/60 to-transparent" />

        {/* Location marker — Bangladesh */}
        <div
          className="absolute z-10"
          style={{
            left: `${MARKER_LEFT_PERCENT}%`,
            top: `${MARKER_TOP_PERCENT}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span className="sr-only">{PROFILE.location}</span>
          <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] sm:h-3 sm:w-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
