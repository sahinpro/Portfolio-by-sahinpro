/**
 * Shared typing for the Workspace HTTP API layer (`src/server/api`).
 *
 * `Variables` are populated by the request-context middleware and are available
 * to every route and middleware through the typed Hono context.
 */
export type ApiEnv = {
  Variables: {
    requestId: string;
    startedAt: number;
  };
};
