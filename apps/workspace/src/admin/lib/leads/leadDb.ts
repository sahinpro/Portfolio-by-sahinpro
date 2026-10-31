import type { Lead } from "@/admin/types/lead";

/**
 * Native IndexedDB wrapper for the browser-local Lead CRM.
 *
 * This store is offline-only: nothing here touches the network or a server, and
 * its contents disappear if the browser clears site data.
 *
 * Leads are now authored in Supabase (see `leadRepository.ts`). This store keeps
 * two jobs, and neither is ever cleared automatically:
 *   1. the safety copy + source for the one-time local → cloud upload
 *      (see `leadCloudMigration.ts`), and
 *   2. local UI preferences in `lead_prefs`.
 *
 * Version 2 added the `lead_prefs` store (Outreach Time Planner choices).
 * The upgrade is purely additive — the `leads` store and every record in it
 * are left untouched.
 */

const DB_NAME = "lead-crm-db";
const DB_VERSION = 2;
const STORE = "leads";
const PREFS_STORE = "lead_prefs";

/** UI preferences for the Outreach Time Planner, stored locally. */
export type PlannerPreferences = {
  id: "planner";
  /** Market id → IANA time zone the user picked for it. */
  outreachZones: Record<string, string>;
  /** "all" or a market id. */
  marketFilter: string;
  expanded: boolean;
  updatedAt: string;
};

const EMPTY_PLANNER_PREFS: PlannerPreferences = {
  id: "planner",
  outreachZones: {},
  marketFilter: "all",
  expanded: true,
  updatedAt: "",
};

export function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("businessName", "businessName", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("normalizedKey", "normalizedKey", { unique: false });
      }
      // Additive only: existing stores and their records are never modified.
      if (!db.objectStoreNames.contains(PREFS_STORE)) {
        db.createObjectStore(PREFS_STORE, { keyPath: "id" });
      }
    };

    request.onblocked = () =>
      reject(
        new Error(
          "Could not open the local database because it is open in another tab. Close that tab and try again.",
        ),
      );
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to open the local database."));
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
  storeName: string = STORE,
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = action(store);

        tx.oncomplete = () => {
          db.close();
          resolve(request.result);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error("Local database transaction failed."));
        };
        tx.onabort = () => {
          db.close();
          reject(tx.error ?? new Error("Local database transaction aborted."));
        };
      }),
  );
}

/** Read every lead, newest-updated first. */
export async function getAllLeads(): Promise<Lead[]> {
  const leads = await runTransaction<Lead[]>(
    "readonly",
    (store) => store.getAll() as IDBRequest<Lead[]>,
  );
  return leads.sort((a, b) =>
    (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
  );
}

export async function getLead(id: string): Promise<Lead | undefined> {
  return runTransaction<Lead | undefined>(
    "readonly",
    (store) => store.get(id) as IDBRequest<Lead | undefined>,
  );
}

/** Insert or update a lead (keyed by id). */
export async function putLead(lead: Lead): Promise<void> {
  await runTransaction("readwrite", (store) => store.put(lead));
}

/** Insert or update many leads in a single transaction. */
export async function bulkPutLeads(leads: Lead[]): Promise<void> {
  if (leads.length === 0) return;
  await runTransaction("readwrite", (store) => {
    let last: IDBRequest | undefined;
    for (const lead of leads) {
      last = store.put(lead);
    }
    return (last ?? store.getAll()) as IDBRequest<unknown>;
  });
}

export async function deleteLead(id: string): Promise<void> {
  await runTransaction("readwrite", (store) => store.delete(id));
}

/** Remove every stored lead. */
export async function clearAllLeads(): Promise<void> {
  await runTransaction("readwrite", (store) => store.clear());
}

/** Read the planner preferences, or a blank set when none are stored yet. */
export async function getPlannerPreferences(): Promise<PlannerPreferences> {
  const stored = await runTransaction<PlannerPreferences | undefined>(
    "readonly",
    (store) => store.get("planner") as IDBRequest<PlannerPreferences | undefined>,
    PREFS_STORE,
  );
  if (!stored) return { ...EMPTY_PLANNER_PREFS };
  return {
    ...EMPTY_PLANNER_PREFS,
    ...stored,
    outreachZones: stored.outreachZones ?? {},
  };
}

/** Merge a partial update into the stored planner preferences. */
export async function savePlannerPreferences(
  patch: Partial<Omit<PlannerPreferences, "id" | "updatedAt">>,
): Promise<PlannerPreferences> {
  const current = await getPlannerPreferences();
  const next: PlannerPreferences = {
    ...current,
    ...patch,
    id: "planner",
    outreachZones: patch.outreachZones ?? current.outreachZones,
    updatedAt: new Date().toISOString(),
  };
  await runTransaction(
    "readwrite",
    (store) => store.put(next),
    PREFS_STORE,
  );
  return next;
}

/**
 * Proof that the browser-only leads were uploaded to Supabase. Stored locally so
 * the Leads page can keep reminding you until every local record is in the cloud.
 * This never deletes the leads themselves.
 */
export type LeadMigrationRecord = {
  id: "lead_migration";
  uploadedAt: string;
  uploadedCount: number;
  verifiedCount: number;
  localCountAtUpload: number;
};

export async function getLeadMigrationRecord(): Promise<LeadMigrationRecord | null> {
  return runTransaction<LeadMigrationRecord | null>(
    "readonly",
    (store) =>
      store.get("lead_migration") as IDBRequest<LeadMigrationRecord | null>,
    PREFS_STORE,
  );
}

export async function saveLeadMigrationRecord(
  record: Omit<LeadMigrationRecord, "id">,
): Promise<LeadMigrationRecord> {
  const next: LeadMigrationRecord = { id: "lead_migration", ...record };
  await runTransaction(
    "readwrite",
    (store) => store.put(next),
    PREFS_STORE,
  );
  return next;
}
