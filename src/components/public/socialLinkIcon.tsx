import type { SocialLinkRow } from "@/admin/types/database";
import { getSocialLinkIconKey } from "@/components/public/socialBrands";
import { Github, Instagram, Link2, Linkedin, Mail, Youtube } from "lucide-react";
import type { ComponentType } from "react";
import { BsBehance, BsDribbble } from "react-icons/bs";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  behance: BsBehance,
  dribbble: BsDribbble,
  youtube: Youtube,
  instagram: Instagram,
  mail: Mail,
  email: Mail,
};

export function SocialLinkGlyph({
  link,
  className = "w-4 h-4",
}: {
  link: SocialLinkRow;
  className?: string;
}): JSX.Element {
  const raw = (link.icon ?? "").trim();
  if (/^https?:\/\//i.test(raw)) {
    return (
      <img src={raw} alt="" className={`${className} object-contain rounded-sm`} loading="lazy" />
    );
  }
  const k = getSocialLinkIconKey(link);
  const Icon = ICONS[k] ?? Link2;
  return <Icon className={className} />;
}
