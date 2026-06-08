"use client";

import { navItems } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = (usePathname() ?? "/").replace(/\/$/, "") || "/";

  return (
    <Fragment>
      {navItems.map((item) => {
        const isActive = navItemActive(pathname, item.href, item.matchPrefix);
        return (
          <div key={item.name}>
            <Link
              href={item.href}
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
