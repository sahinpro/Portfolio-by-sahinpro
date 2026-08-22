"use client";

import { usePerformanceMode } from "@/hooks/usePerformanceMode";
import dynamic from "next/dynamic";
import { type CSSProperties } from "react";

const CSS_AURORA_STYLE: CSSProperties = {
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

function AuroraBackgroundCss({
  className = "",
  opacity = 1,
}: AuroraBackgroundProps): JSX.Element {
  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none ${className}`.trim()}
      style={{ opacity, ...CSS_AURORA_STYLE }}
      aria-hidden
    />
  );
}

const AuroraBackgroundDesktop = dynamic(
  () => import("./AuroraBackgroundDesktop"),
  { ssr: false, loading: () => <AuroraBackgroundCss /> },
);

/**
 * Mobile / reduced-motion: CSS-only aurora (no WebGL, no Three.js download).
 * Desktop fine-pointer: deferred WebGL module loaded only after capability checks.
 */
export function AuroraBackground({
  className = "",
  opacity = 1,
}: AuroraBackgroundProps): JSX.Element {
  const { richDesktopEffects } = usePerformanceMode();

  if (!richDesktopEffects) {
    return <AuroraBackgroundCss className={className} opacity={opacity} />;
  }

  return <AuroraBackgroundDesktop className={className} opacity={opacity} />;
}
