import { gsap } from "gsap";
import { Menu, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

/**
 * Animated menu toggle button for mobile navigation
 */
export const MenuButton = ({ isOpen, onClick }: MenuButtonProps) => {
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!iconRef.current) return;

    if (isOpen) {
      gsap.fromTo(
        iconRef.current,
        { rotate: -90, opacity: 0 },
        {
          rotate: 0,
          opacity: 1,
          duration: 0.2,
          ease: "power2.out",
        }
      );
    } else {
      gsap.fromTo(
        iconRef.current,
        { rotate: 90, opacity: 0 },
        {
          rotate: 0,
          opacity: 1,
          duration: 0.2,
          ease: "power2.out",
        }
      );
    }
  }, [isOpen]);

  return (
    <button
      onClick={onClick}
      className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-[#1c1c1c] border border-[#ffffff1a] hover:border-white/40 transition-colors"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <div ref={iconRef} className="relative w-5 h-5">
        {isOpen ? (
          <X className="h-5 w-5 text-white absolute inset-0" />
        ) : (
          <Menu className="h-5 w-5 text-white absolute inset-0" />
        )}
      </div>
    </button>
  );
};
