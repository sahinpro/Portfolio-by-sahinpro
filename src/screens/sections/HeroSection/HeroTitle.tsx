import { TextEffect } from "@/components/motion-primitives/text-effect";

export const HeroTitle = () => (
  <TextEffect 
    per="char" 
    preset="fade"
    className="font-monte-carlo text-7xl text-center leading-[70px]"
    style={{
      backgroundImage: 'linear-gradient(45deg, #ee2a7b, #6228d7, #2b8ace)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}
  >
    Sahin Alam
  </TextEffect>
);
