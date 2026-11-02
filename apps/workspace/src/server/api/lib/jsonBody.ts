/**
 * Read a JSON body without throwing.
 *
 * Matches the pre-Hono pattern used by the outreach route handlers, where a
 * malformed/absent body was tolerated (notifications test) or answered a plain
 * `400 { error: "Invalid JSON" }` (schedule / planner zones). Callers pick which.
 */
export async function readJsonBody(c: {
  req: { json: () => Promise<unknown> };
}): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return undefined;
  }
}
