import { getCachedPublic } from "@/lib/publicDataCache";
import { useEffect, useRef, useState } from "react";

type State<T> = { data: T | null; error: Error | null; loading: boolean };

/**
 * Cached fetch for anonymous public data. Same `cacheKey` shares one request + TTL window.
 * `fetcher` may change; the latest closure is used. Encode all query params in `cacheKey`.
 */
export function usePublicData<T>(cacheKey: string, fetcher: () => Promise<T>): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
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
  }, [cacheKey]);

  return state;
}
