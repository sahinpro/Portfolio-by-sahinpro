"use client";

import type { TestimonialRow } from "@/admin/types/database";
import { ProjectTestimonialCard } from "@/components/projects/ProjectTestimonialCard";
import { SectionLabel } from "@/components/sections/SectionLabel";
import {
  fadeInUp,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import { usePublicTestimonials } from "@/hooks/usePublicTestimonials";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const AUTOPLAY_MS = 6000;

const controlBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/0 text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

export function TestimonialsSection({
  initialTestimonials = [],
}: {
  initialTestimonials?: TestimonialRow[];
}): JSX.Element | null {
  const { testimonials } = usePublicTestimonials(initialTestimonials);
  const reduceMotion = useReducedMotion() === true;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;
  const current = testimonials[index] ?? testimonials[0];
  const canSlide = count > 1;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (!canSlide || paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [canSlide, count, paused, reduceMotion]);

  if (count === 0 || !current) return null;

  return (
    <section
      id="testimonials"
      className="relative w-full py-10 "
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <motion.div
        className="relative overflow-hidden rounded-3xl container mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={sectionReveal}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/5"
        />

        <div className="relative w-full flex flex-col lg:flex-row gap-8 md:gap-16">
          <motion.div variants={fadeInUp} className="lg:w-1/2">
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="mt-6 text-4xl font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
              What clients say after I deliver
            </h2>
            <p className="mt-6 text-base text-neutral-400 sm:text-lg">
              Direct feedback from clients on the work delivered — clear
              process, on-time delivery, and measurable results.
            </p>

            {canSlide ? (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  className={controlBtn}
                  onClick={() => goTo(index - 1)}
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Next testimonial"
                  className={controlBtn}
                  onClick={() => goTo(index + 1)}
                >
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </button>
              </div>
            ) : null}
          </motion.div>

          <motion.div variants={fadeInUp} className="lg:w-1/2">
            <div
              className="relative w-full min-h-[16rem] sm:min-h-[18rem]"
              aria-live="polite"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id ?? `${current.quote}-${index}`}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.15 }}
                >
                  <ProjectTestimonialCard testimonial={current} />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
