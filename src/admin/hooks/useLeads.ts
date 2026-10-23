"use client";

import {
  bulkPutLeads,
  clearAllLeads,
  deleteLead,
  getAllLeads,
  putLead,
} from "@/admin/lib/leads/leadDb";
import type { Lead } from "@/admin/types/lead";
import { useCallback, useEffect, useState } from "react";

/**
 * React state wrapper over the browser-local (IndexedDB) lead store.
 * Every mutation writes to IndexedDB then reloads from it, so the DB is the
 * single source of truth and records survive refresh / reopen.
 */
export function useLeads(): {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  saveLead: (lead: Lead) => Promise<void>;
  removeLead: (id: string) => Promise<void>;
  replaceAllLeads: (leads: Lead[]) => Promise<void>;
  mergeLeads: (leads: Lead[]) => Promise<void>;
} {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setLeads(await getAllLeads());
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load your local leads.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveLead = useCallback(
    async (lead: Lead) => {
      await putLead(lead);
      await reload();
    },
    [reload],
  );

  const removeLead = useCallback(
    async (id: string) => {
      await deleteLead(id);
      await reload();
    },
    [reload],
  );

  const replaceAllLeads = useCallback(
    async (next: Lead[]) => {
      await clearAllLeads();
      await bulkPutLeads(next);
      await reload();
    },
    [reload],
  );

  const mergeLeads = useCallback(
    async (incoming: Lead[]) => {
      await bulkPutLeads(incoming);
      await reload();
    },
    [reload],
  );

  return {
    leads,
    loading,
    error,
    reload,
    saveLead,
    removeLead,
    replaceAllLeads,
    mergeLeads,
  };
}
