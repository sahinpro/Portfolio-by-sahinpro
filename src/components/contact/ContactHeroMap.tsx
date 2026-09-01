"use client";

import { PROFILE } from "@/constants/profile";
import { motion } from "framer-motion";

const MAP_VIEWBOX = "0 0 2000 857";
const SYLHET_X = 1493;
const SYLHET_Y = 343;

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
      className="pointer-events-none absolute inset-x-0 top-[4.5rem] sm:top-8 mx-auto w-full max-w-container px-1 lg:px-4"
      aria-hidden
    >
      <div className="relative mx-auto aspect-[2000/857] w-full max-h-[600px]  lg:max-h-[700px]">
        {/* Layer 1 — the faded map artwork */}
        <svg
          viewBox={MAP_VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full opacity-[0.22] sm:opacity-[0.28] lg:opacity-[0.32]"
        >
          <image href="/world.svg" x={0} y={0} width={2000} height={857} />
        </svg>

        {/* Layer 2 — the marker, same viewBox/mapping so it's pixel-locked
            to layer 1, but with full independent opacity — never inherits
            or gets clamped by the map's faded look. */}
        <svg
          viewBox={MAP_VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <circle
            cx={SYLHET_X}
            cy={SYLHET_Y}
            r={9}
            className="animate-ping fill-emerald-400"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              opacity: 0.7,
            }}
          />
          <circle
            cx={SYLHET_X}
            cy={SYLHET_Y}
            r={7}
            className="fill-emerald-400"
            style={{ filter: "drop-shadow(0 0 8px rgba(52,211,153,0.95))" }}
          />
        </svg>

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

        <span className="sr-only">{PROFILE.location}</span>
      </div>
    </motion.div>
  );
}
