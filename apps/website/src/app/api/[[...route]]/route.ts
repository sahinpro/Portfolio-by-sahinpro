import { handle } from "@hono/vercel";

import { api } from "@/server/api/app";

/**
 * Single Next.js entrypoint for the Website Hono API (see `src/server/api`).
 *
 * Node.js runtime: the Hono app and its dependencies (Supabase service client,
 * Upstash Redis, Resend) all target Node. `force-dynamic` keeps every `/api/*`
 * response out of the build-time prerender, exactly like the previous per-route
 * `runtime`/`dynamic` exports.
 *
 * Every HTTP method is exported on purpose: exporting a verb here hands the
 * request to the Hono app, whose fallback answers the pre-split contract —
 * 405 for a known endpoint with an unregistered verb, 404 for an unknown
 * endpoint. Any method the framework itself must not answer with a blanket
 * 405 (which would mask 404s for unknown paths under this catch-all).
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
