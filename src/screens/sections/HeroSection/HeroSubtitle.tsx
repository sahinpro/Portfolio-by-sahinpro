import { PROFILE } from "@/constants/profile";

const subtitleGradient = {
  backgroundImage:
    "linear-gradient(169deg,rgba(120, 156, 255, 1) 0%, rgba(149, 0, 255, 1) 35%, rgba(195, 122, 255, 1) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
} as const;

export const HeroSubtitle = (): JSX.Element => {
  return (
    <div
      className="flex w-full flex-col items-center gap-2 text-center lg:items-start lg:gap-2.5 lg:text-left"
      aria-label={[PROFILE.role, PROFILE.tagline].join(". ")}
    >
      {PROFILE.heroSubtitleLines.map((text) => (
        <span
          key={text}
          className="section-hero-subtitle block font-bold leading-[3.5rem] tracking-[-0.2px] text-3xl lg:text-[42px]"
          style={subtitleGradient}
        >
          {text}
        </span>
      ))}
      <p className="block max-w-xl text-xl font-medium leading-snug tracking-[-0.15px] text-white/55 sm:text-2xl lg:text-[28px] mt-1">
        {PROFILE.tagline}
      </p>
    </div>
  );
};
