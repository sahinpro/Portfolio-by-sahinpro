import {
  fetchActiveResume,
  fetchPublishedProjects,
  fetchSiteSettingsMap,
  fetchTestimonials,
} from "@/data/publicSupabase.server";
import { PUBLIC_API_CACHE_CONTROL } from "@/lib/publicApiCacheHeaders";
import { Hono } from "hono";
import type { ApiEnv } from "../types";

/**
 * Public read APIs (website-owned). Same paths, same JSON payloads, same
 * `Cache-Control`: these responses are Redis-cached server-side, so they must
 * never be CDN-cached — a flush has to take effect immediately.
 */
const cacheHeaders = { "Cache-Control": PUBLIC_API_CACHE_CONTROL };

export const publicContentRoutes = new Hono<ApiEnv>()
  .get("/public/projects", async (c) => {
    const data = await fetchPublishedProjects();
    return c.json(data, { headers: cacheHeaders });
  })

  .get("/public/testimonials", async (c) => {
    try {
      const data = await fetchTestimonials();
      return c.json(data, { headers: cacheHeaders });
    } catch {
      return c.json([], { headers: cacheHeaders });
    }
  })

  .get("/public/settings", async (c) => {
    const data = await fetchSiteSettingsMap();
    return c.json(data, { headers: cacheHeaders });
  })

  .get("/public/resume", async (c) => {
    const data = await fetchActiveResume();
    return c.json(data, { headers: cacheHeaders });
  })

  .get("/public/resume/file", async (c) => {
    const resume = await fetchActiveResume();
    if (!resume?.file_url) {
      return c.json({ error: "Resume is not available" }, 404);
    }

    const upstream = await fetch(resume.file_url, { cache: "no-store" });
    if (!upstream.ok || !upstream.body) {
      return c.json({ error: "Resume file is missing from storage" }, 404);
    }

    const fileName = resume.file_name?.trim() || "Sahin_Alam_Resume.pdf";
    const contentType =
      upstream.headers.get("content-type") || "application/pdf";

    return c.body(upstream.body, 200, {
      "Content-Type": contentType,
      "Content-Disposition": attachmentDisposition(fileName),
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    });
  });

/** ASCII fallback + RFC 5987 name, exactly as the previous route handler sent them. */
function attachmentDisposition(fileName: string): string {
  const fallback = fileName.replace(/[^\x20-\x7E]+/g, "_").replace(/"/g, "");
  const encoded = encodeURIComponent(fileName);
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}
