/**
 * Test harness for the Workspace Hono API tests (outreach admin + cron).
 *
 * Same two seams as the Website/Admin harnesses: lazy `process.env` control
 * + a `globalThis.fetch` router that hard-fails on any unplanned request,
 * so nothing can reach production Supabase / Resend from these tests.
 *
 * ORDERING NOTE (matters for the cron run tests):
 * `src/server/lib/supabaseService.ts` caches its service-role client on the
 * FIRST call — null forever if the env was missing at that moment. Specs must
 * therefore keep the env consistent across every test that triggers a service
 * call: always `SERVICE_ENV` (below), so whoever creates the client first
 * creates it with the same test URL/key the fetch stub intercepts.
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

/**
 * Env the service-role client is created with. Because the client caches on
 * first use, EVERY cron-run test must set this exact pair (the stub intercepts
 * its fetches — `cron-test.supabase.co` is never actually contacted).
 */
export const SERVICE_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: "https://cron-test.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
};

export const CRON_ENV = {
  ...SERVICE_ENV,
  CRON_SECRET: "test-cron-secret",
  RESEND_API_KEY: "test-resend-key",
  CONTACT_NOTIFICATION_TO_EMAIL: "leads@sahinpro.me",
  CONTACT_NOTIFICATION_FROM_EMAIL: "Sahin Alam <leads@sahinpro.me>",
  // Deterministic single-zone run: one override zone only, no planner reads
  // influencing the target list.
  OUTREACH_NOTIFICATION_ZONES: '[{"marketId":"us","tz":"America/New_York"}]',
};

export const CRON_HEADERS = { Authorization: "Bearer test-cron-secret" };

export const isSupabaseRest = (url: string) => url.includes("/rest/v1/");
export const isClaims = (url: string) =>
  url.includes("/rest/v1/outreach_window_claims");
export const isNotifLog = (url: string) =>
  url.includes("/rest/v1/outreach_window_notifications");
export const isSiteSettings = (url: string) =>
  url.includes("/rest/v1/site_settings");
export const isResend = (url: string) =>
  url.startsWith("https://api.resend.com");

/**
 * Base stub set for a cron run: site_settings answers the schedule config
 * (freshly computed to include the current minute) and empty planner zones;
 * claims insert "succeeds"; the delivery log accepts the upsert. Resend is
 * NOT included — each test answers it with success or failure.
 */
export function cronRunRoutes(options: {
  scheduleValue: string;
  claimsResult?: unknown;
}): StubRoute[] {
  return [
    {
      match: (url) =>
        isSiteSettings(url) && url.includes("key=eq.outreach_schedule_config"),
      json: [{ value: options.scheduleValue }],
    },
    {
      match: (url) =>
        isSiteSettings(url) && url.includes("key=eq.outreach_planner_zones"),
      json: [],
    },
    {
      match: (url, init) => isClaims(url) && init.method === "POST",
      status: 201,
      json: options.claimsResult ?? [{ iana_timezone: "America/New_York" }],
    },
    {
      match: (url, init) => isClaims(url) && init.method === "DELETE",
      json: [],
    },
    { match: isNotifLog, status: 201, json: {} },
  ];
}

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
