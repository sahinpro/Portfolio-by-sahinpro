import { CTAButton } from "@/components/CTAButton";
import { animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Navigation } from "./Navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!menuRef.current) return;
    const el = menuRef.current;

    if (isOpen) {
      el.style.display = "block";
      el.style.overflow = "hidden";
      const targetHeight = el.scrollHeight;

      animate(
        el,
        { height: [0, targetHeight], opacity: [0, 1] },
        {
          duration: 0.3,
          ease: "easeInOut",
          onComplete: () => {
            el.style.height = "auto";
            el.style.overflow = "";
          },
        }
      );
      isMountedRef.current = true;
    } else {
      if (!isMountedRef.current) return;
      const currentHeight = el.scrollHeight;
      el.style.overflow = "hidden";

      animate(
        el,
        { height: [currentHeight, 0], opacity: [1, 0] },
        {
          duration: 0.3,
          ease: "easeInOut",
          onComplete: () => {
            el.style.display = "none";
            el.style.height = "auto";
            el.style.overflow = "";
            isMountedRef.current = false;
          },
        }
      );
    }
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      style={{ display: "none" }}
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