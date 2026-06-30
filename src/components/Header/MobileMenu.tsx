import { CTAButton } from "@/components/common/CTAButton";
import { cn } from "@/lib/utils";
import { Navigation } from "./Navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  return (
    <nav
      id="mobile-primary-nav"
      aria-hidden={!isOpen}
      aria-label="Mobile"
      inert={!isOpen ? true : undefined}
      className={cn(
        "overflow-hidden rounded-xl bg-black/50 backdrop-blur-sm lg:hidden",
        "transition-[max-height,opacity,margin-top,border-color] duration-300 ease-in-out",
        isOpen
          ? "mb-2 mt-2 max-h-[480px] border-t border-[#ffffff1a] opacity-100"
          : "pointer-events-none mb-0 mt-0 max-h-0 border-t border-transparent opacity-0",
      )}
    >
      <div
        className={cn(
          "space-y-2 px-4 py-4 transition-all duration-300 ease-out",
          isOpen
            ? "translate-y-0 opacity-100 delay-75"
            : "-translate-y-2 opacity-0 delay-0",
        )}
      >
        <Navigation
          className="block rounded-md px-3 py-2 text-base font-medium transition-colors duration-300 hover:bg-white/5"
          onItemClick={onClose}
        />
        <div className="m-0 pt-4">
          <CTAButton
            href="/contact"
            className="w-full justify-center"
            onClick={onClose}
          >
            Get In Touch
          </CTAButton>
        </div>
      </div>
    </nav>
  );
};
