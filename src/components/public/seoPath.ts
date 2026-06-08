const KNOWN_PAGES = ["/", "/about", "/projects", "/services", "/contact"] as const;

export function normalizeSeoPagePath(pathname: string): string {
  const p = pathname.replace(/\/$/, "") || "/";
  if ((KNOWN_PAGES as readonly string[]).includes(p)) return p;
  if (p.startsWith("/projects")) return "/projects";
  return "/";
}
