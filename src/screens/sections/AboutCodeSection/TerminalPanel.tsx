import { useEffect, useState } from "react";
import type { TerminalLine } from "./aboutCodeContent";

type TerminalPanelProps = {
  lines: TerminalLine[];
  active: boolean;
  instant: boolean;
};

export const TerminalPanel = ({
  lines,
  active,
  instant,
}: TerminalPanelProps): JSX.Element => {
  const [visibleCount, setVisibleCount] = useState(instant ? lines.length : 0);

  useEffect(() => {
    if (!active) return;
    if (instant) {
      setVisibleCount(lines.length);
      return;
    }
    setVisibleCount(0);
  }, [active, instant, lines.length]);

  useEffect(() => {
    if (!active || instant || visibleCount >= lines.length) return;
    const timer = window.setTimeout(() => {
      setVisibleCount((count) => count + 1);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [active, instant, lines.length, visibleCount]);

  return (
    <div
      className="bg-[#0a0a0a] px-3 py-2.5 sm:px-4 sm:py-3 font-mono text-[11px] sm:text-xs"
      aria-label="Terminal output"
    >
      <div className="mb-2 flex items-center gap-2 text-white/40">
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
          bash
        </span>
        <span className="hidden sm:inline">~/portfolio</span>
      </div>
      <div className="space-y-2">
        {lines.slice(0, visibleCount).map((line) => (
          <div key={line.command} className="space-y-0.5">
            <p className="text-sky-400/90">
              <span className="text-emerald-400/80">$</span> {line.command}
            </p>
            <p className="pl-3 text-white/65">{line.output}</p>
          </div>
        ))}
        {active && visibleCount < lines.length && !instant ? (
          <span
            className="inline-block h-3.5 w-2 animate-pulse bg-emerald-400/80"
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
};
