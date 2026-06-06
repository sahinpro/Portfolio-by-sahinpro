import { type CSSProperties } from "react";

const FALLBACK_STYLE: CSSProperties = {
  background: `
    radial-gradient(ellipse 85% 55% at 50% -15%, rgba(149, 0, 255, 0.22), transparent 58%),
    radial-gradient(ellipse 55% 45% at 85% 45%, rgba(120, 156, 255, 0.14), transparent 55%),
    radial-gradient(ellipse 50% 40% at 15% 55%, rgba(195, 122, 255, 0.12), transparent 52%),
    radial-gradient(ellipse 40% 30% at 50% 80%, rgba(238, 42, 123, 0.06), transparent 50%)
  `,
};

interface AuroraBackgroundProps {
  className?: string;
  opacity?: number;
}

/** CSS-only aurora keeps LCP/TBT fast on mobile and desktop lab scores. */
export function AuroraBackground({
  className = "",
  opacity = 1,
}: AuroraBackgroundProps): JSX.Element {
  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none ${className}`.trim()}
      style={{ opacity, ...FALLBACK_STYLE }}
      aria-hidden
    />
  );
}
