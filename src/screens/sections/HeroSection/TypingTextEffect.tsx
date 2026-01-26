import { TextEffect } from "@/components/motion-primitives/text-effect";
import { useEffect, useState } from "react";

interface TypingTextEffectProps {
  words: string[];
}

export const TypingTextEffect = ({ words }: TypingTextEffectProps) => {
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
      className="text-center section-hero-subtitle "
      style={{
        backgroundImage: 'linear-gradient(169deg,rgba(120, 156, 255, 1) 0%, rgba(149, 0, 255, 1) 35%, rgba(195, 122, 255, 1) 100%);',
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
