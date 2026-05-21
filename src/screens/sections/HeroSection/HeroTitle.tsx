import { TextEffect } from "@/components/MotionPrimitives/TextEffect";
import { useSiteSettingsMap } from "@/hooks/useSiteSettingsMap";

export const HeroTitle = () => {
  const { settings } = useSiteSettingsMap();
  const title = settings.hero_title?.trim() || "Sahin Alam";
  return (
    <TextEffect
      per="char"
      preset="fade"
      className="font-monte-carlo lg:text-5xl text-4xl text-center lg:text-left leading-[70px]"
      style={{
        backgroundImage: "linear-gradient(45deg, #ee2a7b, #6228d7, #2b8ace)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {title}
    </TextEffect>
  );
};
