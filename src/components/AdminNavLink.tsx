"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AdminNavLinkProps = {
  href: string;
  end?: boolean;
  className: string | ((args: { isActive: boolean }) => string);
  children: ReactNode;
  onClick?: () => void;
};

export function AdminNavLink({
  href,
  end = false,
  className,
  children,
  onClick,
}: AdminNavLinkProps): JSX.Element {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const normalizedHref = href.replace(/\/$/, "") || "/";
  const isActive = end
    ? normalizedPath === normalizedHref
    : normalizedPath === normalizedHref ||
      normalizedPath.startsWith(`${normalizedHref}/`);

  const resolvedClassName =
    typeof className === "function" ? className({ isActive }) : className;

  return (
    <Link href={href} className={cn(resolvedClassName)} onClick={onClick}>
      {children}
    </Link>
  );
}
