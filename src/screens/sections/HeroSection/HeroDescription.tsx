import { useSiteSettingsMap } from "@/hooks/useSiteSettingsMap";

const FALLBACK =
  "Web Designer & Developer specializing in WordPress, now diving into Full Stack Web Development.";

export const HeroDescription = () => {
  const { settings } = useSiteSettingsMap();
  const text = settings.hero_description?.trim() || FALLBACK;
  return (
    <p className="text-white text-center text-lg max-w-2xl">
      {text}
    </p>
  );
};
