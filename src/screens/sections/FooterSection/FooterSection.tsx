import { HeaderLogo } from "@/components/Header";
import { SocialLinksRow } from "@/components/public/SocialLinksRow";
import { TextEffect } from "@/components/MotionPrimitives/TextEffect";
import { PROFILE } from "@/constants/profile";
import { useSiteSettingsMap } from "@/hooks/useSiteSettingsMap";

export const FooterSection = (): JSX.Element => {
  const { settings } = useSiteSettingsMap();
  const displayName = settings.hero_title?.trim() || PROFILE.name;
  const year = settings.copyright_year?.trim() || String(new Date().getFullYear());

  return (
    <footer className="flex flex-col container mx-auto items-center justify-center gap-[62px] pt-14 pb-12 px-4 md:px-[154px] relative  ">
        <div className="flex flex-col container mx-auto  items-center justify-center gap-2">
          <HeaderLogo/>
            <TextEffect 
              per="char" 
              preset="fade"
              className="font-monte-carlo text-4xl text-center leading-[70px] text-white"
            >
              {displayName}
            </TextEffect>
          <SocialLinksRow size="footer" />
        <p className="flex items-center justify-center mt-[-1.00px] font-normal text-zinc-400 text-sm tracking-[0] leading-5 whitespace-nowrap">
          © {year} {displayName}. All rights reserved.
        </p>
        </div>
     
    </footer>
  );
};
