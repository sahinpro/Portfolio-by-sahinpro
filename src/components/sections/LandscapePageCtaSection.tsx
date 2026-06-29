import { scrollViewport } from "@/constants/scrollMotion";
import { motion, useInView } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";

export const CTA_BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=700&fit=crop&q=80";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.37, 0.04, 0.29, 1.01] },
  },
};

export type LandscapePageCtaSectionProps = {
  title: string;
  description: string;
  eyebrow?: ReactNode;
  actions: ReactNode;
  backgroundImage?: string;
  className?: string;
};

export const LandscapePageCtaSection = ({
  title,
  description,
  eyebrow,
  actions,
  backgroundImage = CTA_BACKGROUND_IMAGE,
  className,
}: LandscapePageCtaSectionProps): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, scrollViewport);

  return (
    <section className={`w-full pb-10 ${className ?? ""}`}>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={fadeUp}
        className="container mx-auto px-4"
      >
        <div
          className="relative rounded-3xl border border-white/[0.08] p-10 md:p-14 overflow-hidden flex flex-col
            justify-center gap-8 min-h-[400px]"
        >
          <img
            src={backgroundImage}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/75 to-[#050505]/45"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505]/70 via-transparent to-[#050505]/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -top-20 left-1/3 w-64 h-64
              bg-violet-600/15 rounded-full blur-3xl"
            aria-hidden
          />

          <div className="relative z-10">
            {eyebrow ? <div className="mb-4">{eyebrow}</div> : null}
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              {title}
            </h3>
            <p className="text-zinc-300 max-w-xl leading-relaxed">
              {description}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 flex-shrink-0">
            {actions}
          </div>
        </div>
      </motion.div>
    </section>
  );
};
