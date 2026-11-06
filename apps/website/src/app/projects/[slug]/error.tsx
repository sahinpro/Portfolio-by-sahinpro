"use client";

import { useEffect } from "react";
import Link from "next/link";

type SegmentErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProjectDetailError({
  error,
  reset,
}: SegmentErrorProps) {
  useEffect(() => {
    // Only log the opaque digest. Next.js writes the full stack server-side,
    // keyed by this same digest. `error.message` is intentionally NOT printed
    // here to avoid leaking internal details to the visitor's browser console.
    console.error("[Website] Project detail error:", error.digest);
  }, [error]);

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#050505] px-4"
    >
      <div className="text-center space-y-6 max-w-md">
        <h2 className="text-2xl font-bold text-white">
          Couldn&apos;t load this project
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          The project page failed to render. You can retry or browse all
          projects.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.1]"
          >
            Try again
          </button>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            All projects
          </Link>
        </div>
      </div>
    </main>
  );
}
