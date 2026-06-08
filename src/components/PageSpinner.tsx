"use client";

import Image from "next/image";

export function PageSpinner(): JSX.Element {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-black"
      aria-busy="true"
      aria-label="Loading page"
    >
      <Image
        src="/logo.svg"
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 animate-pulse opacity-90"
        priority
      />
      <p className="text-xs text-zinc-500">Loading…</p>
    </div>
  );
}
