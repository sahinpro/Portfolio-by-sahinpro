import { TextEffect } from "@/components/MotionPrimitives/TextEffect";

export const HeroTitle = () => (
  <TextEffect
    per="char"
    preset="fade"
    className="font-monte-carlo lg:text-7xl text-5xl text-center leading-[70px]"
    style={{
      backgroundImage: "linear-gradient(45deg, #ee2a7b, #6228d7, #2b8ace)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    }}
  >
    Sahin Alam
  </TextEffect>
);
