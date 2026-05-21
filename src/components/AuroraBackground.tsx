import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/** Matches hero subtitle / title gradients */
const BRAND_COLORS = {
  blue: "#789cff",
  purple: "#9500ff",
  violet: "#c37aff",
  accent: "#ee2a7b",
} as const;

const hexToVec3 = (hex: string): THREE.Vector3 => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return new THREE.Vector3(1, 1, 1);
  return new THREE.Vector3(
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255,
  );
};

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

#define NUM_OCTAVES 3

float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);

  float res = mix(
    mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
    mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
    u.y
  );
  return res * res;
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
  vec2 v;
  vec4 o = vec4(0.0);

  float f = 2.0 + fbm(p + vec2(iTime * 5.0, 0.0)) * 0.5;

  for (float i = 0.0; i < 35.0; i++) {
    v = p
      + cos(i * i + (iTime + p.x * 0.08) * 0.025 + i * vec2(13.0, 11.0)) * 3.5
      + vec2(sin(iTime * 3.0 + i) * 0.003, cos(iTime * 3.5 - i) * 0.003);

    float tailNoise = fbm(v + vec2(iTime * 0.5, i)) * 0.3 * (1.0 - (i / 35.0));

    float hueShift = 0.5 + 0.5 * sin(i * 0.18 + iTime * 0.35);
    vec3 bandColor = mix(
      mix(uBrandBlue, uBrandPurple, hueShift),
      mix(uBrandPurple, uBrandViolet, hueShift),
      0.4 + 0.3 * cos(i * 0.11 + iTime * 0.42)
    );
    float accentMix = smoothstep(
      0.55,
      0.92,
      sin(i * 0.28 + iTime * 0.48) * 0.5 + 0.5
    );
    bandColor = mix(bandColor, uBrandAccent, accentMix * 0.14);
    float intensity = 0.48 + 0.32 * sin(i * 0.2 + iTime * 0.38);
    vec4 auroraColors = vec4(bandColor * intensity, 1.0);

    vec4 currentContribution =
      auroraColors
      * exp(sin(i * i + iTime * 0.8))
      / length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));

    float thinnessFactor = smoothstep(0.0, 1.0, i / 35.0) * 0.6;
    o += currentContribution * (1.0 + tailNoise * 0.8) * thinnessFactor;
  }

  o = tanh(pow(o / 110.0, vec4(1.55)));

  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float vignette = 1.0 - smoothstep(0.25, 0.95, length(uv - 0.5) * 1.15);
  o.rgb *= mix(0.72, 1.0, vignette);

  gl_FragColor = vec4(o.rgb * 1.35, o.a);
}
`;

interface AuroraBackgroundProps {
  className?: string;
  opacity?: number;
}

export function AuroraBackground({
  className = "",
  opacity = 1,
}: AuroraBackgroundProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observerRef.current.observe(container);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    cleanupRef.current?.();
    cleanupRef.current = null;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });

    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);

    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(canvas);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(1, 1) },
        uBrandBlue: { value: hexToVec3(BRAND_COLORS.blue) },
        uBrandPurple: { value: hexToVec3(BRAND_COLORS.purple) },
        uBrandViolet: { value: hexToVec3(BRAND_COLORS.violet) },
        uBrandAccent: { value: hexToVec3(BRAND_COLORS.accent) },
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

    let animationId = 0;
    const animate = () => {
      material.uniforms.iTime.value += 0.016;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    updateSize();
    animate();

    cleanupRef.current = () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();

      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();

      const loseContext = renderer.getContext().getExtension("WEBGL_lose_context");
      loseContext?.loseContext();

      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none ${className}`.trim()}
      style={{ opacity }}
      aria-hidden
    />
  );
}
