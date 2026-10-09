"use client";

import { PublicImage } from "@/components/ui/PublicImage";
import { usePerformanceMode } from "@/hooks/usePerformanceMode";
import React, { useEffect, useRef } from "react";

export interface ChromaItem {
  image?: string;
  bgImage?: string;
  mainVisual?: string;
  title: string;
  subtitle?: string;
  description?: string;
  handle?: string;
  location?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
}

export interface ChromaGridProps {
  items?: ChromaItem[];
  className?: string;
  radius?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
}

const demo: ChromaItem[] = [
  {
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=75&fm=webp",
    title: "Quality Focused",
    subtitle: "Clean code and best practices",
    gradient: "linear-gradient(145deg,#4F46E5,#000)",
  },
  {
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=75&fm=webp",
    title: "Fast & Reliable",
    subtitle: "Quick turnaround and responsive",
    gradient: "linear-gradient(210deg,#10B981,#000)",
  },
  {
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=75&fm=webp",
    title: "Growth Oriented",
    subtitle: "Solutions that help your business grow",
    gradient: "linear-gradient(165deg,#F59E0B,#000)",
  },
  {
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=75&fm=webp",
    title: "Professional Service",
    subtitle: "Expert development and support",
    gradient: "linear-gradient(195deg,#EF4444,#000)",
  },
];

const handleCardClick = (url?: string) => {
  if (url) window.open(url, "_blank", "noopener,noreferrer");
};

function ChromaCardMedia({ item }: { item: ChromaItem }): JSX.Element | null {
  const src = item.mainVisual || item.image;
  if (!src && !item.bgImage) return null;

  return (
    <div className="relative z-10 flex-1 p-[10px] box-border">
      {src ? (
        <div className="relative w-full h-[200px] overflow-hidden rounded-[10px]">
          <PublicImage
            src={src}
            alt={item.title}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
            className="object-cover"
          />
        </div>
      ) : null}
      {item.bgImage ? (
        <PublicImage
          src={item.bgImage}
          alt=""
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
          className="absolute inset-0 object-cover rounded-[10px] opacity-40"
        />
      ) : null}
    </div>
  );
}

function ChromaCardFooter({ item }: { item: ChromaItem }): JSX.Element {
  return (
    <footer className="relative z-10 p-3 text-white font-sans flex flex-col gap-x-3 gap-y-1">
      <h3 className="m-0 text-xl font-semibold">{item.title}</h3>
      {item.handle ? (
        <span className="text-[0.95rem] opacity-80 text-right">{item.handle}</span>
      ) : null}
      <p className="m-0 text-[0.85rem] opacity-85">
        {item.subtitle || item.description}
      </p>
      {item.location ? (
        <span className="text-[0.85rem] opacity-85 text-right">{item.location}</span>
      ) : null}
    </footer>
  );
}

function ChromaGridStatic({
  data,
  className,
}: {
  data: ChromaItem[];
  className: string;
}): JSX.Element {
  return (
    <div
      className={`relative w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 ${className}`}
    >
      {data.map((item, i) => (
        <article
          key={`${item.title}-${i}`}
          onClick={() => handleCardClick(item.url)}
          className="group relative flex flex-col w-full min-w-0 rounded-[20px] overflow-hidden border border-white/10"
          style={{ background: item.gradient }}
        >
          <ChromaCardMedia item={item} />
          <ChromaCardFooter item={item} />
        </article>
      ))}
    </div>
  );
}

function ChromaGridInteractive({
  data,
  className,
  radius,
}: {
  data: ChromaItem[];
  className: string;
  radius: number;
}): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0, inside: false });
  const rafRef = useRef(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    pointer.current.x = width / 2;
    pointer.current.y = height / 2;
    pointer.current.tx = width / 2;
    pointer.current.ty = height / 2;
    el.style.setProperty("--x", `${pointer.current.x}px`);
    el.style.setProperty("--y", `${pointer.current.y}px`);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const tick = () => {
    const el = rootRef.current;
    const fade = fadeRef.current;
    if (!el) return;
    const p = pointer.current;
    p.x += (p.tx - p.x) * 0.22;
    p.y += (p.ty - p.y) * 0.22;
    el.style.setProperty("--x", `${p.x}px`);
    el.style.setProperty("--y", `${p.y}px`);
    if (fade) fade.style.opacity = p.inside ? "0" : "1";

    const moving = Math.abs(p.tx - p.x) > 0.4 || Math.abs(p.ty - p.y) > 0.4;
    if (moving) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = 0;
    }
  };

  const schedule = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(tick);
  };

  const handleMove = (e: React.PointerEvent) => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    pointer.current.tx = e.clientX - r.left;
    pointer.current.ty = e.clientY - r.top;
    pointer.current.inside = true;
    if (!startedRef.current) {
      pointer.current.x = pointer.current.tx;
      pointer.current.y = pointer.current.ty;
      startedRef.current = true;
    }
    schedule();
  };

  const handleLeave = () => {
    pointer.current.inside = false;
    schedule();
  };

  const handleCardMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const c = e.currentTarget;
    const rect = c.getBoundingClientRect();
    c.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    c.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={rootRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`relative w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 ${className}`}
      style={
        {
          "--r": `${radius}px`,
          "--x": "50%",
          "--y": "50%",
        } as React.CSSProperties
      }
    >
      {data.map((item, i) => (
        <article
          key={`${item.title}-${i}`}
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(item.url)}
          className="group relative flex flex-col w-full min-w-0 rounded-[20px] overflow-hidden border border-white/10 transition-colors duration-300 cursor-pointer hover:border-white/20"
          style={
            {
              "--card-border": item.borderColor || "transparent",
              background: item.gradient,
              "--spotlight-color": "rgba(255,255,255,0.3)",
            } as React.CSSProperties
          }
        >
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)",
            }}
          />
          <ChromaCardMedia item={item} />
          <ChromaCardFooter item={item} />
        </article>
      ))}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          backdropFilter: "grayscale(1) brightness(0.78)",
          WebkitBackdropFilter: "grayscale(1) brightness(0.78)",
          background: "rgba(0,0,0,0.001)",
          maskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)",
          WebkitMaskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)",
        }}
      />
      <div
        ref={fadeRef}
        className="absolute inset-0 pointer-events-none z-40"
        style={{
          backdropFilter: "grayscale(1) brightness(0.78)",
          WebkitBackdropFilter: "grayscale(1) brightness(0.78)",
          background: "rgba(0,0,0,0.001)",
          maskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)",
          opacity: 1,
          transition: "opacity 0.35s ease",
        }}
      />
    </div>
  );
}

const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  className = "",
  radius = 400,
}) => {
  const { simpleVisuals } = usePerformanceMode();
  const data = items?.length ? items : demo;

  if (simpleVisuals) {
    return <ChromaGridStatic data={data} className={className} />;
  }

  return (
    <ChromaGridInteractive data={data} className={className} radius={radius} />
  );
};

export default ChromaGrid;
