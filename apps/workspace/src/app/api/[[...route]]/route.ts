import { handle } from "@hono/vercel";

import { api } from "@/server/api/app";

/**
 * Single Next.js entrypoint for the Workspace Hono API (see `src/server/api`).
 *
 * Node.js runtime: bearer-token verification and the service-role Supabase
 * client both target Node. `force-dynamic` keeps every `/api/*` response out of
 * the build-time prerender — the same guarantee the old per-route handlers gave
 * by being dynamic route handlers.
 *
 * Every HTTP method is exported on purpose: the outreach schedule +
 * planner-zone endpoints take PUT, the notifications test takes POST and the
 * cron tick is a GET; exporting all verbs hands every request to the Hono
 * fallback, which answers the pre-split contract — 405 for a known endpoint
 * with an unregistered verb, 404 for an unknown endpoint — instead of a
 * blanket framework 405 masking 404s under this catch-all.
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
