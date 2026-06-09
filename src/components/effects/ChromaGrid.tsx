import { animate, AnimationPlaybackControls } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

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

const MOBILE_BREAKPOINT = 768;

const useSimpleMode = (): boolean => {
  const [simple, setSimple] = useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth <= MOBILE_BREAKPOINT ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setSimple(mq.matches || motion.matches);
    update();
    mq.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  return simple;
};

const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  className = "",
  radius = 400,
  damping = 0.35,
  fadeOut = 0.5,
}) => {
  const simpleMode = useSimpleMode();
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const pos = useRef({ x: 0, y: 0 });
  const posControls = useRef<{
    x: AnimationPlaybackControls | null;
    y: AnimationPlaybackControls | null;
  }>({ x: null, y: null });
  const fadeControls = useRef<AnimationPlaybackControls | null>(null);

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

  const data = items?.length ? items : demo;

  useEffect(() => {
    if (simpleMode) return;
    const el = rootRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    el.style.setProperty("--x", `${pos.current.x}px`);
    el.style.setProperty("--y", `${pos.current.y}px`);
  }, [simpleMode]);

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    if (cards.length === 0) return;

    if (simpleMode) {
      cards.forEach((card) => {
        card.style.opacity = "1";
        card.style.transform = "none";
      });
      return;
    }

    const totalDuration = 0.6;
    cards.forEach((card, i) => {
      const delay = 0.2 + (i / Math.max(cards.length - 1, 1)) * totalDuration;
      animate(
        card,
        { opacity: [0, 1], y: [40, 0], scale: [0.95, 1] },
        { duration: 0.8, ease: "easeOut", delay },
      );
    });
  }, [data.length, simpleMode]);

  const moveTo = (targetX: number, targetY: number) => {
    const el = rootRef.current;
    if (!el) return;
    posControls.current.x?.stop();
    posControls.current.y?.stop();

    posControls.current.x = animate(pos.current.x, targetX, {
      duration: damping,
      ease: "easeOut",
      onUpdate: (v) => {
        pos.current.x = v;
        el.style.setProperty("--x", `${v}px`);
      },
    });

    posControls.current.y = animate(pos.current.y, targetY, {
      duration: damping,
      ease: "easeOut",
      onUpdate: (v) => {
        pos.current.y = v;
        el.style.setProperty("--y", `${v}px`);
      },
    });
  };

  const handleMove = (e: React.PointerEvent) => {
    if (simpleMode) return;
    const r = rootRef.current!.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);

    fadeControls.current?.stop();
    fadeControls.current = animate(
      fadeRef.current!,
      { opacity: 0 },
      { duration: 0.25 },
    );
  };

  const handleLeave = () => {
    if (simpleMode) return;
    fadeControls.current?.stop();
    fadeControls.current = animate(
      fadeRef.current!,
      { opacity: 1 },
      { duration: fadeOut },
    );
  };

  const handleCardClick = (url?: string) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCardMove: React.MouseEventHandler<HTMLElement> = (e) => {
    if (simpleMode) return;
    const c = e.currentTarget as HTMLElement;
    const rect = c.getBoundingClientRect();
    c.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    c.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={rootRef}
      onPointerMove={simpleMode ? undefined : handleMove}
      onPointerLeave={simpleMode ? undefined : handleLeave}
      className={`relative w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 ${className}`}
      style={
        simpleMode
          ? undefined
          : ({
              "--r": `${radius}px`,
              "--x": "50%",
              "--y": "50%",
            } as React.CSSProperties)
      }
    >
      {data.map((c, i) => (
        <article
          key={i}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(c.url)}
          className="group relative flex flex-col w-full min-w-0 rounded-[20px] overflow-hidden border border-white/10 transition-colors duration-300 cursor-pointer hover:border-white/20"
          style={
            {
              "--card-border": c.borderColor || "transparent",
              background: c.gradient,
              "--spotlight-color": "rgba(255,255,255,0.3)",
              opacity: simpleMode ? 1 : 0,
              transform: simpleMode ? "none" : "translateY(40px) scale(0.95)",
            } as React.CSSProperties
          }
        >
          {!simpleMode ? (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)",
              }}
            />
          ) : null}
          <div className="relative z-10 flex-1 p-[10px] box-border">
            {c.mainVisual ? (
              <img
                src={c.mainVisual}
                alt={c.title}
                loading="lazy"
                decoding="async"
                className="w-full h-[200px] object-cover rounded-[10px]"
              />
            ) : c.image ? (
              <img
                src={c.image}
                alt={c.title}
                loading="lazy"
                decoding="async"
                className="w-full h-[200px] object-cover rounded-[10px]"
              />
            ) : null}
            {c.bgImage && (
              <img
                src={c.bgImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover rounded-[10px] opacity-40"
                aria-hidden="true"
              />
            )}
          </div>
          <footer className="relative z-10 p-3 text-white font-sans flex flex-col gap-x-3 gap-y-1">
            <h3 className="m-0 text-xl font-semibold">{c.title}</h3>
            {c.handle && (
              <span className="text-[0.95rem] opacity-80 text-right">
                {c.handle}
              </span>
            )}
            <p className="m-0 text-[0.85rem] opacity-85">
              {c.subtitle || c.description}
            </p>
            {c.location && (
              <span className="text-[0.85rem] opacity-85 text-right">
                {c.location}
              </span>
            )}
          </footer>
        </article>
      ))}
      {!simpleMode ? (
        <>
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
            className="absolute inset-0 pointer-events-none transition-opacity duration-[250ms] z-40"
            style={{
              backdropFilter: "grayscale(1) brightness(0.78)",
              WebkitBackdropFilter: "grayscale(1) brightness(0.78)",
              background: "rgba(0,0,0,0.001)",
              maskImage:
                "radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)",
              opacity: 1,
            }}
          />
        </>
      ) : null}
    </div>
  );
};

export default ChromaGrid;
