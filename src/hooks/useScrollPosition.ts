"use client";

import { SCROLL_THRESHOLD } from "@/constants/styles";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const useScrollPosition = (): boolean => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsScrolled(false);
  }, [pathname]);

  useEffect(() => {
    setIsMounted(true);
    let frame = 0;

    const checkScroll = () => {
      const next = window.scrollY > SCROLL_THRESHOLD;
      setIsScrolled((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        checkScroll();
      });
    };

    checkScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return isMounted ? isScrolled : false;
};
