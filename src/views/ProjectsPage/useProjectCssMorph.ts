"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TransitionEvent,
} from "react";

export type ProjectMorphPhase = "idle" | "entering" | "open" | "closing";

export function useProjectCssMorph() {
  const [phase, setPhase] = useState<ProjectMorphPhase>("idle");
  const [scrollable, setScrollable] = useState(false);
  const reduceMotionRef = useRef(false);
  const openRafRef = useRef<number | null>(null);
  const phaseRef = useRef<ProjectMorphPhase>("idle");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    return () => {
      if (openRafRef.current !== null) {
        cancelAnimationFrame(openRafRef.current);
      }
    };
  }, []);

  const isOpen =
    phase === "entering" || phase === "open" || phase === "closing";
  const dataOpen = phase === "open" || phase === "closing";

  const open = useCallback(() => {
    setScrollable(false);
    setPhase("entering");

    if (reduceMotionRef.current) {
      setPhase("open");
      setScrollable(true);
      return;
    }

    openRafRef.current = requestAnimationFrame(() => {
      openRafRef.current = requestAnimationFrame(() => {
        setPhase("open");
      });
    });
  }, []);

  const close = useCallback(() => {
    if (phaseRef.current === "idle" || phaseRef.current === "closing") return;

    setScrollable(false);

    if (reduceMotionRef.current) {
      setPhase("idle");
      return;
    }

    setPhase("closing");
  }, []);

  const onShellTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget) return;
      if (event.propertyName !== "opacity") return;

      const currentPhase = phaseRef.current;

      if (currentPhase === "open") {
        setScrollable(true);
        return;
      }

      if (currentPhase === "closing") {
        const opacity = Number.parseFloat(
          getComputedStyle(event.currentTarget).opacity,
        );
        if (opacity > 0.05) return;
        setPhase("idle");
      }
    },
    [],
  );

  return {
    phase,
    isOpen,
    dataOpen,
    scrollable,
    open,
    close,
    onShellTransitionEnd,
  };
};
