import type { SocialLinkRow } from "@/admin/types/database";

export const SOCIAL_BRAND: Record<string, { brandColor: string; bg: string }> =
  {
    github: { brandColor: "#f0f6fc", bg: "hover:bg-white/10" },
    linkedin: { brandColor: "#0A66C2", bg: "hover:bg-[#0A66C2]/20" },
    behance: { brandColor: "#1769FF", bg: "hover:bg-[#1769FF]/20" },
    dribbble: { brandColor: "#EA4C89", bg: "hover:bg-[#EA4C89]/20" },
    youtube: { brandColor: "#ff0000", bg: "hover:bg-red-500/20" },
    instagram: { brandColor: "#e4405f", bg: "hover:bg-pink-500/15" },
    telegram: { brandColor: "#26A5E4", bg: "hover:bg-[#26A5E4]/20" },
    twitter: { brandColor: "#e7e9ea", bg: "hover:bg-white/15" },
    x: { brandColor: "#e7e9ea", bg: "hover:bg-white/15" },
    mail: { brandColor: "#a78bfa", bg: "hover:bg-violet-500/20" },
    email: { brandColor: "#a78bfa", bg: "hover:bg-violet-500/20" },
  };

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[\s_-]+/g, "");
}

export function getSocialLinkIconKey(link: SocialLinkRow): string {
  const raw = (link.icon ?? "").trim();
  const url = (link.url ?? "").toLowerCase();
  const platform = normalizeKey(link.platform ?? "");

  if (/t\.me|telegram\.me|telegram\.org/i.test(url)) return "telegram";
  if (platform.includes("telegram")) return "telegram";

  if (/twitter\.com|x\.com/i.test(url)) return "twitter";
  if (platform.includes("twitter") || platform === "x") return "twitter";

  if (/^https?:\/\//i.test(raw)) {
    if (/telegram|t\.me/i.test(raw)) return "telegram";
    if (/twitter|x\.com/i.test(raw)) return "twitter";
    return "";
  }

  const fromIcon = normalizeKey(raw);
  if (fromIcon === "twitter" || fromIcon === "x" || fromIcon === "xtwitter") {
    return "twitter";
  }
  if (fromIcon && fromIcon !== "link") return fromIcon;

  return platform;
}

export function getSocialBrand(link: SocialLinkRow): {
  brandColor: string;
  bg: string;
} {
  const k = getSocialLinkIconKey(link);
  return SOCIAL_BRAND[k] ?? { brandColor: "#ffffff", bg: "hover:bg-white/10" };
}
