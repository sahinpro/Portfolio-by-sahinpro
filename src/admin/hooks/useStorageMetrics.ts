import {
  fetchStorageMetrics,
  STORAGE_METRIC_BUCKETS,
  type StorageMetrics,
} from "@/admin/lib/storageMetrics";
import { env } from "@/lib/env";
import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 15_000;

const emptyMetrics: StorageMetrics = {
  fileCount: 0,
  totalBytes: 0,
  bucketCount: 0,
  quotaBytes: env.supabaseStorageQuotaBytes,
  remainingBytes: env.supabaseStorageQuotaBytes,
  usagePercent: 0,
};

export function useStorageMetrics(): {
  metrics: StorageMetrics;
  loading: boolean;
  refreshing: boolean;
  live: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [metrics, setMetrics] = useState<StorageMetrics>(emptyMetrics);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  const load = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? initialLoadDone.current;

    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      setMetrics(await fetchStorageMetrics());
    } catch (e) {
      if (!silent) {
        setMetrics(emptyMetrics);
      }
      setError(e instanceof Error ? e.message : "Failed to load storage metrics");
    } finally {
      initialLoadDone.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const scheduleReload = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void load({ silent: true });
    }, 350);
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const channel = supabase.channel("admin-storage-metrics");

    for (const bucket of STORAGE_METRIC_BUCKETS) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "storage",
          table: "objects",
          filter: `bucket_id=eq.${bucket}`,
        },
        scheduleReload,
      );
    }

    channel.subscribe((status) => {
      setLive(status === "SUBSCRIBED");
    });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setLive(false);
      void supabase.removeChannel(channel);
    };
  }, [scheduleReload]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") {
        void load({ silent: true });
      }
    };

    const intervalId = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [load]);

  return {
    metrics,
    loading,
    refreshing,
    live,
    error,
    refresh: () => {
      void load({ silent: false });
    },
  };
}
