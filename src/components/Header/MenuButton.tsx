import { animate } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const MenuButton = ({ isOpen, onClick }: MenuButtonProps) => {
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!iconRef.current) return;

    if (isOpen) {
      animate(
        iconRef.current,
        { rotate: [-90, 0], opacity: [0, 1] },
        { duration: 0.2, ease: "easeOut" }
      );
    } else {
      animate(
        iconRef.current,
        { rotate: [90, 0], opacity: [0, 1] },
        { duration: 0.2, ease: "easeOut" }
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