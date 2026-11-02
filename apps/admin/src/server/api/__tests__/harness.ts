/**
 * Test harness for the Admin Hono API tests.
 *
 * The Admin app's server layer builds its Supabase client *per call*
 * (`createClient(url, key)` inside `isAuthorizedBearerToken`), reading
 * `NEXT_PUBLIC_SUPABASE_URL`/key from env at request time — so, unlike the
 * Website app (which snapshots a module-level client), there is nothing to
 * work around beyond controlling env + stubbing `globalThis.fetch`.
 *
 * `adminFetchRoutes()` gives every spec a ready auth relay: `/auth/v1/user`
 * answers with the allowlisted admin so `requireAdminBearer` passes, and any
 * other call is captured for assertions (the website relay target, etc).
 */

export type FetchCall = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
};

export type StubRoute = {
  match: (
    url: string,
    init: { method: string; headers: Record<string, string> },
  ) => boolean;
  status?: number;
  json?: unknown;
  throwError?: boolean;
};

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
    const body =
      typeof init?.body === "string"
        ? init.body
        : init?.body
          ? String(init.body)
          : null;
    calls.push({ url, method, headers, body });

    const route = routes.find((r) => r.match(url, { method, headers }));
    if (!route)
      throw new Error(`fetchStub: unexpected request ${method} ${url}`);
    if (route.throwError) throw new Error("stub network failure");
    return new Response(JSON.stringify(route.json ?? {}), {
      status: route.status ?? 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  return Object.assign(calls, {
    restore: () => {
      globalThis.fetch = originalFetch;
    },
  });
}

const ADMIN_EMAIL = "admin@sahinpro.me";
const SUPABASE_URL = "https://admin-test.supabase.co";

/** Env that makes `requireAdminBearer` succeed for `ADMIN_EMAIL`. */
export const AUTHORIZED_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: "sb_publishable_test",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
  NEXT_PUBLIC_ADMIN_EMAIL: ADMIN_EMAIL,
};

/** Route that answers the bearer-token check with the allowlisted admin. */
export const authOkRoute: StubRoute = {
  match: (url) => url.startsWith(`${SUPABASE_URL}/auth/v1/user`),
  json: {
    id: "user-1",
    aud: "authenticated",
    role: "authenticated",
    email: ADMIN_EMAIL,
  },
};

export const isWebsiteRelay = (url: string) => /\/api\/revalidate$/.test(url);

export function withEnv<T>(
  vars: Record<string, string | undefined>,
  run: () => Promise<T>,
): Promise<T> {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(vars)) {
    previous.set(key, process.env[key]);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return run().finally(() => {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

export const TEST_ADMIN_EMAIL = ADMIN_EMAIL;
export const TEST_SUPABASE_URL = SUPABASE_URL;
