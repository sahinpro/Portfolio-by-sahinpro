import { PROFILE } from "@/constants/profile";

export const HeroTitle = (): JSX.Element => {
  return (
    <div className="flex w-full flex-col items-center gap-3 text-center lg:items-start lg:text-left">
      <p className="font-monte-carlo text-2xl leading-none text-white/80">
        {PROFILE.name}
      </p>
      <h1 className="max-w-xl text-[1.7rem] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">
        Website not bringing customers? Let&apos;s fix that.
      </h1>
    </div>
  );
};
