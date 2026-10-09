import { resolveHeroDescription } from "@/constants/profile";

export const HeroDescription = (): JSX.Element => {
  return (
    <p className="text-white text-center lg:text-left text-lg max-w-2xl">
      {resolveHeroDescription(undefined)}
    </p>
  );
};
