export interface NavItem {
  name: string;
  href: string;
  /** Highlight when pathname equals href or starts with `href/` (e.g. /blogs/slug). */
  matchPrefix?: boolean;
}

export const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Services", href: "/services" },
  { name: "Blog", href: "/blogs", matchPrefix: true },
];
