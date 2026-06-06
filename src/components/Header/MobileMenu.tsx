import { CTAButton } from "@/components/CTAButton";
import { Navigation } from "./Navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  return (
    <div
      aria-hidden={!isOpen}
      className={`overflow-hidden bg-black/50 backdrop-blur-sm rounded-xl border-t border-[#ffffff1a] lg:hidden mb-2 transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-[480px] opacity-100 mt-2" : "hidden"
      }`}
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
