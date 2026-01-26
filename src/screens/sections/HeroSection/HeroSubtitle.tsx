import { TypingTextEffect } from "./TypingTextEffect";

const TYPEWRITER_WORDS = [
  'Front-End Web Developer',
  'Writing clean, efficient and impactful code',
  'Always learning, building and innovating',
  'WordPress to Full-Stack Development',
  'Crafting fast and user-friendly web experience'
];

export const HeroSubtitle = () => (
  <div  className="relative flex items-center justify-center font-normal text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-center tracking-[-0.2px] leading-6 sm:leading-7 md:leading-8 lg:leading-[32px] min-h-[24px] sm:min-h-[28px] md:min-h-[32px] px-4">
    <TypingTextEffect words={TYPEWRITER_WORDS} />
  </div>
);
