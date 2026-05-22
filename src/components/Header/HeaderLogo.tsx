import { PROFILE } from "@/constants/profile";
import { useSiteSettingsMap } from "@/hooks/useSiteSettingsMap";
import { Link } from "react-router-dom";

export const HeaderLogo = () => {
  const { settings } = useSiteSettingsMap();
  const name = settings.hero_title?.trim() || PROFILE.name;

  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 group cursor-pointer z-10"
      aria-label="Home"
    >
      <img
        src="/sahin.png"
        alt={name}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] object-cover border-2 border-white/20 shadow-md ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-105"
      />
    </Link>
  );
};
