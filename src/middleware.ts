import { canonicalPath } from "@/constants/site";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/", "/about", "/projects", "/services", "/contact"]);

export function middleware(request: NextRequest) {
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
  matcher: ["/", "/about", "/projects", "/services", "/contact"],
};
