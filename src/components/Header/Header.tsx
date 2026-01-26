import { HEADER_ANIMATION_DURATION, MOBILE_BREAKPOINT } from "@/constants/styles";
import { useMobileMenu } from "@/hooks/useMobileMenu";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { motion } from "framer-motion";
import { CTAButton } from "../CTAButton";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="fixed font-sans after:content-[''] after:absolute after:top-0 after:bottom-0 after:bg-gradient-to-b after:from-black/50 after:to-transparent container mx-auto top-2 left-0 right-0 z-50 flex justify-center pt-4 sm:pt-8 px-4 rounded-xl"
    >
      <motion.div
        initial={false}
        animate={{
          width: isScrolled ? getMaxWidth() : "100%",
          borderRadius: isScrolled ? "20px" : "20px",
          scale: isScrolled ? 1 : 0.95,
          y: isScrolled ? 0 : -20,
        }}
        transition={{
          duration: HEADER_ANIMATION_DURATION,
          ease: "easeInOut",
        }}
        className={`px-2 ${
          isScrolled
            ? "shadow-lg shading-effect bg-[#050505]/90 backdrop-blur-sm rounded-xl relative border border-[#ffffff1a] shadow-cyan-500/10 after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-cyan-500/5 after:to-transparent after:pointer-events-none after:rounded-xl"
            : "backdrop-blur-md border border-white/10 r  "
        }`}
      >
        {/* Shade line underneath header */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px [background:radial-gradient(50%_50%_at_50%_50%,rgba(224,224,224,.4)_0%,rgba(225,225,225,0)_100%)] transition-all duration-[400ms]"
        />

        <div className="px-0 lg:px-3 rounded-xl w-full relative z-10 ">
          <div className="flex items-center justify-between h-16 w-full">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <HeaderLogo />
            </motion.div>

            {/* Desktop Navigation */}
            <motion.nav
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    delayChildren: 0.2,
                    staggerChildren: 0.05,
                  },
                },
              }}
              className="hidden lg:flex items-center space-x-8"
            >
              <Navigation />
            </motion.nav>

            {/* bottom Actions */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    delayChildren: 0.4,
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="flex items-center space-x-4 m-0"
            >
              {/* CTA Button */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: {
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
              >
                <CTAButton variant="primary" href="/contact" className="hidden sm:inline-flex text-md font-medium">
                  Get In Touch
                </CTAButton>
              </motion.div>

              {/* Mobile menu button */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
              >
                <MenuButton isOpen={isOpen} onClick={toggle} />
              </motion.div>
            </motion.div>
          </div>

          {/* Mobile Navigation */}
          <MobileMenu isOpen={isOpen} onClose={close} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Header;
