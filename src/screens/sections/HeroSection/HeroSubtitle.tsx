const HERO_SUBTITLE = "Full Stack Web Developer & AI Engineer.";

const subtitleStyle = {
  backgroundImage:
    "linear-gradient(169deg,rgba(120, 156, 255, 1) 0%, rgba(149, 0, 255, 1) 35%, rgba(195, 122, 255, 1) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
} as const;

export const HeroSubtitle = () => {
  return (
    <p className="section-hero-subtitle font-normal leading-relaxed text-2xl lg:text-5xl text-center lg:text-left tracking-[-0.2px] w-full">
      <span style={subtitleStyle}>{HERO_SUBTITLE}</span>
    </p>
  );
};
