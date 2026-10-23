import type { Lead } from "@/admin/types/lead";

/**
 * Native IndexedDB wrapper for the browser-local Lead CRM.
 *
 * All lead records live ONLY in this browser profile / origin. Nothing here
 * touches the network or a server. Data is lost if site data is cleared.
 */

const DB_NAME = "lead-crm-db";
const DB_VERSION = 1;
const STORE = "leads";

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
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const store = tx.objectStore(STORE);
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
