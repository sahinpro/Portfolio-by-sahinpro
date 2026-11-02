/**
 * Read a JSON body without throwing.
 *
 * Matches the pre-Hono pattern used by the cache endpoints, where an absent or
 * malformed body was tolerated and the handler continued with default values.
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
