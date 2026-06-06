import { PROFILE } from "@/constants/profile";

const titleGradient = {
  backgroundImage: "linear-gradient(45deg, #ee2a7b, #6228d7, #2b8ace)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
} as const;

export const HeroTitle = (): JSX.Element => {
  return (
    <h1
      className="font-monte-carlo text-4xl lg:text-5xl text-center lg:text-left leading-[70px]"
      style={titleGradient}
    >
      {PROFILE.name}
    </h1>
  );
};
