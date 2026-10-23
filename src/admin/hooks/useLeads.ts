"use client";

import {
  LeadStoreError,
  checkLeadAccess,
  deleteAllLeads,
  deleteLead,
  listLeads,
  putLead,
  upsertLeads,
  type LeadAccessState,
} from "@/admin/lib/leads/leadRepository";
import type { Lead } from "@/admin/types/lead";
import { useCallback, useEffect, useState } from "react";

/**
 * React state wrapper over the Supabase `leads` table.
 *
 * Every mutation writes to Postgres then re-reads, so the database is the single
 * source of truth and records are visible from any device the admin signs in on.
 * The old browser-only store (`leadDb.ts`) is untouched — it still holds the
 * pre-migration copy and the planner preferences.
 *
 * `access` tells the UI why a read failed (missing migration, RLS, expired
 * session) so it can show a fix instead of an empty table.
 */
export function useLeads(): {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  access: LeadAccessState;
  reload: () => Promise<void>;
  saveLead: (lead: Lead) => Promise<void>;
  removeLead: (id: string) => Promise<void>;
  replaceAllLeads: (leads: Lead[]) => Promise<void>;
  mergeLeads: (leads: Lead[]) => Promise<void>;
} {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [access, setAccess] = useState<LeadAccessState>("ok");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listLeads();
      setLeads(rows);
      setError(null);
      // RLS hides rows rather than raising an error, so "empty" and "not
      // allowed to see anything" look identical. Only when the table came back
      // empty do we ask Postgres directly which of the two it is.
      setAccess(rows.length > 0 ? "ok" : await checkLeadAccess());
    } catch (e) {
      setError(
        e instanceof LeadStoreError
          ? e.message
          : (e instanceof Error
            ? e.message
            : "Could not load your leads."),
      );
      setAccess(e instanceof LeadStoreError ? e.state : "unknown");
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
      await deleteAllLeads();
      await upsertLeads(next);
      await reload();
    },
    [reload],
  );

  const mergeLeads = useCallback(
    async (incoming: Lead[]) => {
      await upsertLeads(incoming);
      await reload();
    },
    [reload],
  );

  return {
    leads,
    loading,
    error,
    access,
    reload,
    saveLead,
    removeLead,
    replaceAllLeads,
    mergeLeads,
  };
}
