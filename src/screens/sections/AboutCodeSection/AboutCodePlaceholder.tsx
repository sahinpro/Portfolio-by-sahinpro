import {
  PROFILE,
  PROFILE_PLATFORMS,
  PROFILE_STACK,
} from "@/constants/profile";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import {
  aboutCodePaneClass,
  aboutCodePanePassScrollClass,
} from "./aboutCodeLayout";
import { buildAboutCode } from "./aboutCodeContent";
import { highlightCodeLine } from "./highlightCode";

type AboutCodePlaceholderProps = {
  className?: string;
};

export const AboutCodePlaceholder = ({
  className = "",
}: AboutCodePlaceholderProps): JSX.Element => {
  const lines = useMemo(() => {
    const code = buildAboutCode({
      name: PROFILE.name,
      role: PROFILE.role,
      highlights: [...PROFILE.codeHighlights],
      stack: [...PROFILE_STACK],
      platforms: [...PROFILE_PLATFORMS],
      available: true,
    });
    return code.split("\n");
  }, []);

  return (
    <div className={className} aria-busy="true" aria-label="Loading code editor">
      <div className="relative w-full rounded-[25px] lg:rounded-[28px] border border-white/10 backdrop-blur-xl bg-gradient-to-b from-white/30 to-white/50 p-2 lg:p-2.5">
        <div className="pointer-events-none z-[9999] absolute inset-x-0 bottom-0 h-[150px] w-[96%] mx-auto scale-[1.05] bg-gradient-to-b from-transparent via-black/45 to-black rounded-b-[25px]" />
        <div className="relative rounded-[16px] lg:rounded-[19px] bg-[#0f0f0f] overflow-hidden">
          <div className="relative bg-[#0a0a0a] z-10">
            <div className="flex items-center gap-2 border-b border-white/10 bg-[#141414] px-3 py-2 sm:px-4 shrink-0">
              <div className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="ml-2 flex gap-1 overflow-x-auto">
                <span className="rounded-md px-2.5 py-1 text-[11px] sm:text-xs font-mono bg-white/10 text-white">
                  about.ts
                </span>
                <span className="rounded-md px-2.5 py-1 text-[11px] sm:text-xs font-mono text-white/40">
                  terminal
                </span>
              </div>
            </div>

            <div
              className={cn(
                aboutCodePaneClass,
                aboutCodePanePassScrollClass,
                "w-full text-left",
              )}
            >
              <pre className="m-0 block w-full min-w-0 max-w-full px-3 py-3 sm:px-4 sm:py-3 font-mono text-[11px] sm:text-xs leading-[1.55] overflow-x-hidden">
                <code>
                  {lines.map((line, index) => (
                    <div key={`line-${index}`} className="flex items-start gap-0">
                      <span className="select-none w-6 sm:w-7 shrink-0 text-right pr-2 sm:pr-3 pt-px text-white/20 tabular-nums leading-[1.55]">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 whitespace-pre-wrap break-words leading-[1.55]">
                        {highlightCodeLine(line, `ph-${index}`)}
                      </span>
                    </div>
                  ))}
                  <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-violet-400/80 animate-pulse" />
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        Loading profile code editor…
      </p>
    </div>
  );
};
