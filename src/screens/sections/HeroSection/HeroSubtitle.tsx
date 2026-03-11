import { TypingTextEffect } from "./TypingTextEffect";

const TYPEWRITER_WORDS = [
  "Front-End Web Developer",
  "Writing clean, efficient and impactful code",
  "Always learning, building and innovating",
  "WordPress to Full-Stack Development",
  "Crafting fast and user-friendly web experience",
];

export const HeroSubtitle = () => (
  <div className="relative flex items-center justify-center font-normal text-xl lg:text-5xl  text-center tracking-[-0.2px] min-h-[24px] px-4">
    <TypingTextEffect words={TYPEWRITER_WORDS} />
  </div>
);
