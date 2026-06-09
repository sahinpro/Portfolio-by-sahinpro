export const SectionLabel = ({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}): JSX.Element => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/5 border border-white/10 text-zinc-400 ${className}`}
  >
    {children}
  </span>
);
