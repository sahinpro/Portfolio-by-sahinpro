import { Menu, X } from "lucide-react";

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const MenuButton = ({ isOpen, onClick }: MenuButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-[#1c1c1c] border border-[#ffffff1a] hover:border-white/40 transition-colors"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      aria-controls="mobile-primary-nav"
    >
      <div className="relative w-5 h-5 transition-transform duration-200">
        {isOpen ? (
          <X className="h-5 w-5 text-white absolute inset-0" />
        ) : (
          <Menu className="h-5 w-5 text-white absolute inset-0" />
        )}
      </div>
    </button>
  );
};
