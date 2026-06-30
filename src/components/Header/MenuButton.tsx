import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const MenuButton = ({ isOpen, onClick }: MenuButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#ffffff1a] bg-[#1c1c1c] transition-colors hover:border-white/40 lg:hidden"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      aria-controls="mobile-primary-nav"
    >
      <div className="relative h-5 w-5">
        <Menu
          className={cn(
            "absolute inset-0 h-5 w-5 text-white transition-all duration-300 ease-out",
            isOpen
              ? "scale-75 rotate-90 opacity-0"
              : "scale-100 rotate-0 opacity-100",
          )}
          aria-hidden={isOpen}
        />
        <X
          className={cn(
            "absolute inset-0 h-5 w-5 text-white transition-all duration-300 ease-out",
            isOpen
              ? "scale-100 rotate-0 opacity-100"
              : "scale-75 -rotate-90 opacity-0",
          )}
          aria-hidden={!isOpen}
        />
      </div>
    </button>
  );
};
