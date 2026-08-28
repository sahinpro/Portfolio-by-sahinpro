import { PROFILE } from "@/constants/profile";

export const HeroSubtitle = (): JSX.Element => {
  return (
    <div className="flex w-full flex-col items-center gap-0 text-center lg:items-start lg:gap-2.5 lg:text-left">
      {PROFILE.heroSubtitleLines.map((text) => (
        <p
          key={text}
          className="section-hero-subtitle block font-medium tracking-[-0.2px] text-3xl lg:text-[42px] text-violet-200 lg:leading-[3.5rem] leading-tight"
        >
          {text}
        </p>
      ))}
      <p className="block max-w-xl text-xl font-medium leading-snug tracking-[-0.15px] text-zinc-300 sm:text-2xl lg:text-[28px] mt-1">
        {PROFILE.tagline}
      </p>
    </div>
  );
};
