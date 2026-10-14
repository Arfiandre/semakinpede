import { SiteSettings } from "@/types/settings";
import { saveSettingsDB } from "@/lib/db";

export const SETTINGS_STORAGE_KEY = "kfi_site_settings";
export const SETTINGS_UPDATE_EVENT = "kfi_settings_updated";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logoUrl: "", // Jika kosong, menggunakan logo default bawaan website
  projectTitle: "Semakin Pede",
  projectTagline: "Komunitas Trader Futures Indonesia",
  projectDescription:
    "Komunitas edukasi trading kontrak berjangka komoditi (Gold, Oil, CPO) Indonesia. Berfokus pada manajemen risiko, kepatuhan regulasi BAPPEBTI, dan analisis data pasar secara rasional.",
  socialMedia: {
    whatsapp: "https://wa.me/6281211119999?text=Halo%20Admin%20Semakin%20Pede",
    telegram: "https://t.me/semakinpede",
    instagram: "https://instagram.com/semakinpede",
    youtube: "https://youtube.com/@semakinpede",
  },
  updatedAt: "2026-10-12T12:00:00.000Z",
};

export function getSiteSettings(): SiteSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SITE_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(DEFAULT_SITE_SETTINGS)
      );
      return DEFAULT_SITE_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...parsed,
      socialMedia: {
        ...DEFAULT_SITE_SETTINGS.socialMedia,
        ...(parsed.socialMedia || {}),
      },
    };
  } catch (err) {
    console.error("Gagal membaca site settings dari localStorage:", err);
    return DEFAULT_SITE_SETTINGS;
  }
}

export function saveSiteSettings(settings: SiteSettings): void {
  if (typeof window === "undefined") return;
  try {
    const dataToSave = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(dataToSave));
    window.dispatchEvent(
      new CustomEvent(SETTINGS_UPDATE_EVENT, { detail: dataToSave })
    );
    // Simpan ke database IndexedDB
    saveSettingsDB(dataToSave).catch(() => {});
  } catch (err) {
    console.error("Gagal menyimpan site settings ke localStorage:", err);
  }
}

export function resetSiteSettings(): SiteSettings {
  saveSiteSettings(DEFAULT_SITE_SETTINGS);
  return DEFAULT_SITE_SETTINGS;
}
