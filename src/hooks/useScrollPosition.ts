"use client";

import { SCROLL_THRESHOLD } from "@/constants/styles";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const useScrollPosition = (): boolean => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsScrolled(false);
  }, [pathname]);

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
