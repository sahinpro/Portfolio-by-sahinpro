export function PageSpinner(): JSX.Element {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-black"
      aria-busy="true"
      aria-label="Loading page"
    >
      <img
        src="/logo.svg"
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 animate-pulse opacity-90"
      />
      <p className="text-xs text-zinc-500">Loading…</p>
    </div>
  );
}
