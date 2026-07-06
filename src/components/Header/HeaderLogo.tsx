"use client";

import { PublicImage } from "@/components/ui/PublicImage";
import { PROFILE_AVATAR, PROFILE_AVATAR_ALT } from "@/lib/seoImages";
import Link from "next/link";

export const HeaderLogo = (): JSX.Element => {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 group cursor-pointer z-10"
      aria-label="Home"
    >
      <PublicImage
        src={PROFILE_AVATAR.path}
        alt={PROFILE_AVATAR_ALT}
        width={45}
        height={45}
        priority
        sizes="45px"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] object-cover border border-white/20 shadow-md ring-1 ring-white/10 "
      />
    </Link>
  );
};
