import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

/**
 * Animated menu toggle button for mobile navigation
 */
export const MenuButton = ({ isOpen, onClick }: MenuButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-[#1c1c1c] border border-[#ffffff1a] hover:border-white/40 transition-colors"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className="h-5 w-5 text-white" />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Menu className="h-5 w-5 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};
