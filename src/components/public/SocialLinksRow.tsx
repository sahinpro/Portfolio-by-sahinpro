import { SocialLinkGlyph } from "@/components/public/socialLinkIcon";
import { getSocialBrand } from "@/components/public/socialBrands";
import {
  scrollViewport,
  socialLinkFade,
  socialLinkStagger,
} from "@/constants/scrollMotion";
import { useVisibleSocialLinks } from "@/hooks/useVisibleSocialLinks";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

type Size = "hero" | "footer" | "contact";

type SocialLinksRowProps = {
  size: Size;
  delay?: number;
  variants?: Variants;
  animate?: boolean;
};

const sizeClasses: Record<
  Size,
  { wrap: string; iconWrap: string; glyph: string }
> = {
  hero: {
    wrap: "flex items-center gap-2 mt-8",
    iconWrap:
      "group w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-200",
    glyph: "w-4 h-4",
  },
  footer: {
    wrap: "flex items-center gap-2 mt-2",
    iconWrap:
      "group w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-200",
    glyph: "w-4 h-4",
  },
  contact: {
    wrap: "flex gap-2",
    iconWrap:
      "group w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-200",
    glyph: "w-4 h-4",
  },
};

const defaultDelays: Record<Size, number> = {
  hero: 0.52,
  footer: 0.08,
  contact: 0.42,
};

export function SocialLinksRow({
  size,
  delay,
  variants,
  animate: animateProp,
}: SocialLinksRowProps): JSX.Element | null {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, scrollViewport);
  const { links, loading } = useVisibleSocialLinks();
  const cls = sizeClasses[size];
  const isReady = !loading || links.length > 0;
  const shouldShow = animateProp ?? inView;
  const rowDelay = delay ?? defaultDelays[size];
  const useParentVariants = Boolean(variants);
  const isVisible = shouldShow && isReady;

  if (!loading && links.length === 0) {
    return null;
  }

  if (loading && links.length === 0) {
    return <div className={`${cls.wrap} min-h-[32px]`} aria-hidden />;
  }

  if (useParentVariants) {
    return (
      <motion.div
        ref={ref}
        className={cls.wrap}
        variants={variants}
        animate={isReady ? undefined : "hidden"}
      >
        {links.map((link) => {
          const { brandColor, bg } = getSocialBrand(link);
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.platform}
              aria-label={link.platform}
              className={`${cls.iconWrap} ${bg}`}
              style={{ ["--brand-color" as string]: brandColor }}
            >
              <span className="text-zinc-400 transition-colors duration-200 group-hover:[color:var(--brand-color)]">
                <SocialLinkGlyph link={link} className={cls.glyph} />
              </span>
            </a>
          );
        })}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cls.wrap}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={socialLinkStagger(rowDelay)}
    >
      {links.map((link) => {
        const { brandColor, bg } = getSocialBrand(link);
        return (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.platform}
            aria-label={link.platform}
            className={`${cls.iconWrap} ${bg}`}
            style={{ ["--brand-color" as string]: brandColor }}
            variants={socialLinkFade}
          >
            <span className="text-zinc-400 transition-colors duration-200 group-hover:[color:var(--brand-color)]">
              <SocialLinkGlyph link={link} className={cls.glyph} />
            </span>
          </motion.a>
        );
      })}
    </motion.div>
  );
}
