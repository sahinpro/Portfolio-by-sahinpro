/**
 * Test harness for the Website Hono API tests.
 *
 * Two seams cover every external service these routes touch, so no test can
 * reach a real production endpoint:
 *
 * 1. `globalThis.fetch` — installed by `installFetchStub()` on a per-test
 *    basis. The Supabase JS client snapshots its URL at module load and falls
 *    back to `https://invalid.supabase.co` when env is unset, so *every*
 *    Supabase request the app makes in tests is a fetch to that stubbed host.
 * 2. `process.env` — the API layer reads env lazily (per request), so tests
 *    configure it with `withEnv()` and restore the exact previous state after.
 *
 * Kept separate from the spec files (rather than inlined) because the contact,
 * pageview, revalidate and public-read suites all assert on what was sent to
 * the outside world.
 */

export type FetchCall = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
};

type StubRoute = {
  /** Matched against the request URL — and optionally its method/Accept. */
  match: (
    url: string,
    init?: { method: string; headers: Record<string, string> },
  ) => boolean;
  status?: number;
  json?: unknown;
  body?: string;
  headers?: Record<string, string>;
};

/**
 * Replace `globalThis.fetch` with a router over `routes` (first match wins;
 * anything unmatched throws, so an un-planned network call fails the test
 * loudly instead of hanging or hitting the internet). Returns the list of
 * every call made while the stub was installed, plus `restore()`.
 */
export type FetchStub = FetchCall[] & { restore: () => void };

export function installFetchStub(routes: StubRoute[]): FetchStub {
  const calls: FetchCall[] = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const headers: Record<string, string> = {};
    new Headers(init?.headers).forEach((value, name) => {
      headers[name.toLowerCase()] = value;
    });
    const method = String(init?.method ?? "GET").toUpperCase();
    const rawBody =
      typeof init?.body === "string"
        ? init.body
        : init?.body
          ? String(init.body)
          : null;
    calls.push({ url, method, headers, body: rawBody });

    const route = routes.find((r) => r.match(url, { method, headers }));
    if (!route) {
      throw new Error(`fetchStub: unexpected request ${method} ${url}`);
    }
    if (route.json !== undefined || route.headers !== undefined) {
      const payload = route.body ?? JSON.stringify(route.json ?? {});
      return new Response(payload, {
        status: route.status ?? 200,
        headers: {
          "Content-Type": "application/json",
          ...(route.headers ?? {}),
        },
      });
    }
    return new Response(route.body ?? "", { status: route.status ?? 200 });
  }) as typeof fetch;

  // Restore on the same tick the test finishes — callers pair this with
  // afterEach in the spec files.
  return Object.assign(calls, {
    restore: () => {
      globalThis.fetch = originalFetch;
    },
  });
}

export const isSupabaseRest = (url: string) => url.includes("/rest/v1/");
export const isSupabaseStorage = (url: string) => url.includes("/storage/v1/");
export const isSupabaseFunctions = (url: string) =>
  url.includes("/functions/v1/");
export const isResend = (url: string) =>
  url.startsWith("https://api.resend.com");
export const isTurnstile = (url: string) =>
  url.startsWith("https://challenges.cloudflare.com");

/**
 * Default "empty database" stub: REST collections answer `[]`, single-object
 * selects (maybeSingle) answer `null`, storage/asset reads 404 — enough for
 * every public read path to resolve without touching real services.
 */
export function defaultStubRoutes(extra: StubRoute[] = []): StubRoute[] {
  return [
    ...extra,
    {
      // maybeSingle()/single() requests ask for the pgrst single-object shape.
      match: (url, init) =>
        isSupabaseRest(url) &&
        (init?.headers?.["accept"] ?? "").includes("pgrst.object"),
      json: null,
    },
    { match: (url) => isSupabaseRest(url), json: [] },
    {
      match: (url) => isSupabaseStorage(url),
      status: 404,
      json: { error: "not found" },
    },
    {
      match: (url) => isSupabaseFunctions(url),
      status: 500,
      json: { error: "stub" },
    },
    {
      match: (url) => url.startsWith("https://invalid.supabase.co/"),
      status: 404,
    },
  ];
}

/**
 * Set/delete env keys for the duration of one test, then restore the exact
 * previous state (`undefined` means the variable was absent and must be
 * deleted again — bun test auto-loads the repo `.env`, so "absent" cannot be
 * assumed).
 */
export function withEnv(
  vars: Record<string, string | undefined>,
  run: () => Promise<void>,
): Promise<void>;
export function withEnv<T>(
  vars: Record<string, string | undefined>,
  run: () => Promise<T>,
): Promise<T>;
export async function withEnv<T>(
  vars: Record<string, string | undefined>,
  run: () => Promise<T>,
): Promise<T> {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(vars)) {
    previous.set(key, process.env[key]);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return await run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

/** Unique per-IP so the in-memory contact rate limiter never bleeds across tests. */
let ipCounter = 0;
export function nextTestIp(): string {
  ipCounter += 1;
  return `203.0.113.${ipCounter}`;
}
