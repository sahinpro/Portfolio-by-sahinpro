"use client";

import { CTAButton } from "@/components/common/CTAButton";
import { HEADER_ANIMATION_DURATION } from "@/constants/styles";
import { useMobileMenu } from "@/hooks/useMobileMenu";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { HeaderLogo } from "./HeaderLogo";
import { MenuButton } from "./MenuButton";
import { MobileMenu } from "./MobileMenu";
import { Navigation } from "./Navigation";

const desktopGlassBarClasses =
  "lg:shadow-lg lg:shading-effect lg:bg-white/10 lg:backdrop-blur-md lg:border lg:border-white/20 lg:shadow-cyan-500/10 lg:after:absolute lg:after:inset-0 lg:after:bg-gradient-to-r lg:after:from-transparent lg:after:via-cyan-500/5 lg:after:to-transparent lg:after:pointer-events-none lg:after:rounded-xl";

const mobileGlassBarClasses =
  "max-lg:w-full max-lg:translate-y-0 max-lg:shadow-lg max-lg:shading-effect max-lg:bg-white/10 max-lg:backdrop-blur-md max-lg:border max-lg:border-white/20 max-lg:shadow-cyan-500/10 max-lg:after:absolute max-lg:after:inset-0 max-lg:after:bg-gradient-to-r max-lg:after:from-transparent max-lg:after:via-cyan-500/5 max-lg:after:to-transparent max-lg:after:pointer-events-none max-lg:after:rounded-xl";

const Header = () => {
  const isScrolled = useScrollPosition();
  const { isOpen, toggle, close } = useMobileMenu();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header
      role="banner"
      className={`fixed font-sans after:content-[''] after:absolute after:inset-x-0 after:top-0 after:bottom-0 after:bg-gradient-to-b after:from-[#050505] after:to-transparent container mx-auto top-0 left-0 right-0 z-50 flex justify-center pt-6 sm:pt-10 px-4 rounded-xl transition-opacity duration-500 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-100 -translate-y-5"
      }`}
    >
      <div
        className={cn(
          "header-glass mx-auto px-2 rounded-2xl relative z-[100] w-full",
          "transition-[max-width,transform,background-color,border-color,box-shadow]",
          "ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          mobileGlassBarClasses,
          isScrolled
            ? cn(
                "lg:max-w-[min(800px,calc(100%-0.5rem))] lg:translate-y-0",
                desktopGlassBarClasses,
              )
            : "lg:max-w-[min(1400px,calc(100%-0.5rem))] lg:-translate-y-5 lg:backdrop-blur-md lg:border lg:border-white/10",
        )}
        style={{
          transitionDuration: `${HEADER_ANIMATION_DURATION}s`,
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-px [background:radial-gradient(50%_50%_at_50%_50%,rgba(224,224,224,.2)_0%,rgba(225,225,225,0)_100%)] transition-all duration-[400ms]" />

        <div className="px-0 lg:px-1 rounded-2xl w-full relative z-[100] ">
          <div className="flex items-center justify-between h-[55px] lg:h-16 w-full">
            <div
              className={`transition-opacity duration-500 ease-out delay-100 ${
                mounted ? "opacity-100" : "opacity-0"
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
                  mounted
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-5"
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
