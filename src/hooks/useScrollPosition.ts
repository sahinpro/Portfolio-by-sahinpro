"use client";

import { DESKTOP_LAYOUT_BREAKPOINT, SCROLL_THRESHOLD } from "@/constants/styles";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Desktop header shrink only. Mobile classes do not depend on this bit, so
 * phones never attach a scroll listener (avoids rAF + setState while scrolling).
 */
export const useScrollPosition = (): boolean => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsScrolled(false);
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia(
      `(min-width: ${DESKTOP_LAYOUT_BREAKPOINT}px)`,
    );

    let frame = 0;
    let last = false;

    const read = (): boolean => window.scrollY > SCROLL_THRESHOLD;

    const publish = (next: boolean): void => {
      if (next === last) return;
      last = next;
      setIsScrolled(next);
    };

    const checkScroll = (): void => {
      if (!desktop.matches) {
        publish(false);
        return;
      }
      publish(read());
    };

    const onScroll = (): void => {
      if (!desktop.matches) return;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        checkScroll();
      });
    };

    checkScroll();

    if (!desktop.matches) {
      const onChange = (): void => {
        checkScroll();
      };
      desktop.addEventListener("change", onChange);
      return () => desktop.removeEventListener("change", onChange);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    desktop.addEventListener("change", checkScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      desktop.removeEventListener("change", checkScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return isScrolled;
};
