import { PROFILE } from "@/constants/profile";

export const HeroTitle = (): JSX.Element => {
  return (
    <h1 className="font-monte-carlo text-4xl lg:text-5xl text-center lg:text-left leading-[50px] text-white">
      {PROFILE.name}
    </h1>
  );
};
