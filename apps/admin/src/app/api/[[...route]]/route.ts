import { handle } from "@hono/vercel";

import { api } from "@/server/api/app";

/**
 * Single Next.js entrypoint for the Admin Hono API (see `src/server/api`).
 *
 * Node.js runtime: the bearer-token verification needs the Supabase JS client,
 * which targets Node. `force-dynamic` keeps every `/api/*` response out of the
 * build-time prerender — the same guarantee the old per-route handlers gave by
 * being dynamic route handlers.
 *
 * Every HTTP method is exported on purpose: exporting a verb here hands the
 * request to the Hono app, whose fallback answers the pre-split contract —
 * 405 for a known endpoint with an unregistered verb, 404 for an unknown
 * endpoint — instead of a blanket framework 405 masking 404s under this
 * catch-all.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = handle(api);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
