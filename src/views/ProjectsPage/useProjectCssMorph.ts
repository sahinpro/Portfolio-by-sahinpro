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
  panelSlideRef: RefObject<HTMLElement | null>,
) {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<ProjectMorphPhase>("idle");
  const [morphStyle, setMorphStyle] = useState<
    CSSProperties & Record<string, string>
  >({});
  const [panelSlideStyle, setPanelSlideStyle] = useState<
    CSSProperties & Record<string, string>
  >({});
  const [scrollable, setScrollable] = useState(false);
  const reduceMotionRef = useRef(false);
  const openRafRef = useRef<number | null>(null);

  const syncPanelTravel = useCallback(() => {
    const panel = panelSlideRef.current;
    if (!panel) return;

    const height = panel.offsetHeight;
    setPanelSlideStyle({
      "--panel-translate-y": `${Math.round(height * 0.5)}px`,
    } as CSSProperties & Record<string, string>);
  }, [panelSlideRef]);

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
  const dataOpen = phase === "open";

  useEffect(() => {
    if (!isMobile || !isOpen) return;
    syncPanelTravel();
  }, [isMobile, isOpen, syncPanelTravel]);

  const open = useCallback(() => {
    setScrollable(false);

    if (isMobile) {
      setMorphStyle({});
      setPhase("entering");

      if (reduceMotionRef.current) {
        setPhase("open");
        setScrollable(true);
        return;
      }

      openRafRef.current = requestAnimationFrame(() => {
        syncPanelTravel();
        openRafRef.current = requestAnimationFrame(() => {
          setPhase("open");
        });
      });
      return;
    }

    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setMorphStyle(readMorphVars(rect));
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
  }, [cardRef, isMobile, syncPanelTravel]);

  const close = useCallback(() => {
    if (phase === "idle" || phase === "closing") return;

    setScrollable(false);

    if (reduceMotionRef.current) {
      setPhase("idle");
      setMorphStyle({});
      setPanelSlideStyle({});
      return;
    }

    if (!isMobile) {
      const shell = shellRef.current;
      if (shell) {
        const { height } = shell.getBoundingClientRect();
        shell.style.height = `${height}px`;
      }

      setPhase("closing");

      requestAnimationFrame(() => {
        if (shell) shell.style.height = "";
      });
      return;
    }

    syncPanelTravel();
    setPhase("closing");
  }, [phase, shellRef, isMobile, syncPanelTravel]);

  const onShellTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLElement>) => {
      if (isMobile || event.target !== event.currentTarget) return;
      if (
        event.propertyName !== "width" &&
        event.propertyName !== "transform" &&
        event.propertyName !== "left"
      ) {
        return;
      }

      if (phase === "open") {
        setScrollable(true);
        return;
      }

      if (phase === "closing") {
        setPhase("idle");
        setMorphStyle({});
      }
    },
    [phase, isMobile],
  );

  const onPanelSlideTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLElement>) => {
      if (!isMobile || event.target !== event.currentTarget) return;
      if (
        event.propertyName !== "transform" &&
        event.propertyName !== "opacity"
      ) {
        return;
      }

      if (phase === "open") {
        setScrollable(true);
        return;
      }

      if (phase === "closing") {
        setPhase("idle");
        setMorphStyle({});
        setPanelSlideStyle({});
      }
    },
    [phase, isMobile],
  );

  return {
    phase,
    isOpen,
    dataOpen,
    morphStyle,
    panelSlideStyle,
    isMobile,
    scrollable,
    open,
    close,
    onShellTransitionEnd,
    onPanelSlideTransitionEnd,
  };
}
