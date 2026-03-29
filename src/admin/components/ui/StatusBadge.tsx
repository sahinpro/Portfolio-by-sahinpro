const styles: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  draft: "bg-amber-500/15 text-amber-200 border-amber-500/25",
  unread: "bg-red-500/15 text-red-300 border-red-500/25",
  read: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  replied: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  archived: "bg-white/10 text-white/50 border-white/15",
};

export function StatusBadge({ status }: { status: string }): JSX.Element {
  const cls = styles[status] ?? "bg-white/10 text-white/60 border-white/15";
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}
    >
      {status}
    </span>
  );
}
