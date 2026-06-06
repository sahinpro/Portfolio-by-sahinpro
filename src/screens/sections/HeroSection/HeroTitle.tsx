import { PROFILE } from "@/constants/profile";
import { useSiteSettingsMap } from "@/hooks/useSiteSettingsMap";

const titleGradient = {
  backgroundImage: "linear-gradient(45deg, #ee2a7b, #6228d7, #2b8ace)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
} as const;

export const HeroTitle = (): JSX.Element => {
  const { settings } = useSiteSettingsMap();
  const title = settings.hero_title?.trim() || PROFILE.name;

  return (
    <h1
      className="font-monte-carlo lg:text-5xl text-4xl text-center lg:text-left leading-[70px]"
      style={titleGradient}
    >
      {title}
    </h1>
  );
};
