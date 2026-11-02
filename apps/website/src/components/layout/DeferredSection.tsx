"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function DeferredSection({
  children,
  fallback,
  rootMargin = "600px 0px",
}: {
  children: ReactNode;
  fallback: ReactNode;
  rootMargin?: string;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldRender, rootMargin]);

  return (
    <div ref={ref} className="w-full">
      {shouldRender ? children : fallback}
    </div>
  );
}
