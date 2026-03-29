import { SocialLinkGlyph } from "@/components/public/socialLinkIcon";
import { getSocialBrand } from "@/components/public/socialBrands";
import { useVisibleSocialLinks } from "@/hooks/useVisibleSocialLinks";

type Size = "hero" | "footer" | "contact";

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

export function SocialLinksRow({ size }: { size: Size }): JSX.Element | null {
  const { links, loading } = useVisibleSocialLinks();
  const cls = sizeClasses[size];

  if (!loading && links.length === 0) {
    return null;
  }

  if (loading && links.length === 0) {
    return <div className={`${cls.wrap} min-h-[32px]`} aria-hidden />;
  }

  return (
    <div className={cls.wrap}>
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
            <span className="text-white/40 transition-colors duration-200 group-hover:[color:var(--brand-color)]">
              <SocialLinkGlyph link={link} className={cls.glyph} />
            </span>
          </a>
        );
      })}
    </div>
  );
}
