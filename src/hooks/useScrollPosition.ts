"use client";

import { SCROLL_THRESHOLD } from "@/constants/styles";
import { useEffect, useState } from "react";
// For Next.js App Router, use: import { usePathname } from "next/navigation"; and pathname = usePathname()
import { useLocation } from "react-router-dom";

export const useScrollPosition = (): boolean => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  // On route change: scroll to top and reset scrolled state so the header
  // never stays in "scrolled" state on the new page. Runs before the
  // scroll-listener effect (same tick, declared first).
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsScrolled(false);
  }, [pathname]);

  // Re-run when pathname changes so we re-check scroll position (no scroll
  // event fires on navigation). This runs after the effect above.
  useEffect(() => {
    setIsMounted(true);

    const checkScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    checkScroll();

    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, [pathname]);

  return isMounted ? isScrolled : false;
};
