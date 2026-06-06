import { getCachedPublic } from "@/lib/publicDataCache";
import { deferUntilIdle } from "@/lib/deferUntilIdle";
import { useEffect, useRef, useState } from "react";

type State<T> = { data: T | null; error: Error | null; loading: boolean };

type UsePublicDataOptions = {
  /** Wait until idle before fetching (keeps Supabase off the critical path). */
  deferMs?: number;
  /** When false, skip fetching entirely. */
  enabled?: boolean;
};

/**
 * Cached fetch for anonymous public data. Same `cacheKey` shares one request + TTL window.
 * `fetcher` may change; the latest closure is used. Encode all query params in `cacheKey`.
 */
export function usePublicData<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options?: UsePublicDataOptions,
): State<T> {
  const enabled = options?.enabled !== false;
  const deferMs = options?.deferMs;
  const [ready, setReady] = useState(!deferMs);
  const [state, setState] = useState<State<T>>({
    data: null,
    error: null,
    loading: enabled && !deferMs,
  });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!deferMs) return;
    return deferUntilIdle(() => setReady(true), deferMs);
  }, [deferMs]);

  useEffect(() => {
    if (!enabled || !ready) {
      setState({ data: null, error: null, loading: false });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    getCachedPublic(cacheKey, () => fetcherRef.current())
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            error: err instanceof Error ? err : new Error(String(err)),
            loading: false,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [cacheKey, enabled, ready]);

  return state;
}
