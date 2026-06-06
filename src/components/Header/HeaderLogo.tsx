import { PROFILE } from "@/constants/profile";
import { Link } from "react-router-dom";

export const HeaderLogo = (): JSX.Element => {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 group cursor-pointer z-10"
      aria-label="Home"
    >
      <img
        src="/sahin-avatar.webp"
        alt={PROFILE.name}
        width={40}
        height={40}
        decoding="async"
        loading="lazy"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] object-cover border-2 border-white/20 shadow-md ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-105"
      />
    </Link>
  );
};
