export function CharCounter({
  value,
  max,
}: {
  value: string;
  max: number;
}): JSX.Element {
  const n = value.length;
  const warn = n > max;
  return (
    <span className={`text-xs tabular-nums ${warn ? "text-amber-400" : "text-white/35"}`}>
      {n}/{max}
    </span>
  );
}
