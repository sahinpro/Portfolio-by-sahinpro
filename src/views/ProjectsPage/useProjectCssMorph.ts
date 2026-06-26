"use client";

import { useIsMobile } from "@/hooks/useIsMobile";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
  type TransitionEvent,
} from "react";

export type ProjectMorphPhase = "idle" | "entering" | "open" | "closing";

function readMorphVars(
  rect: DOMRect,
): CSSProperties & Record<string, string> {
  return {
    "--morph-x": `${rect.left}px`,
    "--morph-y": `${rect.top}px`,
    "--morph-w": `${rect.width}px`,
    "--morph-h": `${rect.height}px`,
  } as CSSProperties & Record<string, string>;
}

export function useProjectCssMorph(
  cardRef: RefObject<HTMLElement | null>,
  shellRef: RefObject<HTMLElement | null>,
) {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<ProjectMorphPhase>("idle");
  const [morphStyle, setMorphStyle] = useState<
    CSSProperties & Record<string, string>
  >({});
  const reduceMotionRef = useRef(false);
  const openRafRef = useRef<number | null>(null);

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

  const isOpen = phase === "entering" || phase === "open" || phase === "closing";
  const dataOpen = phase === "open";

  const open = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setMorphStyle(readMorphVars(rect));
    setPhase("entering");

    if (reduceMotionRef.current) {
      setPhase("open");
      return;
    }

    openRafRef.current = requestAnimationFrame(() => {
      openRafRef.current = requestAnimationFrame(() => {
        setPhase("open");
      });
    });
  }, [cardRef]);

  const close = useCallback(() => {
    if (phase === "idle" || phase === "closing") return;

    if (reduceMotionRef.current) {
      setPhase("idle");
      setMorphStyle({});
      return;
    }

    const shell = shellRef.current;
    if (shell) {
      const { height } = shell.getBoundingClientRect();
      shell.style.height = `${height}px`;
    }

    setPhase("closing");

    requestAnimationFrame(() => {
      if (shell) shell.style.height = "";
    });
  }, [phase, shellRef]);

  const onShellTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget) return;
      if (
        event.propertyName !== "width" &&
        event.propertyName !== "transform" &&
        event.propertyName !== "left"
      ) {
        return;
      }

      if (phase === "closing") {
        setPhase("idle");
        setMorphStyle({});
      }
    },
    [phase],
  );

  return {
    phase,
    isOpen,
    dataOpen,
    morphStyle,
    isMobile,
    open,
    close,
    onShellTransitionEnd,
  };
}
