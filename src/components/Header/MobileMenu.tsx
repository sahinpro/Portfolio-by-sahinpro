import { AnimatePresence, motion } from "framer-motion";
import { CTAButton } from "../CTAButton";
import { Navigation } from "./Navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile menu component with slide animation
 */
export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};
