import { AuroraBackground } from "@/components/effects/AuroraBackground";
import { heroCodeEditorReveal, heroTiming } from "@/constants/scrollMotion";
import { usePerformanceMode } from "@/hooks/usePerformanceMode";
import { deferUntilIdle } from "@/lib/deferUntilIdle";
import { AboutCodePlaceholder } from "@/screens/sections/AboutCodeSection";
import { HeroContent } from "@/screens/sections/HeroSection/HeroContent";
import { motion, useReducedMotion } from "framer-motion";
import { Suspense, lazy, useEffect, useRef, useState } from "react";

const AboutCodeWindow = lazy(() =>
  import("@/screens/sections/AboutCodeSection/AboutCodeWindow").then((m) => ({
    default: m.AboutCodeWindow,
  })),
);

export const HeroSection = (): JSX.Element => {
  const editorRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { simpleVisuals } = usePerformanceMode();
  const instantReveal = reduceMotion === true || simpleVisuals;

  const [editorRevealed, setEditorRevealed] = useState(instantReveal);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [typingActive, setTypingActive] = useState(false);

  useEffect(() => {
    if (instantReveal) {
      setEditorRevealed(true);
    }
  }, [instantReveal]);

  useEffect(() => {
    if (!editorRevealed) return;

    const deferMs = simpleVisuals
      ? heroTiming.codeEditorDeferMs.mobile
      : heroTiming.codeEditorDeferMs.desktop;

    return deferUntilIdle(() => setShowCodeEditor(true), deferMs);
  }, [editorRevealed, simpleVisuals]);

  useEffect(() => {
    if (!showCodeEditor) {
      setTypingActive(false);
      return;
    }

    if (instantReveal) {
      setTypingActive(true);
      return;
    }

    const id = window.setTimeout(
      () => setTypingActive(true),
      heroTiming.codeEditorTypingDelay,
    );
    return () => window.clearTimeout(id);
  }, [showCodeEditor, instantReveal]);

  return (
    <section className="relative w-full overflow-hidden min-h-screen flex items-center pt-24 sm:pt-28 pb-10">
      <div className="absolute inset-0 w-full h-full z-0">
        <AuroraBackground />
      </div>

      <div className="pointer-events-none absolute left-0 bottom-0 w-full h-[200px] bg-gradient-to-t from-[#050505] via-[#05050580] to-transparent z-[1]" />

      <div className="relative z-[2] container mx-auto px-4 pt-5">
        <div className="relative flex flex-col lg:flex-row gap-0 lg:gap-12 xl:gap-16 justify-between items-center max-lg:items-stretch max-lg:pt-2 max-lg:pb-4">
          <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-auto max-lg:px-1 mb-10 lg:mb-0">
            <div className="w-full">
              <HeroContent />
            </div>
          </div>

          <motion.div
            ref={editorRef}
            initial={instantReveal ? false : "hidden"}
            animate="visible"
            variants={instantReveal ? undefined : heroCodeEditorReveal}
            onAnimationComplete={() => {
              if (!instantReveal) setEditorRevealed(true);
            }}
            className="relative z-0 w-full min-w-0 lg:w-1/2 aspect-video max-lg:pointer-events-none max-lg:select-none max-lg:origin-top max-lg:scale-[0.98]"
          >
            {showCodeEditor ? (
              <Suspense fallback={<AboutCodePlaceholder className="w-full" />}>
                <AboutCodeWindow startOnMount={typingActive} />
              </Suspense>
            ) : (
              <AboutCodePlaceholder className="w-full" />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
