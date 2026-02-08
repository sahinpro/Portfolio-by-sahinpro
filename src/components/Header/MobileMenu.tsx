import { CTAButton } from "@/components/CTAButton";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { Navigation } from "./Navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile menu component with slide animation
 */
export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuRef.current) return;

    if (isOpen) {
      gsap.fromTo(
        menuRef.current,
        { height: 0, opacity: 0 },
        {
          height: "auto",
          opacity: 1,
          duration: 0.3,
          ease: "power2.inOut",
        }
      );
    } else {
      gsap.to(menuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="overflow-hidden bg-black/50 backdrop-blur-sm rounded-xl border-t border-[#ffffff1a] lg:hidden mb-2"
    >
      <div className="px-4 py-4 space-y-2">
        <Navigation
          className="block px-3 py-2 text-base font-medium rounded-md transition-colors duration-300 hover:bg-white/5"
          onItemClick={onClose}
        />
        <div className="pt-4 m-0">
          <CTAButton
            href="/contact"
            className="w-full justify-center"
            onClick={onClose}
          >
            Get In Touch
          </CTAButton>
        </div>
      </div>
    </div>
  );
};
