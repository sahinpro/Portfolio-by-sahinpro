import { useSiteSettingsMap } from "@/hooks/useSiteSettingsMap";
import { useMemo } from "react";
import { TypingTextEffect } from "./TypingTextEffect";

const TYPEWRITER_FALLBACK = [
  "Front-End Web Developer",
  "Writing clean, efficient and impactful code",
  "Always learning, building and innovating",
  "WordPress to Full-Stack Development",
  "Crafting fast and user-friendly web experience",
];

export const HeroSubtitle = () => {
  const { settings } = useSiteSettingsMap();
  const words = useMemo(() => {
    try {
      const raw = settings.hero_typewriter_words?.trim();
      if (!raw) return TYPEWRITER_FALLBACK;
      const j = JSON.parse(raw) as unknown;
      if (!Array.isArray(j) || !j.every((x) => typeof x === "string")) return TYPEWRITER_FALLBACK;
      return j.length ? j : TYPEWRITER_FALLBACK;
    } catch {
      return TYPEWRITER_FALLBACK;
    }
  }, [settings.hero_typewriter_words]);

  return (
    <div className="relative flex items-center justify-center font-normal text-xl lg:text-5xl  text-center tracking-[-0.2px] min-h-[24px] px-4">
      <TypingTextEffect words={words} />
    </div>
  );
};
