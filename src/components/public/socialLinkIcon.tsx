import type { SocialLinkRow } from "@/admin/types/database";
import { getSocialLinkIconKey } from "@/components/public/socialBrands";
import { Github, Link2, Linkedin, Mail, type LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";
import { BsBehance, BsDribbble, BsTelegram } from "react-icons/bs";

type SocialGlyph = (props: { className?: string }) => JSX.Element;

const asGlyph = (Icon: LucideIcon | IconType): SocialGlyph =>
  function SocialGlyphIcon({ className }) {
    const Glyph = Icon as LucideIcon;
    return <Glyph className={className} />;
  };

const ICONS: Record<string, SocialGlyph> = {
  github: asGlyph(Github),
  linkedin: asGlyph(Linkedin),
  behance: asGlyph(BsBehance),
  dribbble: asGlyph(BsDribbble),
  telegram: asGlyph(BsTelegram),
  mail: asGlyph(Mail),
  email: asGlyph(Mail),
};

export function SocialLinkGlyph({
  link,
  className = "w-4 h-4",
}: {
  link: SocialLinkRow;
  className?: string;
}): JSX.Element {
  const k = getSocialLinkIconKey(link);
  const Icon = ICONS[k];
  if (Icon) {
    return <Icon className={className} />;
  }

  const raw = (link.icon ?? "").trim();
  if (/^https?:\/\//i.test(raw)) {
    return (
      <img
        src={raw}
        alt=""
        className={`${className} object-contain rounded-sm`}
        loading="lazy"
      />
    );
  }

  return <Link2 className={className} />;
}
