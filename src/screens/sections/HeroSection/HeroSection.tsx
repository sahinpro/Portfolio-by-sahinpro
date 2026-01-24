import { TextEffect } from "@/components/motion-primitives/text-effect";
import { useEffect, useState } from "react";
import { CTAButton } from "../../../components/CTAButton";
import { ShapeHero } from "../../../components/ui/shape-hero";

// Constants
const TYPEWRITER_WORDS = [
  'Front-End Web Developer',
  'Writing clean, efficient and impactful code',
  'Always learning, building and innovating',
  'WordPress to Full-Stack Development',
  'Crafting fast and user-friendly web experience'
];

const HERO_DESCRIPTION = "Web Designer & Developer specializing in WordPress, now diving into Full Stack Web Development.";

// Typing Text Effect Component
const TypingTextEffect = ({ words }: { words: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
      setKey((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <TextEffect
      key={key}
      per="char"
      preset="fade"
      className="text-center section-heading-gradient"
      style={{
        backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.2) 58%), linear-gradient(140deg, #FFFFFF, #818CF8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {words[currentIndex]}
    </TextEffect>
  );
};

// Profile Image Component
const ProfileImage = () => (
  <div className="flex items-center justify-center mb-2">
    <img
      src="/sahin.png"
      alt="Sahin Alam"
      className="w-[250px] h-[250px] rounded-full object-cover border-4 border-white/20 shadow-lg"
    />
  </div>
);

// Hero Title Component
const HeroTitle = () => (
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

// Hero Subtitle Component
const HeroSubtitle = () => (
  <div className="relative flex items-center justify-center font-normal text-xl text-center tracking-[-0.2px] leading-[32px] min-h-[32px]">
    <TypingTextEffect words={TYPEWRITER_WORDS} />
  </div>
);

// Hero Description Component
const HeroDescription = () => (
  <p className="text-white text-center text-lg max-w-2.5xl">
    {HERO_DESCRIPTION}
  </p>
);

// Main Hero Content Component
const HeroContent = () => (
  <div className="flex flex-col items-center gap-4 max-w-3.5xl w-full px-4">
    <ProfileImage />
    
    <div className="flex flex-col items-center gap-2 w-full">
      <HeroTitle />
      <HeroSubtitle />
    </div>

    <HeroDescription />

    <CTAButton href="/projects" variant="primary">
      View My Work
    </CTAButton>
  </div>
);

// Main Hero Section Component
export const HeroSection = (): JSX.Element => {
  return (
    <section className="relative w-full overflow-hidden py-12">
      {/* Shape Hero Background */}
      <ShapeHero />
      
      {/* Background Layer */}
      <div className="absolute top-0 left-0 w-full h-full bg-[100%_100%] z-0" />
      
      {/* Gradient Overlay */}
      <div className="absolute left-0 bottom-0 w-full h-[200px] bg-gradient-to-t from-[#050505] via-[#05050580] to-transparent z-0" />

      {/* Hero Content */}
      <div className="relative flex flex-col items-center justify-center py-8 z-10">
        <HeroContent />
      </div>
    </section>
  );
};
