import {
  DEFAULT_COMING_SOON_BADGE,
  DEFAULT_COMING_SOON_MESSAGE,
  DEFAULT_COMING_SOON_NOTE,
  DEFAULT_COMING_SOON_PROGRESS,
  DEFAULT_COMING_SOON_PROGRESS_LABEL,
  DEFAULT_COMING_SOON_TITLE,
} from "@/lib/siteMode";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";

type Props = {
  badge?: string;
  title?: string;
  message?: string;
  note?: string;
  progress?: number;
  progressLabel?: string;
};

export function ComingSoonPage({
  badge = DEFAULT_COMING_SOON_BADGE,
  title = DEFAULT_COMING_SOON_TITLE,
  message = DEFAULT_COMING_SOON_MESSAGE,
  note = DEFAULT_COMING_SOON_NOTE,
  progress = DEFAULT_COMING_SOON_PROGRESS,
  progressLabel = DEFAULT_COMING_SOON_PROGRESS_LABEL,
}: Props): JSX.Element {
  const safeProgress = useMemo(() => Math.max(0, Math.min(100, Math.round(progress))), [progress]);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [pointer, setPointer] = useState({ x: 50, y: 40 });

  useEffect(() => {
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
  }, [safeProgress]);

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-black text-white"
      onMouseMove={(event) => {
        const x = (event.clientX / window.innerWidth) * 100;
        const y = (event.clientY / window.innerHeight) * 100;
        setPointer({ x, y });
      }}
    >
      <Helmet prioritizeSeoTags>
        <title>Coming Soon | Sahin Alam</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta
          name="description"
          content="The website is temporarily unavailable while a polished update is being prepared."
        />
        <meta property="og:title" content="Coming Soon | Sahin Alam" />
        <meta
          property="og:description"
          content="The website is temporarily unavailable while a polished update is being prepared."
        />
      </Helmet>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.07),transparent_25%)]" />
      <div
        className="absolute inset-0 opacity-90 transition-transform duration-300"
        style={{
          background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(168,85,247,0.12), transparent 18%), radial-gradient(circle at ${Math.max(pointer.x - 10, 0)}% ${Math.max(pointer.y - 12, 0)}%, rgba(56,189,248,0.1), transparent 16%)`,
        }}
      />
      <div className="absolute left-1/2 top-[17%] h-[52rem] w-[52rem] -translate-x-1/2 rounded-full border border-white/5 opacity-40" />
      <div
        className="absolute left-1/2 top-[26%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_35%,rgba(255,255,255,0.2),rgba(143,113,88,0.16)_25%,rgba(35,35,35,0.06)_50%,transparent_62%)] shadow-[0_0_140px_rgba(255,255,255,0.03)] transition-transform duration-300"
        style={{
          transform: `translateX(-50%) translate(${(pointer.x - 50) * 0.18}px, ${(pointer.y - 50) * 0.12}px)`,
        }}
      />
      <div className="absolute inset-x-0 top-[9%] text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.55em] text-white/85">
          {badge}
        </p>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_22%,rgba(0,0,0,0.62)_72%,rgba(0,0,0,0.92)_100%)]" />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-4xl">
          <p className="text-[11px] uppercase tracking-[0.5em] text-white/55">Portfolio experience update</p>
          <h1 className="mt-28 text-4xl font-semibold uppercase tracking-[0.35em] text-white sm:text-6xl">
            Coming Soon
          </h1>
          <h2 className="mx-auto mt-8 max-w-3xl text-2xl font-semibold leading-tight text-white/95 sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-white/65 sm:text-base">
            {message}
          </p>
          <div className="mx-auto mt-12 w-full max-w-lg">
            <div className="mb-4 flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.38em] text-white/60">
              <span>{progressLabel}</span>
              <span>{displayProgress}%</span>
            </div>
            <div className="relative h-4 rounded-full border border-fuchsia-400/60 bg-white/[0.03] p-[3px] shadow-[0_0_45px_rgba(217,70,239,0.1)] backdrop-blur-sm">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]" />
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-500 transition-[width] duration-500 ease-out"
                style={{ width: `${displayProgress}%` }}
              >
                <div className="absolute inset-y-[1px] right-0 w-12 rounded-full bg-white/40 blur-md" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-white/45">
              <span>0%</span>
              <span className="uppercase tracking-[0.35em] text-white/75">In Progress</span>
              <span>100%</span>
            </div>
          </div>
          {note ? (
            <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 text-sm leading-7 text-white/50 backdrop-blur-sm">
              {note}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
