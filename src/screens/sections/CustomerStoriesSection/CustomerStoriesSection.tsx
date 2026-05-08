import type { TestimonialRow } from "@/admin/types/database";
import {
  fadeInUp,
  scrollViewport,
  sectionEase,
  sectionReveal,
} from "@/constants/scrollMotion";
import { usePublishedTestimonials } from "@/hooks/usePublishedTestimonials";
import { motion } from "framer-motion";
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

interface AvatarProps {
  testimonial: Testimonial;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

const Avatar = ({ testimonial, isActive, onClick, disabled }: AvatarProps) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      testimonial.author.name
    )}&background=7e22ce&color=fff&size=150`;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-0 border-none bg-transparent cursor-pointer 
        transition-all duration-300 ease-out flex-shrink-0
        w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
        rounded-xl overflow-hidden
        ${isActive 
          ? "scale-110 shadow-[0_0_0_2px_rgba(126,34,206,0.5),0_8px_24px_rgba(126,34,206,0.3)]" 
          : "hover:scale-105 hover:-translate-y-0.5"
        }
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
        disabled:cursor-not-allowed disabled:opacity-50
      `}
      aria-label={`View testimonial from ${testimonial.author.name}`}
      aria-pressed={isActive}
    >
      <img
        src={testimonial.author.avatar}
        alt={testimonial.author.name}
        onError={handleImageError}
        draggable={false}
        className={`
          w-full h-full object-cover transition-all duration-300
          ${isActive ? "grayscale-0 opacity-100" : "grayscale opacity-40 group-hover:opacity-70"}
        `}
      />
    </button>
  );
};

export const CustomerStoriesSection = (): JSX.Element => {
  const { rows, loading, error } = usePublishedTestimonials();
  const testimonials = useMemo(() => rows.map(mapRowToTestimonial), [rows]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [testimonials.length]);

  const safeIndex =
    testimonials.length === 0 ? 0 : Math.min(activeIndex, testimonials.length - 1);
  const activeTestimonial = testimonials[safeIndex];

  const changeTestimonial = useCallback(
    (newIndex: number) => {
      if (newIndex === safeIndex || isTransitioning || testimonials.length === 0) return;

      setIsTransitioning(true);
      setActiveIndex(newIndex);
      setIsTransitioning(false);
    },
    [safeIndex, isTransitioning, testimonials.length],
  );

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

  const avatarItemVariants = {
    hidden: { opacity: 0, scale: 0.78 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.34, ease: sectionEase },
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
        <p className="text-center text-white/35 text-sm">Loading testimonials…</p>
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
          <h2 className="section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] font-medium text-2xl sm:text-3xl md:text-4xl text-white">
            Customer Stories
          </h2>
          <p className="text-base sm:text-lg text-neutral-400 leading-relaxed">
            Client testimonials will show here once they are <strong className="text-white/80">published</strong> in
            your admin panel. Until then, this space stays open so the home layout stays balanced.
          </p>
          <p className="text-sm text-white/35">
            Working together?{" "}
            <Link to="/contact" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
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
              background: 'radial-gradient(circle, rgba(126, 34, 206, 0.15) 0%, transparent 70%)',
              filter: 'blur(80px)'
            }}
          />
          {/* Glow 2 */}
          <div 
            className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
              filter: 'blur(80px)'
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
          <h2 className="flex items-center justify-center self-stretch mt-[-1.00px] section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center tracking-[-1.00px] leading-tight sm:leading-[40px] md:leading-[48px] lg:leading-[56.0px]">
            Customer Stories
          </h2>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed text-neutral-400 max-w-[656px] mx-auto">
            Hear from clients and teams who've transformed their online presence
            and accelerated their business growth with my web solutions.
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
              backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
              backgroundSize: '64px 64px'
            }}
          />

          {/* Card Glows */}
          <div 
            className="absolute -top-20 -left-20 w-[300px] h-[300px] rounded-full"
            style={{
              background: 'rgba(126, 34, 206, 0.08)',
              filter: 'blur(60px)'
            }}
          />
          <div 
            className="absolute -bottom-20 -right-20 w-[300px] h-[300px] rounded-full"
            style={{
              background: 'rgba(168, 85, 247, 0.08)',
              filter: 'blur(60px)'
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
          <motion.div 
            ref={contentRef} 
            className="relative z-10 min-h-[300px] sm:min-h-[350px] md:min-h-[400px] flex flex-col justify-center items-center text-center"
            key={activeTestimonial?.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.42, 0, 0.58, 1] }}
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
        </motion.div>

        {/* Avatars */}
        <motion.div
          className="relative z-20 avatar-button flex justify-center items-center gap-3 sm:gap-4 md:gap-5 p-4 sm:p-5 md:p-0 bg-black/80 sm:bg-transparent border border-white/[0.08] sm:border-0 rounded-2xl backdrop-blur-xl sm:backdrop-blur-none max-w-fit mx-auto"
          variants={avatarRowVariants}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={avatarItemVariants}
            >
              <Avatar
                testimonial={testimonial}
                isActive={index === safeIndex}
                onClick={() => changeTestimonial(index)}
                disabled={isTransitioning}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Screen reader announcement */}
        <div className="sr-only" role="status" aria-live="polite">
          Showing testimonial {safeIndex + 1} of {testimonials.length}
        </div>
        </motion.div>
      </section>
    </>
  );
};