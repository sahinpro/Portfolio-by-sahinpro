import type { TestimonialRow } from "@/admin/types/database";
import {
  fadeInUp,
  scrollViewport,
  sectionEase,
  sectionReveal,
} from "@/constants/scrollMotion";
import { usePublishedTestimonials } from "@/hooks/usePublishedTestimonials";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface Author {
  name: string;
  role: string;
  company: string;
  avatar: string;
}

interface Testimonial {
  id: string;
  author: Author;
  quote: string;
  highlightedQuote: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mapRowToTestimonial(row: TestimonialRow): Testimonial {
  const hq = row.highlighted_quote?.trim();
  const fallbackHighlight = `<span class="text-white/95">${escapeHtml(row.quote)}</span>`;
  return {
    id: row.id,
    author: {
      name: row.author_name,
      role: row.author_role ?? "",
      company: row.author_company ?? "",
      avatar:
        row.author_avatar?.trim() ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(row.author_name)}&background=7e22ce&color=fff&size=150`,
    },
    quote: row.quote,
    highlightedQuote: hq ? hq : fallbackHighlight,
  };
}

const AVATAR_GAP = 16;
const LOOP_COPIES = 3;
const CAROUSEL_EASE = [0.37, 0.04, 0.29, 1.01] as const;

interface AvatarProps {
  testimonial: Testimonial;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

const Avatar = ({ testimonial, isActive, onClick, disabled }: AvatarProps) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      testimonial.author.name,
    )}&background=7e22ce&color=fff&size=150`;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-avatar-item
      className={`
        group relative p-0 border-none bg-transparent cursor-pointer flex-shrink-0
        w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl
        transition-[transform,opacity] duration-500 ease-out
        ${isActive ? "scale-110 z-10" : "scale-95 opacity-70 hover:opacity-90 hover:scale-[0.98]"}
        ${disabled ? "cursor-not-allowed pointer-events-none" : ""}
        disabled:cursor-not-allowed
      `}
      aria-label={`View testimonial from ${testimonial.author.name}`}
      aria-pressed={isActive}
    >
      <span
        className={`
          relative block w-full h-full rounded-[11px] sm:rounded-xl overflow-hidden border transition-all duration-500
          ${isActive ? "border-white/25 shadow-[0_8px_28px_rgba(139,92,246,0.35)]" : "border-white/10"}
        `}
      >
        <img
          src={testimonial.author.avatar}
          alt={testimonial.author.name}
          onError={handleImageError}
          draggable={false}
          className={`
            w-full h-full object-cover transition-all duration-500
            ${isActive ? "grayscale-0 brightness-100" : "grayscale brightness-75 group-hover:brightness-90"}
          `}
        />
      </span>
    </button>
  );
};

interface AvatarCarouselProps {
  testimonials: Testimonial[];
  virtualIndex: number;
  instant: boolean;
  disabled: boolean;
  onSelect: (realIndex: number) => void;
  onSlideComplete: () => void;
}

const AvatarCarousel = ({
  testimonials,
  virtualIndex,
  instant,
  disabled,
  onSelect,
  onSlideComplete,
}: AvatarCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [itemSize, setItemSize] = useState(56);

  const loopItems = useMemo(
    () => Array.from({ length: LOOP_COPIES }, () => testimonials).flat(),
    [testimonials],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      setContainerWidth(container.offsetWidth);
      const item = container.querySelector<HTMLElement>("[data-avatar-item]");
      if (item) setItemSize(item.offsetWidth);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [testimonials.length]);

  const stride = itemSize + AVATAR_GAP;
  const trackX =
    containerWidth > 0
      ? containerWidth / 2 - itemSize / 2 - virtualIndex * stride
      : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[min(100%,36rem)] mx-auto overflow-hidden py-1"
      aria-hidden={false}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 sm:w-28 bg-gradient-to-r from-[var(--bg-primary)] from-0% via-[var(--bg-primary)] via-[62%] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 sm:w-28 bg-gradient-to-l from-[var(--bg-primary)] from-0% via-[var(--bg-primary)] via-[62%] to-transparent"
        aria-hidden
      />

      <motion.div
        className="flex items-center will-change-transform"
        style={{ gap: AVATAR_GAP }}
        animate={{ x: trackX }}
        transition={{
          duration: instant ? 0 : 0.55,
          ease: CAROUSEL_EASE,
        }}
        onAnimationComplete={() => {
          if (!instant) onSlideComplete();
        }}
      >
        {loopItems.map((testimonial, idx) => (
          <Avatar
            key={`${testimonial.id}-${idx}`}
            testimonial={testimonial}
            isActive={idx === virtualIndex}
            onClick={() => onSelect(idx % testimonials.length)}
            disabled={disabled}
          />
        ))}
      </motion.div>
    </div>
  );
};

export const CustomerStoriesSection = (): JSX.Element => {
  const { rows, loading, error } = usePublishedTestimonials();
  const testimonials = useMemo(() => rows.map(mapRowToTestimonial), [rows]);

  const count = testimonials.length;
  const [virtualIndex, setVirtualIndex] = useState(count);
  const [instant, setInstant] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVirtualIndex(count);
    setInstant(false);
    setIsTransitioning(false);
  }, [count]);

  const activeIndex = count === 0 ? 0 : virtualIndex % count;
  const activeTestimonial = testimonials[activeIndex];

  const goToIndex = useCallback(
    (targetIndex: number) => {
      if (count === 0 || isTransitioning) return;

      const current = virtualIndex % count;
      if (targetIndex === current) return;

      let delta = targetIndex - current;
      if (Math.abs(delta) > count / 2) {
        delta += delta > 0 ? -count : count;
      }

      setInstant(false);
      setIsTransitioning(true);
      setVirtualIndex((prev) => prev + delta);
    },
    [count, virtualIndex, isTransitioning],
  );

  const handleSlideComplete = useCallback(() => {
    if (count === 0) return;

    setIsTransitioning(false);

    if (virtualIndex < count) {
      setInstant(true);
      setVirtualIndex((prev) => prev + count);
      requestAnimationFrame(() => setInstant(false));
      return;
    }

    if (virtualIndex >= count * 2) {
      setInstant(true);
      setVirtualIndex((prev) => prev - count);
      requestAnimationFrame(() => setInstant(false));
    }
  }, [count, virtualIndex]);

  const avatarRowVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        staggerChildren: 0.07,
        delayChildren: 0.04,
        ease: sectionEase,
      },
    },
  };

  if (loading && testimonials.length === 0) {
    return (
      <section
        className="relative w-full max-w-[1440px] mx-auto px-4 py-10 sm:px-8 lg:px-12 lg:py-14"
        aria-busy="true"
        aria-label="Loading testimonials"
      >
        <div className="text-center mb-12 md:mb-16 space-y-4 animate-pulse">
          <div className="h-10 max-w-md mx-auto rounded-lg bg-white/10" />
          <div className="h-5 max-w-[656px] mx-auto rounded bg-white/[0.06]" />
        </div>
        <div className="max-w-[1100px] mx-auto mb-10 rounded-3xl border border-white/[0.08] p-8 sm:p-12 min-h-[320px] animate-pulse space-y-6">
          <div className="h-6 w-full max-w-2xl mx-auto rounded bg-white/[0.06]" />
          <div className="h-6 w-full max-w-xl mx-auto rounded bg-white/[0.06]" />
          <div className="h-6 w-3/4 mx-auto rounded bg-white/[0.05]" />
          <div className="flex justify-center gap-4 pt-8">
            <div className="h-14 w-14 rounded-xl bg-white/10" />
            <div className="h-14 w-14 rounded-xl bg-white/10" />
            <div className="h-14 w-14 rounded-xl bg-white/10" />
          </div>
        </div>
        <p className="text-center text-white/35 text-sm">
          Loading testimonials…
        </p>
      </section>
    );
  }

  if (error && testimonials.length === 0) {
    return (
      <section className="relative w-full max-w-[1440px] mx-auto px-4 py-12 sm:px-8 lg:px-12 text-center text-red-400/80 text-sm">
        Could not load testimonials.
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section
        id="testimonials"
        className="relative w-full max-w-[1440px] mx-auto px-4 py-12 sm:px-8 lg:px-12 lg:py-16"
        aria-label="Customer testimonials"
      >
        <div className="max-w-[656px] mx-auto text-center space-y-4">
          <h2 className="section-heading [font-family:'Inter_Display-Medium',Helvetica] font-medium text-2xl sm:text-3xl md:text-4xl text-white">
            Customer Stories
          </h2>
          <p className="text-base sm:text-lg text-neutral-400 leading-relaxed">
            Client testimonials will show here once they are{" "}
            <strong className="text-white/80">published</strong> in your admin
            panel. Until then, this space stays open so the home layout stays
            balanced.
          </p>
          <p className="text-sm text-white/35">
            Working together?{" "}
            <Link
              to="/contact"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
            >
              Get in touch
            </Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        id="testimonials"
        className="relative w-full max-w-[1440px] mx-auto px-4 py-10 sm:px-8 lg:px-12 lg:py-14 "
        aria-label="Customer testimonials"
      >
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Glow 1 */}
          <div
            className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(126, 34, 206, 0.15) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          {/* Glow 2 */}
          <div
            className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
        </div>

        <motion.div
          className="relative z-[1] w-full"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={sectionReveal}
        >
          {/* Header */}
          <motion.div
            className="section-header text-center mb-12 md:mb-16"
            variants={fadeInUp}
          >
            <h2 className="flex items-center justify-center self-stretch mt-[-1.00px] section-heading [font-family:'Inter_Display-Medium',Helvetica] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center tracking-[-1.00px] leading-tight sm:leading-[40px] md:leading-[48px] lg:leading-[56.0px]">
              Customer Stories
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-neutral-400 max-w-[656px] mx-auto">
              Hear from clients and teams who've transformed their online
              presence and accelerated their business growth with my web
              solutions.
            </p>
          </motion.div>

          {/* Testimonial Card */}
          <motion.div
            className="testimonial-card relative max-w-[1100px] mx-auto mb-10 sm:mb-12 p-8 sm:p-12 md:p-14 lg:p-16 bg-gradient-to-br from-[rgba(15,15,15,0.6)] to-[rgba(10,10,10,0.6)] border border-white/[0.08] rounded-3xl backdrop-blur-xl overflow-hidden"
            variants={fadeInUp}
          >
            {/* Card Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
              }}
            />

            {/* Card Glows */}
            <div
              className="absolute -top-20 -left-20 w-[300px] h-[300px] rounded-full"
              style={{
                background: "rgba(126, 34, 206, 0.08)",
                filter: "blur(60px)",
              }}
            />
            <div
              className="absolute -bottom-20 -right-20 w-[300px] h-[300px] rounded-full"
              style={{
                background: "rgba(168, 85, 247, 0.08)",
                filter: "blur(60px)",
              }}
            />

            {/* Quote Icon */}
            <svg
              className="absolute top-6 left-6 w-12 h-12 sm:w-16 sm:h-16 opacity-[0.08]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M7 7h3v10H5V9a2 2 0 0 1 2-2Zm9 0h3v10h-5V9a2 2 0 0 1 2-2Z" />
            </svg>

            {/* Content */}
            <div
              ref={contentRef}
              className="relative z-10 min-h-[300px] sm:min-h-[350px] md:min-h-[400px] flex flex-col justify-center items-center text-center overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial?.id}
                  className="flex flex-col items-center text-center w-full"
                  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease: CAROUSEL_EASE }}
                >
                  <blockquote className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light leading-snug text-white/95 mb-8 sm:mb-10 max-w-[900px]">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: activeTestimonial?.highlightedQuote ?? "",
                      }}
                    />
                  </blockquote>

                  <div className="flex flex-col items-center gap-1">
                    <cite className="text-base sm:text-lg font-semibold text-white/95 not-italic">
                      {activeTestimonial?.author.name}
                    </cite>
                    <span className="text-sm sm:text-base text-white/50">
                      {activeTestimonial?.author.role}
                      {activeTestimonial?.author.company
                        ? `, ${activeTestimonial.author.company}`
                        : ""}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Avatar carousel    active item stays centered, infinite loop */}
          <motion.div
            className="relative z-20 avatar-button mx-auto px-4 sm:px-6 py-4 sm:py-5 rounded-2xl backdrop-blur-xl max-w-[min(100%,40rem)]"
            variants={avatarRowVariants}
          >
            <AvatarCarousel
              testimonials={testimonials}
              virtualIndex={virtualIndex}
              instant={instant}
              disabled={isTransitioning || count <= 1}
              onSelect={goToIndex}
              onSlideComplete={handleSlideComplete}
            />
          </motion.div>

          {/* Screen reader announcement */}
          <div className="sr-only" role="status" aria-live="polite">
            Showing testimonial {activeIndex + 1} of {testimonials.length}:{" "}
            {activeTestimonial?.author.name}
          </div>
        </motion.div>
      </section>
    </>
  );
};
