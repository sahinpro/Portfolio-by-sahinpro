import { getSocialBrand } from "@/components/public/socialBrands";
import { SocialLinkGlyph } from "@/components/public/socialLinkIcon";
import {
  scrollViewport,
  socialLinkFade,
  socialLinkStagger,
} from "@/constants/scrollMotion";
import { SOCIAL_LINKS } from "@/constants/socialLinks";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

type Size = "hero" | "footer" | "contact";

type SocialLinksRowProps = {
  size: Size;
  delay?: number;
  variants?: Variants;
  itemVariants?: Variants;
  animate?: boolean;
};

const sizeClasses: Record<
  Size,
  { wrap: string; iconWrap: string; glyph: string }
> = {
  hero: {
    wrap: "flex items-center gap-2",
    iconWrap:
      "group w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors duration-200",
    glyph: "w-4 h-4",
  },
  footer: {
    wrap: "flex items-center gap-2 mb-2",
    iconWrap:
      "group w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors duration-200",
    glyph: "w-4 h-4",
  },
  contact: {
    wrap: "flex gap-2",
    iconWrap:
      "group w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors duration-200",
    glyph: "w-4 h-4",
  },
};

const defaultDelays: Record<Size, number> = {
  hero: 0.92,
  footer: 0.08,
  contact: 0.42,
};

export function SocialLinksRow({
  size,
  delay,
  variants,
  itemVariants,
  animate: animateProp,
}: SocialLinksRowProps): JSX.Element | null {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, scrollViewport);
  const cls = sizeClasses[size];
  const shouldShow = animateProp ?? inView;
  const rowDelay = delay ?? defaultDelays[size];
  const useParentVariants = Boolean(variants);

  if (SOCIAL_LINKS.length === 0) {
    return null;
  }

  if (useParentVariants) {
    const LinkTag = itemVariants ? motion.a : "a";
    return (
      <motion.div ref={ref} className={cls.wrap} variants={variants}>
        {SOCIAL_LINKS.map((link) => {
          const { brandColor, bg } = getSocialBrand(link);
          const external = !link.url.startsWith("mailto:");
          return (
            <LinkTag
              key={link.id}
              href={link.url}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              title={link.platform}
              aria-label={link.platform}
              className={`${cls.iconWrap} ${bg}`}
              style={{ ["--brand-color" as string]: brandColor }}
              {...(itemVariants ? { variants: itemVariants } : {})}
            >
              <span className="text-zinc-400 transition-colors duration-200 group-hover:[color:var(--brand-color)]">
                <SocialLinkGlyph link={link} className={cls.glyph} />
              </span>
            </LinkTag>
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
      animate={shouldShow ? "visible" : "hidden"}
      variants={socialLinkStagger(rowDelay)}
    >
      {SOCIAL_LINKS.map((link) => {
        const { brandColor, bg } = getSocialBrand(link);
        const external = !link.url.startsWith("mailto:");
        return (
          <motion.a
            key={link.id}
            href={link.url}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
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
