import {
  getPublicApiEpoch,
  PUBLIC_CACHE_FLUSH_EVENT,
  PUBLIC_CACHE_VERSION_KEY,
} from "@/lib/publicDataCache";
import { useEffect, useState } from "react";

/** Re-run public data hooks when admin flushes cache (same tab or another tab). */
export function usePublicCacheVersion(): number {
  const [version, setVersion] = useState(() => getPublicApiEpoch());

  useEffect(() => {
    const refresh = () => setVersion(getPublicApiEpoch());

    const onStorage = (event: StorageEvent) => {
      if (event.key === PUBLIC_CACHE_VERSION_KEY) refresh();
    };

    window.addEventListener(PUBLIC_CACHE_FLUSH_EVENT, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(PUBLIC_CACHE_FLUSH_EVENT, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return version;
}
