export function PageSpinner(): JSX.Element {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-black text-sm text-zinc-500"
      aria-busy="true"
      aria-label="Loading page"
    >
      Loading…
    </div>
  );
}
