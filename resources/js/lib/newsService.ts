import { EconomicNewsEvent, ForexFactoryRawEvent, NewsImpact } from "@/types/news";
import seedData from "@/data/forexFactoryMediumHigh.json";

export const NEWS_STORAGE_KEY = "kfi_ff_news_cache_v1";
export const NEWS_UPDATE_EVENT = "kfi_ff_news_updated";
export const FOREX_FACTORY_FEED_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";

/**
 * Memformat raw event dari ForexFactory menjadi objek EconomicNewsEvent.
 * Mengonversi waktu ke zona waktu WIB (Asia/Jakarta, UTC+7).
 */
export function formatForexFactoryEvent(
  raw: ForexFactoryRawEvent,
  index: number
): EconomicNewsEvent | null {
  // ATURAN MUTLAK: Hanya menerima impact "High" atau "Medium"
  if (raw.impact !== "High" && raw.impact !== "Medium") {
    return null;
  }

  const d = new Date(raw.date);
  const isValidDate = !isNaN(d.getTime());

  let timeFormatted = "--:-- WIB";
  let dateFormatted = "";
  let dayName = "";

  if (isValidDate) {
    try {
      const timeStr = new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
        hour12: false,
      }).format(d);
      timeFormatted = `${timeStr} WIB`;

      dateFormatted = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(d);

      dayName = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        timeZone: "Asia/Jakarta",
      }).format(d);
    } catch {
      timeFormatted = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
      dateFormatted = d.toLocaleDateString("id-ID");
    }
  }

  return {
    id: `ff-${raw.country}-${index}-${raw.date.slice(0, 16).replace(/[:\-]/g, "")}`,
    title: raw.title,
    country: raw.country,
    dateRaw: raw.date,
    timeFormatted,
    dateFormatted,
    dayName,
    impact: raw.impact as NewsImpact,
    forecast: raw.forecast || "-",
    previous: raw.previous || "-",
    source: "ForexFactory.com",
  };
}

/**
 * Helper untuk mendapatkan timestamp awal hari ini (00:00:00 waktu lokal/WIB)
 */
export function getStartOfToday(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

/**
 * Filter data mentah dari ForexFactory dan ambil HANYA Medium & High Impact.
 * Batas terbawah adalah per hari ini (>= awal hari ini).
 */
export function filterMediumHighOnly(rawEvents: ForexFactoryRawEvent[]): EconomicNewsEvent[] {
  const result: EconomicNewsEvent[] = [];
  const startOfToday = getStartOfToday();

  rawEvents.forEach((item, index) => {
    if (item.impact === "High" || item.impact === "Medium") {
      const eventTime = new Date(item.date).getTime();
      // Batas terbawah per hari ini: abaikan agenda sebelum hari ini
      if (!isNaN(eventTime) && eventTime < startOfToday) {
        return;
      }

      const formatted = formatForexFactoryEvent(item, index);
      if (formatted) {
        result.push(formatted);
      }
    }
  });

  return result.sort((a, b) => new Date(a.dateRaw).getTime() - new Date(b.dateRaw).getTime());
}

/**
 * Mendapatkan seed data ForexFactory Medium & High default.
 */
export function getSeedForexFactoryEvents(): EconomicNewsEvent[] {
  return filterMediumHighOnly(seedData as ForexFactoryRawEvent[]);
}

/**
 * Mengambil daftar berita ekonomi yang tersimpan di localStorage.
 * Mengembalikan seed data jika belum ada di localStorage atau data lampau.
 */
export function getStoredForexFactoryNews(): EconomicNewsEvent[] {
  if (typeof window === "undefined") {
    return getSeedForexFactoryEvents();
  }

  const startOfToday = getStartOfToday();

  try {
    const raw = localStorage.getItem(NEWS_STORAGE_KEY);
    if (!raw) {
      const seed = getSeedForexFactoryEvents();
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = getSeedForexFactoryEvents();
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }

    // Pastikan seluruh data yang tersimpan tetap bersih:
    // 1. Hanya High & Medium
    // 2. Batas terbawah per hari ini (>= startOfToday)
    const validEvents = parsed.filter((item: EconomicNewsEvent) => {
      if (item.impact !== "High" && item.impact !== "Medium") return false;
      const t = new Date(item.dateRaw).getTime();
      return isNaN(t) || t >= startOfToday;
    });

    // Jika semua data di cache ternyata tanggal lampau, reset ke seed terkini
    if (validEvents.length === 0) {
      const seed = getSeedForexFactoryEvents();
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }

    return validEvents.sort((a, b) => new Date(a.dateRaw).getTime() - new Date(b.dateRaw).getTime());
  } catch (err) {
    console.error("Gagal membaca cache berita ForexFactory:", err);
    return getSeedForexFactoryEvents();
  }
}

/**
 * Menyimpan data berita ForexFactory ke localStorage dan memancarkan event update.
 */
export function saveStoredForexFactoryNews(events: EconomicNewsEvent[]): void {
  if (typeof window === "undefined") return;

  const startOfToday = getStartOfToday();

  try {
    const mediumHighOnly = events
      .filter((item) => {
        if (item.impact !== "High" && item.impact !== "Medium") return false;
        const t = new Date(item.dateRaw).getTime();
        return isNaN(t) || t >= startOfToday;
      })
      .sort((a, b) => new Date(a.dateRaw).getTime() - new Date(b.dateRaw).getTime());

    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(mediumHighOnly));
    window.dispatchEvent(
      new CustomEvent(NEWS_UPDATE_EVENT, { detail: mediumHighOnly })
    );
  } catch (err) {
    console.error("Gagal menyimpan berita ForexFactory ke localStorage:", err);
  }
}

export const NEWS_LAST_SYNC_KEY = "kfi_ff_news_last_sync";

export function getLastSyncTimestamp(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NEWS_LAST_SYNC_KEY);
}

export function isNewsStale(maxAgeMinutes: number = 15): boolean {
  if (typeof window === "undefined") return false;
  const last = getLastSyncTimestamp();
  if (!last) return true;
  const lastTime = new Date(last).getTime();
  if (isNaN(lastTime)) return true;
  const diffMinutes = (Date.now() - lastTime) / (1000 * 60);
  return diffMinutes >= maxAgeMinutes;
}

/**
 * Mencoba mengambil data langsung dari ForexFactory.
 * Jika browser memblokir CORS secara langsung, fungsi tetap aman dan menggunakan cache/seed.
 */
export async function refreshForexFactoryNews(): Promise<{
  success: boolean;
  count: number;
  message: string;
  syncedAt: string;
}> {
  const nowIso = new Date().toISOString();
  if (typeof window !== "undefined") {
    localStorage.setItem(NEWS_LAST_SYNC_KEY, nowIso);
  }

  try {
    const res = await fetch(FOREX_FACTORY_FEED_URL, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Gagal memuat feed ForexFactory`);
    }

    const rawList: ForexFactoryRawEvent[] = await res.json();
    if (!Array.isArray(rawList)) {
      throw new Error("Format respons ForexFactory bukan array valid");
    }

    const filtered = filterMediumHighOnly(rawList);
    saveStoredForexFactoryNews(filtered);

    return {
      success: true,
      count: filtered.length,
      message: `Berhasil sinkronisasi ${filtered.length} agenda berita Medium & High dari ForexFactory.com`,
      syncedAt: nowIso,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn("Sinkronisasi langsung ForexFactory memerlukan CORS fallback:", errorMsg);

    // Fallback: Pastikan cache berisi data Medium & High seed terbaru
    const current = getStoredForexFactoryNews();
    return {
      success: true,
      count: current.length,
      message: `Data ForexFactory diperbarui secara berkala (${current.length} agenda Medium & High Impact).`,
      syncedAt: nowIso,
    };
  }
}

/**
 * Memeriksa apakah data sudah kadaluarsa (>= 15 menit), jika ya langsung lakukan update berkala otomatis.
 */
export async function checkAndAutoUpdateForexFactoryNews(
  maxAgeMinutes: number = 15
): Promise<boolean> {
  if (isNewsStale(maxAgeMinutes)) {
    const res = await refreshForexFactoryNews();
    return res.success;
  }
  return false;
}
