import { navItems } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavigationProps {
  className?: string;
  onItemClick?: () => void;
}

function navItemActive(pathname: string, href: string, matchPrefix?: boolean): boolean {
  if (href === "/") return pathname === "/" || pathname === "";
  if (matchPrefix) return pathname === href || pathname.startsWith(`${href}/`);
  return pathname === href;
}

export const Navigation = ({ className, onItemClick }: NavigationProps) => {
  const location = useLocation();
  const pathname = location.pathname.replace(/\/$/, "") || "/";

  return (
    <Fragment>
      {navItems.map((item) => {
        const isActive = navItemActive(pathname, item.href, item.matchPrefix);
        return (
          <div key={item.name}>
            <Link
              to={item.href}
              onClick={onItemClick}
              className={cn(
                "text-lg transition-all duration-300 relative group",
                isActive
                  ? "text-text-menu-active"
                  : "text-text-normal hover:text-text-menu-hover",
                className,
              )}
            >
              {item.name}
            </Link>
          </div>
        );
      })}
    </Fragment>
  );
};
