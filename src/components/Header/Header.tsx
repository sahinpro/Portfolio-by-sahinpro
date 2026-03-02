import { CTAButton } from "@/components/CTAButton";
import { HEADER_ANIMATION_DURATION, MOBILE_BREAKPOINT } from "@/constants/styles";
import { useMobileMenu } from "@/hooks/useMobileMenu";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { HeaderLogo } from "./HeaderLogo";
import { MenuButton } from "./MenuButton";
import { MobileMenu } from "./MobileMenu";
import { Navigation } from "./Navigation";

/**
 * Get responsive max width for header based on screen size
 */
const getMaxWidth = (): string => {
  if (typeof window === "undefined") return "800px";
  return window.innerWidth < MOBILE_BREAKPOINT ? "calc(100% - 2rem)" : "800px";
};

/**
 * Main header component with scroll animations and responsive navigation
 */
const Header = () => {
  const isScrolled = useScrollPosition();
  const { isOpen, toggle, close } = useMobileMenu();
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial header animation
    if (headerRef.current) {
      animate(
        headerRef.current,
        { opacity: [0, 1], y: [-20, 0] },
        { duration: 0.5, ease: "easeOut" }
      );
    }

    // Logo animation
    if (logoRef.current) {
      animate(
        logoRef.current,
        { opacity: [0, 1], x: [-20, 0] },
        { duration: 0.5, delay: 0.1, ease: "easeOut" }
      );
    }

    // CTA button animation
    if (ctaRef.current) {
      animate(
        ctaRef.current,
        { opacity: [0, 1], x: [20, 0] },
        { duration: 0.4, delay: 0.4, ease: "easeOut" }
      );
    }

    // Menu button animation
    if (menuBtnRef.current) {
      animate(
        menuBtnRef.current,
        { opacity: [0, 1], scale: [0.8, 1] },
        { duration: 0.4, delay: 0.48, ease: "easeOut" }
      );
    }
  }, []);

  useEffect(() => {
    // Animate container on scroll
    if (containerRef.current) {
      animate(
        containerRef.current,
        {
          width: isScrolled ? getMaxWidth() : "100%",
          borderRadius: "20px",
          scale: isScrolled ? 1 : 0.95,
          y: isScrolled ? 0 : -20,
        },
        { duration: HEADER_ANIMATION_DURATION, ease: "easeInOut" }
      );
    }
  }, [isScrolled]);

  return (
    <div
      ref={headerRef}
      className="fixed font-sans after:content-[''] after:absolute after:top-0 after:bottom-0 after:bg-gradient-to-b after:from-black/70 after:to-transparent container mx-auto top-2 left-0 right-0 z-50 flex justify-center pt-4 sm:pt-8 px-4 rounded-xl"
    >
      <div
        ref={containerRef}
        className={`px-2 ${
          isScrolled
            ? "shadow-lg shading-effect bg-black/50 backdrop-blur-sm rounded-xl relative border border-[#ffffff1a] shadow-cyan-500/10 after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-cyan-500/5 after:to-transparent after:pointer-events-none after:rounded-xl"
            : "backdrop-blur-md border border-white/10 r  "
        }`}
      >
        {/* Shade line underneath header */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px [background:radial-gradient(50%_50%_at_50%_50%,rgba(224,224,224,.2)_0%,rgba(225,225,225,0)_100%)] transition-all duration-[400ms]"
        />

        <div className="px-0 lg:px-3 rounded-xl w-full relative z-10 ">
          <div className="flex items-center justify-between h-16 w-full">
            {/* Logo */}
            <div ref={logoRef}>
              <HeaderLogo />
            </div>

            {/* Desktop Navigation */}
            <nav ref={navRef} className="hidden lg:flex items-center space-x-8">
              <Navigation />
            </nav>

            {/* Bottom Actions */}
            <div ref={actionsRef} className="flex items-center space-x-4 m-0">
              {/* CTA Button */}
              <div ref={ctaRef}>
                <CTAButton variant="primary" href="/contact" className="hidden lg:inline-flex self-end text-md font-medium">
                  Get In Touch
                </CTAButton>
              </div>

              {/* Mobile menu button */}
              <div ref={menuBtnRef} className="lg:hidden">
                <MenuButton isOpen={isOpen} onClick={toggle} />
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <MobileMenu isOpen={isOpen} onClose={close} />
        </div>
      </div>
    </div>
  );
};

export default Header;