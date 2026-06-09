import { useEffect, useRef, useState, type ReactNode } from "react";

type LazySectionProps = {
  children: ReactNode;
  minHeight?: number;
  className?: string;
};

/** Defers mount until near viewport; uses div to avoid nested section tags. */
export function LazySection({
  children,
  minHeight = 400,
  className = "",
}: LazySectionProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`section-lazy w-full ${className}`.trim()}
      style={{ minHeight: visible ? undefined : minHeight }}
    >
      {visible ? children : null}
    </div>
  );
}
