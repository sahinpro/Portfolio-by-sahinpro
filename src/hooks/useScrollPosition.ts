import { SCROLL_THRESHOLD } from "@/constants/styles";
import { useEffect, useState } from "react";

export const useScrollPosition = (): boolean => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Restore state from sessionStorage after client-side hydration
    const savedState = sessionStorage.getItem("headerScrolled");
    if (savedState !== null) {
      setIsScrolled(savedState === "true");
    }
  }, []);

  // Save header state to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem("headerScrolled", isScrolled.toString());
  }, [isScrolled]);

  useEffect(() => {
    // Only add scroll listener after client-side hydration
    if (!isClient) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  return isScrolled;
};
