"use client";

import { CTAButton } from "@/components/CTAButton";
import {
  HEADER_ANIMATION_DURATION,
  MOBILE_BREAKPOINT,
} from "@/constants/styles";
import { cn } from "@/lib/utils";
import { useMobileMenu } from "@/hooks/useMobileMenu";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useEffect, useState } from "react";
import { HeaderLogo } from "./HeaderLogo";
import { MenuButton } from "./MenuButton";
import { MobileMenu } from "./MobileMenu";
import { Navigation } from "./Navigation";

const isMobileViewport = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
};

const Header = () => {
  const isScrolled = useScrollPosition();
  const { isOpen, toggle, close } = useMobileMenu();
  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = (): void => setMobile(isMobileViewport());
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return (
    <header
      role="banner"
      className={`fixed font-sans after:content-[''] after:absolute after:top-0 after:bottom-0 after:bg-gradient-to-b after:from-black/70 after:to-transparent container mx-auto top-2 left-0 right-0 z-50 flex justify-center pt-4 sm:pt-8 px-4 rounded-xl transition-all duration-500 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
      }`}
    >
      <div
        className={cn(
          "px-2 rounded-xl transition-all ease-in-out",
          mobile
            ? "w-full"
            : isScrolled
              ? "w-[min(800px,calc(100%-0.5rem))] translate-y-0 shadow-lg shading-effect bg-white/10 backdrop-blur-md relative border border-white/20 shadow-cyan-500/10 after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-cyan-500/5 after:to-transparent after:pointer-events-none after:rounded-xl"
              : "w-full -translate-y-5 backdrop-blur-md border border-white/10",
        )}
        style={{
          transitionDuration: `${HEADER_ANIMATION_DURATION}s`,
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-px [background:radial-gradient(50%_50%_at_50%_50%,rgba(224,224,224,.2)_0%,rgba(225,225,225,0)_100%)] transition-all duration-[400ms]" />

        <div className="px-0 lg:px-1 rounded-xl w-full relative z-10 ">
          <div className="flex items-center justify-between h-16 w-full">
            <div
              className={`transition-all duration-500 ease-out delay-100 ${
                mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5"
              }`}
            >
              <HeaderLogo />
            </div>

            <nav
              aria-label="Primary"
              className="hidden lg:flex items-center space-x-10"
            >
              <Navigation />
            </nav>

            <div className="flex items-center space-x-4 m-0">
              <div
                className={`transition-all duration-400 ease-out delay-[400ms] ${
                  mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
              >
                <CTAButton
                  variant="primary"
                  href="/contact"
                  className="hidden lg:inline-flex self-end text-md font-medium rounded-[10px]"
                >
                  Get In Touch
                </CTAButton>
              </div>

              <div
                className={`lg:hidden transition-all duration-400 ease-out delay-[480ms] ${
                  mounted ? "opacity-100 scale-100" : "opacity-0 scale-90"
                }`}
              >
                <MenuButton isOpen={isOpen} onClick={toggle} />
              </div>
            </div>
          </div>

          <MobileMenu isOpen={isOpen} onClose={close} />
        </div>
      </div>
    </header>
  );
};

export default Header;
