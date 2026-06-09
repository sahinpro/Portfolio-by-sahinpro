import { cn } from "@/lib/utils";
import { useEffect, type ReactNode } from "react";
import {
  aboutCodePaneClass,
  aboutCodePanePassScrollClass,
} from "./aboutCodeLayout";
import { highlightCodeLine } from "./highlightCode";
import { useTypewriter } from "./useTypewriter";

export type EditorTab = "about.ts" | "terminal";

type CodeEditorPanelProps = {
  code: string;
  active: boolean;
  instant: boolean;
  loading: boolean;
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  onSkip: () => void;
  onTypingComplete: () => void;
  terminal: ReactNode;
};

export const CodeEditorPanel = ({
  code,
  active,
  instant,
  loading,
  activeTab,
  onTabChange,
  onSkip,
  onTypingComplete,
  terminal,
}: CodeEditorPanelProps): JSX.Element => {
  const { display, done, skip } = useTypewriter(code, { active, instant });

  useEffect(() => {
    if (done) onTypingComplete();
  }, [done, onTypingComplete]);

  const handleSkip = () => {
    if (!done) skip();
    onSkip();
  };

  const lines = display.split("\n");

  return (
    <div className="relative bg-[#0a0a0a] z-10">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#141414] px-3 py-2 sm:px-4 shrink-0">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-2 flex gap-1 overflow-x-auto">
          {(["about.ts", "terminal"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] sm:text-xs font-mono transition-colors",
                activeTab === tab
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-zinc-200",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        {!done && activeTab === "about.ts" ? (
          <button
            type="button"
            onClick={handleSkip}
            className="ml-auto text-[10px] sm:text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Skip typing
          </button>
        ) : null}
      </div>

      {activeTab === "about.ts" ? (
        <div
          className={cn(
            "w-full text-left cursor-text max-md:cursor-default",
            aboutCodePaneClass,
            aboutCodePanePassScrollClass,
          )}
          aria-label="Profile code preview"
        >
          <pre className="m-0 block w-full min-w-0 max-w-full px-3 py-3 sm:px-4 sm:py-3 font-mono text-[11px] sm:text-xs leading-[1.55] overflow-x-hidden">
            {loading ? (
              <span className="text-zinc-400">Loading profile…</span>
            ) : (
              <code>
                {lines.map((line, index) => (
                  <div key={`line-${index}`} className="flex items-start gap-0">
                    <span className="select-none w-6 sm:w-7 shrink-0 text-right pr-2 sm:pr-3 pt-px text-zinc-600 tabular-nums leading-[1.55]">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 whitespace-pre-wrap break-words leading-[1.55]">
                      {highlightCodeLine(line, `l-${index}`)}
                    </span>
                  </div>
                ))}
                {!done && !instant ? (
                  <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-violet-400/80 animate-pulse" />
                ) : null}
              </code>
            )}
          </pre>
        </div>
      ) : (
        <div className={cn(aboutCodePaneClass, aboutCodePanePassScrollClass)}>
          {terminal}
        </div>
      )}
    </div>
  );
};
