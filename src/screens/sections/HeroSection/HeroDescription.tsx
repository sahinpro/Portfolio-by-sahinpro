import { resolveHeroDescription } from "@/constants/profile";
import { useSiteSettingsMap } from "@/hooks/useSiteSettingsMap";

export const HeroDescription = () => {
  const { settings } = useSiteSettingsMap();
  const text = resolveHeroDescription(settings.hero_description);
  return (
    <p className="text-white text-center lg:text-left text-lg max-w-2xl">
      {text}
    </p>
  );
};
