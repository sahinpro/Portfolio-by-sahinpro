import { DESKTOP_LAYOUT_BREAKPOINT } from "@/constants/styles";
import { deferUntilIdle } from "@/lib/deferUntilIdle";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const BRAND_COLORS = {
  blue: "#789cff",
  purple: "#9500ff",
  violet: "#c37aff",
  accent: "#ee2a7b",
} as const;

const AURORA_LAYERS = 16;
const WEBGL_DEFER_MS = 4200;

const DESKTOP_AURORA_MEDIA = `(min-width: ${DESKTOP_LAYOUT_BREAKPOINT}px) and (hover: hover) and (pointer: fine)`;

const VERTEX_SHADER = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec3 uBrandBlue;
uniform vec3 uBrandPurple;
uniform vec3 uBrandViolet;
uniform vec3 uBrandAccent;

#define NUM_OCTAVES 2
#define LAYER_COUNT ${AURORA_LAYERS}.0

float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);
  return mix(
    mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
    mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 x) {
  float v = 0.0;
  float a = 0.3;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < NUM_OCTAVES; ++i) {
    v += a * noise(x);
    x = rot * x * 2.0 + shift;
    a *= 0.4;
  }
  return v;
}

void main() {
  vec2 shake = vec2(sin(iTime * 1.2) * 0.005, cos(iTime * 2.1) * 0.005);
  vec2 p = ((gl_FragCoord.xy + shake * iResolution.xy) - iResolution.xy * 0.5)
    / iResolution.y
    * mat2(6.0, -4.0, 4.0, 6.0);
  vec4 o = vec4(0.0);
  float f = 2.0 + fbm(p + vec2(iTime * 5.0, 0.0)) * 0.5;

  for (float i = 0.0; i < LAYER_COUNT; i++) {
    vec2 v = p
      + cos(i * i + (iTime + p.x * 0.08) * 0.025 + i * vec2(13.0, 11.0)) * 3.5
      + vec2(sin(iTime * 3.0 + i) * 0.003, cos(iTime * 3.5 - i) * 0.003);

    float tailNoise = fbm(v + vec2(iTime * 0.5, i)) * 0.28 * (1.0 - i / LAYER_COUNT);
    float hueShift = 0.5 + 0.5 * sin(i * 0.18 + iTime * 0.35);
    vec3 bandColor = mix(
      mix(uBrandBlue, uBrandPurple, hueShift),
      mix(uBrandPurple, uBrandViolet, hueShift),
      0.4 + 0.3 * cos(i * 0.11 + iTime * 0.42)
    );
    float accentMix = smoothstep(0.55, 0.92, sin(i * 0.28 + iTime * 0.48) * 0.5 + 0.5);
    bandColor = mix(bandColor, uBrandAccent, accentMix * 0.14);
    vec4 auroraColors = vec4(bandColor * (0.48 + 0.32 * sin(i * 0.2 + iTime * 0.38)), 1.0);
    vec4 contribution = auroraColors
      * exp(sin(i * i + iTime * 0.8))
      / length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));
    o += contribution * (1.0 + tailNoise * 0.8) * smoothstep(0.0, 1.0, i / LAYER_COUNT) * 0.6;
  }

  o = tanh(pow(o / 110.0, vec4(1.55)));
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float vignette = 1.0 - smoothstep(0.25, 0.95, length(uv - 0.5) * 1.15);
  gl_FragColor = vec4(o.rgb * mix(0.72, 1.0, vignette) * 1.35, o.a);
}
`;

const CSS_AURORA_STYLE: CSSProperties = {
  background: `
    radial-gradient(ellipse 85% 55% at 50% -15%, rgba(149, 0, 255, 0.22), transparent 58%),
    radial-gradient(ellipse 55% 45% at 85% 45%, rgba(120, 156, 255, 0.14), transparent 55%),
    radial-gradient(ellipse 50% 40% at 15% 55%, rgba(195, 122, 255, 0.12), transparent 52%),
    radial-gradient(ellipse 40% 30% at 50% 80%, rgba(238, 42, 123, 0.06), transparent 50%)
  `,
};

const hexToRgb = (hex: string): [number, number, number] => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return [1, 1, 1];
  return [
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255,
  ];
};

const getPixelRatio = (): number =>
  Math.min(window.devicePixelRatio, 1.25);

interface AuroraBackgroundProps {
  className?: string;
  opacity?: number;
}

function isDesktopAuroraEligible(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia(DESKTOP_AURORA_MEDIA).matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
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

/**
 * Mobile: CSS-only aurora (no WebGL, no Three.js) — preserves lab scores.
 * Desktop: CSS fallback + deferred WebGL rays after idle.
 */
export function AuroraBackground({
  className = "",
  opacity = 1,
}: AuroraBackgroundProps): JSX.Element {
  if (!isDesktopAuroraEligible()) {
    return <AuroraBackgroundCss className={className} opacity={opacity} />;
  }

  return (
    <AuroraBackgroundDesktopWithSync className={className} opacity={opacity} />
  );
}

function AuroraBackgroundDesktopWithSync({
  className = "",
  opacity = 1,
}: AuroraBackgroundProps): JSX.Element {
  const [desktopAurora, setDesktopAurora] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia(DESKTOP_AURORA_MEDIA);

    const sync = (): void => {
      setDesktopAurora(desktop.matches && !reducedMotion.matches);
    };

    sync();
    desktop.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    return () => {
      desktop.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  if (!desktopAurora) {
    return <AuroraBackgroundCss className={className} opacity={opacity} />;
  }

  return (
    <AuroraBackgroundDesktop className={className} opacity={opacity} />
  );
}

function AuroraBackgroundDesktop({
  className = "",
  opacity = 1,
}: AuroraBackgroundProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldInit, setShouldInit] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelDefer: (() => void) | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          cancelDefer?.();
          cancelDefer = undefined;
          setShouldInit(false);
          return;
        }
        cancelDefer?.();
        cancelDefer = deferUntilIdle(() => setShouldInit(true), WEBGL_DEFER_MS);
      },
      { rootMargin: "80px 0px", threshold: 0.01 },
    );

    observer.observe(container);
    return () => {
      cancelDefer?.();
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!shouldInit || !containerRef.current) return;

    let cancelled = false;
    let animationId = 0;

    const run = async () => {
      const THREE = await import("three");
      if (cancelled || !containerRef.current) return;

      const container = containerRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });

      const dpr = getPixelRatio();
      renderer.setPixelRatio(dpr);

      const canvas = renderer.domElement;
      canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";

      container.appendChild(canvas);
      setWebglReady(true);

      const material = new THREE.ShaderMaterial({
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new THREE.Vector2(1, 1) },
          uBrandBlue: {
            value: new THREE.Vector3(...hexToRgb(BRAND_COLORS.blue)),
          },
          uBrandPurple: {
            value: new THREE.Vector3(...hexToRgb(BRAND_COLORS.purple)),
          },
          uBrandViolet: {
            value: new THREE.Vector3(...hexToRgb(BRAND_COLORS.violet)),
          },
          uBrandAccent: {
            value: new THREE.Vector3(...hexToRgb(BRAND_COLORS.accent)),
          },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
      });

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(mesh);

      const updateSize = () => {
        if (!containerRef.current) return;
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth === 0 || clientHeight === 0) return;
        renderer.setSize(clientWidth, clientHeight, false);
        material.uniforms.iResolution.value.set(
          clientWidth * dpr,
          clientHeight * dpr,
        );
      };

      let lastFrame = 0;
      const animate = (time: number) => {
        if (cancelled) return;
        if (document.visibilityState === "visible") {
          const delta = lastFrame ? (time - lastFrame) / 1000 : 0.016;
          lastFrame = time;
          material.uniforms.iTime.value += Math.min(delta, 0.05);
          renderer.render(scene, camera);
        }
        animationId = requestAnimationFrame(animate);
      };

      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(container);
      updateSize();
      animationId = requestAnimationFrame(animate);

      cleanupRef.current = () => {
        cancelAnimationFrame(animationId);
        resizeObserver.disconnect();
        material.dispose();
        mesh.geometry.dispose();
        renderer.dispose();
        renderer.getContext().getExtension("WEBGL_lose_context")?.loseContext();
        canvas.remove();
        setWebglReady(false);
      };
    };

    void run();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [shouldInit]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none ${className}`.trim()}
      style={{ opacity }}
      aria-hidden
    >
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          ...CSS_AURORA_STYLE,
          opacity: webglReady ? 0 : 1,
        }}
      />
    </div>
  );
}
