import { AuroraBackground } from "@/components/AuroraBackground";
import { getSocialBrand } from "@/components/public/socialBrands";
import { SocialLinkGlyph } from "@/components/public/socialLinkIcon";
import { DESKTOP_LAYOUT_BREAKPOINT } from "@/constants/styles";
import { useVisibleSocialLinks } from "@/hooks/useVisibleSocialLinks";
import { deferUntilIdle } from "@/lib/deferUntilIdle";
import { HeroContent } from "@/screens/sections/HeroSection/HeroContent";
import { Suspense, lazy, useEffect, useRef, useState } from "react";

const AboutCodeWindow = lazy(() =>
  import("@/screens/sections/AboutCodeSection/AboutCodeWindow").then((m) => ({
    default: m.AboutCodeWindow,
  })),
);

const MOBILE_EDITOR_DEFER_MS = 4500;
const DESKTOP_EDITOR_DEFER_MS = 2500;

const CodeEditorPlaceholder = (): JSX.Element => (
  <div
    className="w-full aspect-video rounded-[25px] border border-white/10 bg-[#0f0f0f]/35"
    aria-hidden
  />
);

export const HeroSection = (): JSX.Element => {
  const socialLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const { links: socialLinks } = useVisibleSocialLinks({ deferMs: 4000 });
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

            {socialLinks.length > 0 ? (
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-8 min-h-[32px] w-full">
                {socialLinks.map((link, index) => {
                  const { brandColor, bg } = getSocialBrand(link);
                  return (
                    <a
                      key={link.id}
                      ref={(el) => {
                        socialLinksRef.current[index] = el;
                      }}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.platform}
                      aria-label={link.platform}
                      className={`group w-8 h-8 rounded-xl bg-white/5 border border-white/10
                  flex items-center justify-center ${bg}
                  transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 active:scale-95`}
                      style={{ ["--brand-color" as string]: brandColor }}
                    >
                      <span className="text-white/40 transition-colors duration-200 group-hover:[color:var(--brand-color)]">
                        <SocialLinkGlyph link={link} />
                      </span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 min-h-[32px] w-full" aria-hidden />
            )}
          </div>

          <div
            ref={editorRef}
            className="relative z-0 w-full min-w-0 lg:w-1/2 aspect-video max-lg:pointer-events-none max-lg:select-none max-lg:origin-top max-lg:scale-[0.98]"
          >
            {showCodeEditor ? (
              <Suspense fallback={<CodeEditorPlaceholder />}>
                <AboutCodeWindow startOnMount />
              </Suspense>
            ) : (
              <CodeEditorPlaceholder />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
