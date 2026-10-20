import { EventItem } from "@/types/event";
import { BrokerItem } from "@/types/broker";
import { SiteSettings } from "@/types/settings";
import { EconomicNewsEvent } from "@/types/news";

export const DB_NAME = "semakin_pede_database_v1";
export const DB_VERSION = 1;

export interface DBLead {
  id: string;
  name: string;
  contactType: "wa" | "telegram" | "email";
  contact: string;
  level: string;
  source: string;
  timestamp: string;
  notes?: string;
  // Detail Registrasi Event & Akun Trading
  eventId?: string;
  eventTitle?: string;
  hasAccount?: "sudah" | "belum";
  demoAccountNumber?: string;
  demoInvestorPassword?: string;
  screenshotRealAccount?: string;
  screenshotTransfer?: string;
}

export interface DBAuditLog {
  id: string;
  timestamp: string;
  action: string;
  details?: string;
  operator?: string;
}

export interface DatabaseStats {
  leadsCount: number;
  eventsCount: number;
  brokersCount: number;
  settingsCount: number;
  newsCount: number;
  auditLogsCount: number;
  lastUpdated: string;
  storageEngine: string;
}

export interface DatabaseSnapshot {
  version: number;
  exportedAt: string;
  system: string;
  tables: {
    leads: DBLead[];
    events: EventItem[];
    brokers: BrokerItem[];
    site_settings: SiteSettings | null;
    forex_factory_news: EconomicNewsEvent[];
    audit_logs: DBAuditLog[];
  };
}

let dbInstance: IDBDatabase | null = null;

/**
 * Membuka koneksi ke IndexedDB dengan skema tabel lengkap
 */
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB tidak didukung pada lingkungan ini."));
      return;
    }

    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Tabel Leads
      if (!db.objectStoreNames.contains("leads")) {
        const leadStore = db.createObjectStore("leads", { keyPath: "id" });
        leadStore.createIndex("timestamp", "timestamp", { unique: false });
        leadStore.createIndex("contactType", "contactType", { unique: false });
        leadStore.createIndex("source", "source", { unique: false });
      }

      // 2. Tabel Events
      if (!db.objectStoreNames.contains("events")) {
        const eventStore = db.createObjectStore("events", { keyPath: "id" });
        eventStore.createIndex("category", "category", { unique: false });
        eventStore.createIndex("status", "status", { unique: false });
      }

      // 3. Tabel Brokers
      if (!db.objectStoreNames.contains("brokers")) {
        db.createObjectStore("brokers", { keyPath: "id" });
      }

      // 4. Tabel Site Settings
      if (!db.objectStoreNames.contains("site_settings")) {
        db.createObjectStore("site_settings", { keyPath: "id" });
      }

      // 5. Tabel Forex Factory News
      if (!db.objectStoreNames.contains("forex_factory_news")) {
        const newsStore = db.createObjectStore("forex_factory_news", { keyPath: "id" });
        newsStore.createIndex("impact", "impact", { unique: false });
        newsStore.createIndex("country", "country", { unique: false });
      }

      // 6. Tabel Audit Logs
      if (!db.objectStoreNames.contains("audit_logs")) {
        const logStore = db.createObjectStore("audit_logs", { keyPath: "id" });
        logStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error || new Error("Gagal membuka IndexedDB"));
    };
  });
}

/**
 * Operasi umum untuk menjalankan transaksi Promise-based
 */
async function performTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    let result: T;
    const request = callback(store);

    if (request) {
      request.onsuccess = () => {
        result = request.result;
      };
      request.onerror = () => {
        reject(request.error);
      };
    }

    transaction.oncomplete = () => {
      resolve(result);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

// ----------------- OPERASI LEADS -----------------

export function deduplicateDBLeads(leads: DBLead[]): DBLead[] {
  const map = new Map<string, DBLead>();
  for (const lead of leads) {
    let key: string;
    const digits = (lead.contact || "").replace(/[^0-9]/g, "");
    const suffix = digits.length >= 8 ? digits.slice(-9) : (lead.contact || "");

    if (lead.demoAccountNumber && lead.demoAccountNumber.trim().length >= 4) {
      key = `demo:${lead.demoAccountNumber.trim()}`;
    } else if (lead.eventId && suffix) {
      key = `event:${lead.eventId}:${suffix}`;
    } else if (lead.eventTitle && suffix) {
      key = `event_title:${lead.eventTitle}:${suffix}`;
    } else if (suffix && lead.name && lead.name !== "-") {
      key = `lead:${suffix}:${lead.name.toLowerCase().trim()}`;
    } else {
      key = `id:${lead.id}`;
    }

    if (!map.has(key)) {
      map.set(key, lead);
    } else {
      const existing = map.get(key)!;
      const preferLead =
        (!existing.demoAccountNumber && Boolean(lead.demoAccountNumber)) ||
        (!existing.screenshotRealAccount && Boolean(lead.screenshotRealAccount));

      if (preferLead) {
        map.set(key, { ...existing, ...lead });
      } else {
        map.set(key, { ...lead, ...existing });
      }
    }
  }
  return Array.from(map.values());
}

export async function insertLeadDB(lead: DBLead): Promise<void> {
  try {
    await performTransaction("leads", "readwrite", (store) => {
      store.put(lead);
    });
    await addAuditLogDB("INSERT_LEAD", `Lead: ${lead.name} (${lead.contactType})`);
  } catch (err) {
    console.warn("Gagal menyimpan lead ke IndexedDB:", err);
  }

  // Sinkronisasi otomatis ke backend Laravel
  try {
    if (typeof window !== "undefined") {
      if ((window as any).axios) {
        await (window as any).axios.post("/api/leads", lead);
      } else {
        await fetch("/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(lead),
        });
      }
    }
  } catch (err) {
    console.warn("Gagal sinkronisasi lead ke server Laravel:", err);
  }
}

export async function getAllLeadsDB(): Promise<DBLead[]> {
  try {
    const raw = await performTransaction<DBLead[]>("leads", "readonly", (store) => {
      return store.getAll();
    });
    return Array.isArray(raw) ? deduplicateDBLeads(raw) : [];
  } catch (err) {
    console.warn("Gagal membaca leads dari IndexedDB:", err);
    return [];
  }
}

export async function deleteLeadDB(id: string): Promise<void> {
  try {
    await performTransaction("leads", "readwrite", (store) => {
      store.delete(id);
      const altId = id.startsWith("lead-") ? id.slice(5) : `lead-${id}`;
      store.delete(altId);
    });
    await addAuditLogDB("DELETE_LEAD", `Menghapus lead id: ${id}`);
  } catch (err) {
    console.warn("Gagal menghapus lead dari IndexedDB:", err);
  }
}

export async function clearAllLeadsDB(): Promise<void> {
  try {
    await performTransaction("leads", "readwrite", (store) => {
      store.clear();
    });
    await addAuditLogDB("CLEAR_LEADS", "Mengosongkan seluruh data leads");
  } catch (err) {
    console.warn("Gagal mengosongkan leads dari IndexedDB:", err);
  }
}

// ----------------- OPERASI EVENTS -----------------

export async function saveEventDB(event: EventItem): Promise<void> {
  try {
    await performTransaction("events", "readwrite", (store) => {
      store.put(event);
    });
    await addAuditLogDB("SAVE_EVENT", `Menyimpan event: ${event.title}`);
  } catch (err) {
    console.warn("Gagal menyimpan event ke IndexedDB:", err);
  }
}

export async function saveBatchEventsDB(events: EventItem[]): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("events", "readwrite");
      const store = tx.objectStore("events");
      events.forEach((ev) => store.put(ev));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("Gagal menyimpan batch events ke IndexedDB:", err);
  }
}

export async function getAllEventsDB(): Promise<EventItem[]> {
  try {
    return await performTransaction<EventItem[]>("events", "readonly", (store) => {
      return store.getAll();
    });
  } catch (err) {
    console.warn("Gagal membaca events dari IndexedDB:", err);
    return [];
  }
}

export async function deleteEventDB(id: string): Promise<void> {
  try {
    await performTransaction("events", "readwrite", (store) => {
      store.delete(id);
    });
    await addAuditLogDB("DELETE_EVENT", `Menghapus event id: ${id}`);
  } catch (err) {
    console.warn("Gagal menghapus event dari IndexedDB:", err);
  }
}

// ----------------- OPERASI BROKERS -----------------

export async function saveBrokerDB(broker: BrokerItem): Promise<void> {
  try {
    await performTransaction("brokers", "readwrite", (store) => {
      store.put(broker);
    });
    await addAuditLogDB("SAVE_BROKER", `Menyimpan pialang mitra: ${broker.name}`);
  } catch (err) {
    console.warn("Gagal menyimpan pialang ke IndexedDB:", err);
  }
}

export async function saveBatchBrokersDB(brokers: BrokerItem[]): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("brokers", "readwrite");
      const store = tx.objectStore("brokers");
      brokers.forEach((b) => store.put(b));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("Gagal menyimpan batch brokers ke IndexedDB:", err);
  }
}

export async function getAllBrokersDB(): Promise<BrokerItem[]> {
  try {
    return await performTransaction<BrokerItem[]>("brokers", "readonly", (store) => {
      return store.getAll();
    });
  } catch (err) {
    console.warn("Gagal membaca pialang dari IndexedDB:", err);
    return [];
  }
}

export async function deleteBrokerDB(id: string): Promise<void> {
  try {
    await performTransaction("brokers", "readwrite", (store) => {
      store.delete(id);
    });
    await addAuditLogDB("DELETE_BROKER", `Menghapus pialang mitra id: ${id}`);
  } catch (err) {
    console.warn("Gagal menghapus pialang dari IndexedDB:", err);
  }
}

// ----------------- OPERASI SITE SETTINGS -----------------

export async function saveSettingsDB(settings: SiteSettings): Promise<void> {
  try {
    await performTransaction("site_settings", "readwrite", (store) => {
      store.put({ id: "current_settings", ...settings });
    });
    await addAuditLogDB("UPDATE_SETTINGS", "Memperbarui konfigurasi situs");
  } catch (err) {
    console.warn("Gagal menyimpan site settings ke IndexedDB:", err);
  }
}

export async function getSettingsDB(): Promise<SiteSettings | null> {
  try {
    const raw = await performTransaction<{ id: string } & SiteSettings>(
      "site_settings",
      "readonly",
      (store) => store.get("current_settings")
    );
    if (!raw) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...settings } = raw;
    return settings as SiteSettings;
  } catch {
    return null;
  }
}

// ----------------- OPERASI AUDIT LOGS -----------------

export async function addAuditLogDB(action: string, details?: string): Promise<void> {
  try {
    const log: DBAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      operator: "Superadmin",
    };
    await performTransaction("audit_logs", "readwrite", (store) => {
      store.put(log);
    });
  } catch {
    // Non-blocking
  }
}

export async function getAuditLogsDB(): Promise<DBAuditLog[]> {
  try {
    const logs = await performTransaction<DBAuditLog[]>("audit_logs", "readonly", (store) => {
      return store.getAll();
    });
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch {
    return [];
  }
}

// ----------------- SYNC & CADANGAN DATABASE -----------------

/**
 * Sinkronisasi dua arah otomatis antara LocalStorage dan IndexedDB
 */
export async function syncStorageWithIndexedDB(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // 1. Sync Leads
    const rawLeads = localStorage.getItem("kfi_leads");
    if (rawLeads) {
      const parsedLeads = JSON.parse(rawLeads);
      if (Array.isArray(parsedLeads)) {
        for (const item of parsedLeads) {
          const leadId = item.id || `lead-${new Date(item.timestamp || Date.now()).getTime()}-${Math.random().toString(36).substring(2, 6)}`;
          await insertLeadDB({ ...item, id: leadId });
        }
      }
    }

    // 2. Sync Events
    const rawEvents = localStorage.getItem("kfi_events_v2");
    if (rawEvents) {
      const parsedEvents = JSON.parse(rawEvents);
      if (Array.isArray(parsedEvents)) {
        await saveBatchEventsDB(parsedEvents);
      }
    }

    // 3. Sync Brokers
    const rawBrokers = localStorage.getItem("kfi_brokers_v1");
    if (rawBrokers) {
      const parsedBrokers = JSON.parse(rawBrokers);
      if (Array.isArray(parsedBrokers)) {
        await saveBatchBrokersDB(parsedBrokers);
      }
    }

    // 4. Sync Settings
    const rawSettings = localStorage.getItem("kfi_site_settings");
    if (rawSettings) {
      const parsedSettings = JSON.parse(rawSettings);
      await saveSettingsDB(parsedSettings);
    }
  } catch (err) {
    console.warn("Sinkronisasi otomatis localStorage ke IndexedDB selesai dengan penyesuaian:", err);
  }
}

/**
 * Statistik Lengkap Database untuk Superadmin Panel
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  try {
    const [leads, events, brokers, settings, logs] = await Promise.all([
      getAllLeadsDB(),
      getAllEventsDB(),
      getAllBrokersDB(),
      getSettingsDB(),
      getAuditLogsDB(),
    ]);

    return {
      leadsCount: leads.length,
      eventsCount: events.length,
      brokersCount: brokers.length,
      settingsCount: settings ? 1 : 0,
      newsCount: 0,
      auditLogsCount: logs.length,
      lastUpdated: new Date().toISOString(),
      storageEngine: "IndexedDB v1 (Persistent Web Storage)",
    };
  } catch {
    return {
      leadsCount: 0,
      eventsCount: 0,
      brokersCount: 0,
      settingsCount: 0,
      newsCount: 0,
      auditLogsCount: 0,
      lastUpdated: new Date().toISOString(),
      storageEngine: "LocalStorage Fallback",
    };
  }
}

/**
 * Ekspor Penuh Seluruh Database ke JSON Snapshot
 */
export async function exportFullDatabase(): Promise<DatabaseSnapshot> {
  const [leads, events, brokers, settings, logs] = await Promise.all([
    getAllLeadsDB(),
    getAllEventsDB(),
    getAllBrokersDB(),
    getSettingsDB(),
    getAuditLogsDB(),
  ]);

  return {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    system: "Semakin Pede Futures Trading Community Database",
    tables: {
      leads,
      events,
      brokers,
      site_settings: settings,
      forex_factory_news: [],
      audit_logs: logs,
    },
  };
}

/**
 * Impor & Restore Snapshot Database dari File JSON
 */
export async function importFullDatabase(snapshot: DatabaseSnapshot): Promise<boolean> {
  if (!snapshot || !snapshot.tables) return false;

  try {
    if (Array.isArray(snapshot.tables.events)) {
      await saveBatchEventsDB(snapshot.tables.events);
      localStorage.setItem("kfi_events_v2", JSON.stringify(snapshot.tables.events));
    }

    if (Array.isArray(snapshot.tables.brokers)) {
      await saveBatchBrokersDB(snapshot.tables.brokers);
      localStorage.setItem("kfi_brokers_v1", JSON.stringify(snapshot.tables.brokers));
    }

    if (snapshot.tables.site_settings) {
      await saveSettingsDB(snapshot.tables.site_settings);
      localStorage.setItem("kfi_site_settings", JSON.stringify(snapshot.tables.site_settings));
    }

    if (Array.isArray(snapshot.tables.leads)) {
      for (const lead of snapshot.tables.leads) {
        await insertLeadDB(lead);
      }
      localStorage.setItem("kfi_leads", JSON.stringify(snapshot.tables.leads));
    }

    await addAuditLogDB("RESTORE_DATABASE", `Restore snapshot database dari tanggal: ${snapshot.exportedAt}`);
    return true;
  } catch (err) {
    console.error("Gagal melakukan impor snapshot database:", err);
    return false;
  }
}
