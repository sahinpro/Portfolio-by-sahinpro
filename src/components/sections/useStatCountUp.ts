import { useEffect, useState } from "react";

export function parseStatValue(value: string): { target: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return { target: 0, suffix: value };
  return { target: Number.parseInt(match[1], 10), suffix: match[2] };
}

export function useStatCountUp(
  value: string,
  active: boolean,
  durationMs = 1400,
): string {
  const { target, suffix } = parseStatValue(value);
  const [count, setCount] = useState(active ? target : 0);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }

    if (target === 0) {
      setCount(0);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, durationMs]);

  return `${count}${suffix}`;
}
