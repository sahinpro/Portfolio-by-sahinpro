import type { SocialLinkRow } from "@/admin/types/database";

export const SOCIAL_BRAND: Record<string, { brandColor: string; bg: string }> = {
  github: { brandColor: "#f0f6fc", bg: "hover:bg-white/10" },
  linkedin: { brandColor: "#0A66C2", bg: "hover:bg-[#0A66C2]/20" },
  behance: { brandColor: "#1769FF", bg: "hover:bg-[#1769FF]/20" },
  dribbble: { brandColor: "#EA4C89", bg: "hover:bg-[#EA4C89]/20" },
  youtube: { brandColor: "#ff0000", bg: "hover:bg-red-500/20" },
  instagram: { brandColor: "#e4405f", bg: "hover:bg-pink-500/15" },
  mail: { brandColor: "#a78bfa", bg: "hover:bg-violet-500/20" },
  email: { brandColor: "#a78bfa", bg: "hover:bg-violet-500/20" },
};

export function getSocialLinkIconKey(link: SocialLinkRow): string {
  const raw = (link.icon ?? "").trim();
  if (/^https?:\/\//i.test(raw)) return "";
  const fromIcon = raw.toLowerCase().replace(/\s+/g, "");
  if (fromIcon) return fromIcon;
  return link.platform.toLowerCase().replace(/\s+/g, "");
}

export function getSocialBrand(link: SocialLinkRow): { brandColor: string; bg: string } {
  const k = getSocialLinkIconKey(link);
  return SOCIAL_BRAND[k] ?? { brandColor: "#ffffff", bg: "hover:bg-white/10" };
}
