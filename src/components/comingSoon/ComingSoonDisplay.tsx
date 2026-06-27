"use client";

import {
  DEFAULT_COMING_SOON_BADGE,
  DEFAULT_COMING_SOON_MESSAGE,
  DEFAULT_COMING_SOON_NOTE,
  DEFAULT_COMING_SOON_PROGRESS,
  DEFAULT_COMING_SOON_PROGRESS_LABEL,
  DEFAULT_COMING_SOON_TITLE,
} from "@/lib/siteMode";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

export type ComingSoonDisplayProps = {
  badge?: string;
  title?: string;
  message?: string;
  note?: string;
  progress?: number;
  progressLabel?: string;
  /** Full-page public view or scaled admin preview frame. */
  variant?: "page" | "preview";
};

export function ComingSoonDisplay({
  badge = DEFAULT_COMING_SOON_BADGE,
  title = DEFAULT_COMING_SOON_TITLE,
  message = DEFAULT_COMING_SOON_MESSAGE,
  note = DEFAULT_COMING_SOON_NOTE,
  progress = DEFAULT_COMING_SOON_PROGRESS,
  progressLabel = DEFAULT_COMING_SOON_PROGRESS_LABEL,
  variant = "page",
}: ComingSoonDisplayProps): JSX.Element {
  const safeProgress = useMemo(
    () => Math.max(0, Math.min(100, Math.round(progress))),
    [progress],
  );
  const [displayProgress, setDisplayProgress] = useState(
    variant === "preview" ? safeProgress : 0,
  );
  const [pointer, setPointer] = useState({ x: 50, y: 40 });
  const isPreview = variant === "preview";

  useEffect(() => {
    if (isPreview) {
      setDisplayProgress(safeProgress);
      return;
    }

    setDisplayProgress(0);
    const id = window.setInterval(() => {
      setDisplayProgress((current) => {
        if (current >= safeProgress) {
          window.clearInterval(id);
          return safeProgress;
        }
        return Math.min(safeProgress, current + 1);
      });
    }, 18);

    return () => window.clearInterval(id);
  }, [isPreview, safeProgress]);

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPointer({ x, y });
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-black text-white",
        isPreview ? "h-full min-h-[520px] rounded-[1.75rem]" : "min-h-screen",
      )}
      onMouseMove={handlePointerMove}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.07),transparent_25%)]" />
      <div
        className="absolute inset-0 opacity-90 transition-transform duration-300"
        style={{
          background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(168,85,247,0.12), transparent 18%), radial-gradient(circle at ${Math.max(pointer.x - 10, 0)}% ${Math.max(pointer.y - 12, 0)}%, rgba(56,189,248,0.1), transparent 16%)`,
        }}
      />
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 rounded-full border border-white/5 opacity-40",
          isPreview ? "top-[12%] h-[22rem] w-[22rem]" : "top-[17%] h-[52rem] w-[52rem]",
        )}
      />
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_35%,rgba(255,255,255,0.2),rgba(143,113,88,0.16)_25%,rgba(35,35,35,0.06)_50%,transparent_62%)] shadow-[0_0_140px_rgba(255,255,255,0.03)] transition-transform duration-300",
          isPreview ? "top-[18%] h-[14rem] w-[14rem]" : "top-[26%] h-[32rem] w-[32rem]",
        )}
        style={{
          transform: `translateX(-50%) translate(${(pointer.x - 50) * 0.18}px, ${(pointer.y - 50) * 0.12}px)`,
        }}
      />
      <div
        className={cn(
          "absolute inset-x-0 text-center",
          isPreview ? "top-[6%]" : "top-[9%]",
        )}
      >
        <p
          className={cn(
            "font-semibold uppercase text-white/85",
            isPreview
              ? "text-[8px] tracking-[0.35em]"
              : "text-[11px] tracking-[0.55em]",
          )}
        >
          {badge}
        </p>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_22%,rgba(0,0,0,0.62)_72%,rgba(0,0,0,0.92)_100%)]" />

      <main
        className={cn(
          "relative z-10 mx-auto flex flex-col items-center justify-center px-6 text-center",
          isPreview ? "min-h-full py-10" : "min-h-screen max-w-6xl py-16",
        )}
      >
        <div className={cn("max-w-4xl", isPreview && "scale-[0.92] sm:scale-100")}>
          <p
            className={cn(
              "uppercase text-white/55",
              isPreview ? "text-[8px] tracking-[0.32em]" : "text-[11px] tracking-[0.5em]",
            )}
          >
            Portfolio experience update
          </p>
          <h1
            className={cn(
              "font-semibold uppercase tracking-[0.35em] text-white",
              isPreview ? "mt-10 text-2xl" : "mt-28 text-4xl sm:text-6xl",
            )}
          >
            Coming Soon
          </h1>
          <h2
            className={cn(
              "mx-auto max-w-3xl font-semibold leading-tight text-white/95",
              isPreview ? "mt-4 text-base" : "mt-8 text-2xl sm:text-4xl",
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              "mx-auto max-w-2xl leading-7 text-white/65",
              isPreview ? "mt-3 text-[11px] leading-6" : "mt-6 text-sm leading-8 sm:text-base",
            )}
          >
            {message}
          </p>
          <div className={cn("mx-auto w-full max-w-lg", isPreview ? "mt-6" : "mt-12")}>
            <div
              className={cn(
                "mb-3 flex items-center justify-between gap-4 uppercase text-white/60",
                isPreview ? "text-[8px] tracking-[0.28em]" : "text-[11px] tracking-[0.38em]",
              )}
            >
              <span>{progressLabel}</span>
              <span>{displayProgress}%</span>
            </div>
            <div
              className={cn(
                "relative rounded-full border border-fuchsia-400/60 bg-white/[0.03] p-[3px] shadow-[0_0_45px_rgba(217,70,239,0.1)] backdrop-blur-sm",
                isPreview ? "h-3" : "h-4",
              )}
            >
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]" />
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-500 transition-[width] duration-500 ease-out"
                style={{ width: `${displayProgress}%` }}
              >
                <div className="absolute inset-y-[1px] right-0 w-12 rounded-full bg-white/40 blur-md" />
              </div>
            </div>
            <div
              className={cn(
                "mt-3 flex items-center justify-between text-white/45",
                isPreview ? "text-[9px]" : "text-xs",
              )}
            >
              <span>0%</span>
              <span className="uppercase tracking-[0.35em] text-white/75">In Progress</span>
              <span>100%</span>
            </div>
          </div>
          {note ? (
            <div
              className={cn(
                "mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] text-white/50 backdrop-blur-sm",
                isPreview
                  ? "mt-6 px-4 py-3 text-[10px] leading-6"
                  : "mt-12 px-6 py-5 text-sm leading-7",
              )}
            >
              {note}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
