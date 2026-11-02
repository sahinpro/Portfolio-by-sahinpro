import { LEGACY_HOSTS, SITE_URL, canonicalPath } from "@/constants/site";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/", "/about", "/projects", "/services", "/contact"]);

const LEGACY_HOST_SET = new Set<string>(LEGACY_HOSTS);

function requestHost(request: NextRequest): string {
  const raw =
    request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  return raw.split(",")[0].trim().split(":")[0].toLowerCase();
}

export function middleware(request: NextRequest) {
  if (LEGACY_HOST_SET.has(requestHost(request))) {
    const dest = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      SITE_URL,
    );
    return NextResponse.redirect(dest, 301);
  }

  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/";
  if (!PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const canonical = `<${canonicalPath(pathname)}>; rel="canonical"`;
  const existing = response.headers.get("Link");
  response.headers.set("Link", existing ? `${existing}, ${canonical}` : canonical);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icons/|fonts/).*)"],
};
