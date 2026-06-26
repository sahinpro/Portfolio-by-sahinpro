import { AuroraBackground } from "@/components/effects/AuroraBackground";
import { SocialLinksRow } from "@/components/public/SocialLinksRow";
import { heroTiming } from "@/constants/scrollMotion";
import { deferUntilIdle } from "@/lib/deferUntilIdle";
import { DESKTOP_LAYOUT_BREAKPOINT } from "@/constants/styles";
import { AboutCodePlaceholder } from "@/screens/sections/AboutCodeSection";
import { HeroContent } from "@/screens/sections/HeroSection/HeroContent";
import { Suspense, lazy, useEffect, useRef, useState } from "react";

const AboutCodeWindow = lazy(() =>
  import("@/screens/sections/AboutCodeSection/AboutCodeWindow").then((m) => ({
    default: m.AboutCodeWindow,
  })),
);

const MOBILE_EDITOR_DEFER_MS = 4500;
const DESKTOP_EDITOR_DEFER_MS = 2500;

export const HeroSection = (): JSX.Element => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    let cancelDefer: (() => void) | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const isMobile = window.matchMedia(
          `(max-width: ${DESKTOP_LAYOUT_BREAKPOINT - 1}px)`,
        ).matches;
        const deferMs = isMobile
          ? MOBILE_EDITOR_DEFER_MS
          : DESKTOP_EDITOR_DEFER_MS;

        cancelDefer?.();
        cancelDefer = deferUntilIdle(() => setShowCodeEditor(true), deferMs);
      },
      { rootMargin: "160px 0px", threshold: 0.01 },
    );

    observer.observe(el);
    return () => {
      cancelDefer?.();
      observer.disconnect();
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden min-h-0 lg:min-h-screen flex items-center pt-24 sm:pt-28 pb-10">
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

            <SocialLinksRow
              size="hero"
              animate
              delay={heroTiming.socialLinksDelay}
            />
          </div>

          <div
            ref={editorRef}
            className="relative z-0 w-full min-w-0 lg:w-1/2 aspect-video max-lg:pointer-events-none max-lg:select-none max-lg:origin-top max-lg:scale-[0.98]"
          >
            {showCodeEditor ? (
              <Suspense fallback={<AboutCodePlaceholder className="w-full" />}>
                <AboutCodeWindow startOnMount />
              </Suspense>
            ) : (
              <AboutCodePlaceholder className="w-full" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

