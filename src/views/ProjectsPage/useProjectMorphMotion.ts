"use client";

import { useIsMobile } from "@/hooks/useIsMobile";
import {
  layoutSpringDesktop,
  layoutTweenReduced,
  type ProjectMorphId,
} from "@/views/ProjectsPage/projectModalStyles";
import { useReducedMotion } from "framer-motion";
import { useCallback, useMemo } from "react";

export function useProjectMorphMotion(layoutKey: string) {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const useMorph = !reduceMotion && !isMobile;

  const transition = useMemo(() => {
    if (!useMorph) return layoutTweenReduced;
    return layoutSpringDesktop;
  }, [useMorph]);

  const layoutId = useCallback(
    (id: ProjectMorphId) => (useMorph ? `${id}-${layoutKey}` : undefined),
    [layoutKey, useMorph],
  );

  return {
    transition,
    layoutId,
    isMobile,
    useMorph,
    reduceMotion: Boolean(reduceMotion),
  };
}
