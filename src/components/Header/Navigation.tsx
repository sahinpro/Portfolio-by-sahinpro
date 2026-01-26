import { navItems } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavigationProps {
  className?: string;
  onItemClick?: () => void;
}

/**
 * Navigation component for header menu items
 */
export const Navigation = ({ className, onItemClick }: NavigationProps) => {
  const location = useLocation();

  return (
    <Fragment>
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <motion.div
            key={item.name}
            variants={{
              hidden: { opacity: 0, y: -10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
          >
            <Link
              to={item.href}
              onClick={onItemClick}
              className={cn(
                "text-lg transition-all duration-300 relative group",
                isActive
                  ? "text-text-menu-active"
                  : "text-text-normal hover:text-text-menu-hover",
                className
              )}
            >
              {item.name}
            </Link>
          </motion.div>
        );
      })}
    </Fragment>
  );
};
