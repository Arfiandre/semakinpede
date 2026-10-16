import { BrokerItem } from "@/types/broker";
import { saveBatchBrokersDB } from "@/lib/db";

export const BROKER_STORAGE_KEY = "kfi_brokers_v1";
export const BROKER_UPDATE_EVENT = "kfi_brokers_updated";

export const DEFAULT_BROKERS: BrokerItem[] = [
  {
    id: "broker-tpfx",
    name: "PT Trijaya Pratama Futures (TPFX)",
    shortName: "TPFX",
    licenseNumber: "No. 407/BAPPEBTI/SI/VII/2004",
    statusBadge: "Mitra Utama Resmi",
    tagline: "Pialang Berjangka Terdaftar & Diawasi Resmi",
    description:
      "TPFX adalah perusahaan pialang berjangka resmi di Indonesia yang menyediakan instrumen perdagangan komoditas berjangka (Gold, Oil, CPO) dengan infrastruktur eksekusi mutakhir serta transparansi penuh terhadap dana nasabah.",
    highlights: [
      "Izin Usaha Pialang Berjangka BAPPEBTI: No. 407/BAPPEBTI/SI/VII/2004",
      "Anggota Resmi Bursa Berjangka Jakarta (JFX) & ICDX",
      "Penjaminan Transaksi via Kliring Berjangka Indonesia (KBI) & ICH",
      "Rekening Terpisah (Segregated Account) di Bank BCA, Mandiri, BNI, CIMB Niaga",
      "Pilihan Platform Transaksi: MetaTrader 4 & MetaTrader 5 (Desktop & Mobile)",
      "Eksekusi Cepat dengan Dukungan Customer Support 24/5 Berbahasa Indonesia",
    ],
    actionText: "Konsultasi Pendaftaran TPFX",
    actionUrl:
      "https://wa.me/628176792110?text=Halo%20Admin%20Semakin%20Pede,%20saya%20ingin%20konsultasi%20pembukaan%20akun%20demo%20atau%20riil%20TPFX",
    officialSiteUrl: "https://bappebti.go.id",
    isFeatured: true,
    order: 1,
    createdAt: "2026-10-12T08:00:00.000Z",
    updatedAt: "2026-10-12T12:00:00.000Z",
  },
];

export function getStoredBrokers(): BrokerItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_BROKERS;
  }
  try {
    const raw = localStorage.getItem(BROKER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BROKER_STORAGE_KEY, JSON.stringify(DEFAULT_BROKERS));
      return DEFAULT_BROKERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(BROKER_STORAGE_KEY, JSON.stringify(DEFAULT_BROKERS));
      return DEFAULT_BROKERS;
    }
    let needsUpdate = false;
    const result = parsed.map((b) => {
      if (b.actionUrl && b.actionUrl.includes("6281211119999")) {
        needsUpdate = true;
        return { ...b, actionUrl: b.actionUrl.replace("6281211119999", "628176792110") };
      }
      return b;
    });
    if (needsUpdate) {
      localStorage.setItem(BROKER_STORAGE_KEY, JSON.stringify(result));
    }
    return result;
  } catch (err) {
    console.error("Gagal membaca daftar broker dari localStorage:", err);
    return DEFAULT_BROKERS;
  }
}

export function saveStoredBrokers(brokers: BrokerItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BROKER_STORAGE_KEY, JSON.stringify(brokers));
    window.dispatchEvent(
      new CustomEvent(BROKER_UPDATE_EVENT, { detail: brokers })
    );
    // Simpan ke database IndexedDB
    saveBatchBrokersDB(brokers).catch(() => {});
  } catch (err) {
    console.error("Gagal menyimpan daftar broker ke localStorage:", err);
  }
}

export function addBroker(
  item: Omit<BrokerItem, "id" | "createdAt" | "updatedAt">
): BrokerItem {
  const current = getStoredBrokers();
  const now = new Date().toISOString();
  const newBroker: BrokerItem = {
    ...item,
    id: `broker-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  const updated = [...current, newBroker];
  saveStoredBrokers(updated);
  return newBroker;
}

export function updateBroker(
  id: string,
  updates: Partial<BrokerItem>
): BrokerItem | null {
  const current = getStoredBrokers();
  const index = current.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updatedBroker: BrokerItem = {
    ...current[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [...current];
  updatedList[index] = updatedBroker;
  saveStoredBrokers(updatedList);
  return updatedBroker;
}

export function deleteBroker(id: string): boolean {
  const current = getStoredBrokers();
  const filtered = current.filter((b) => b.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredBrokers(filtered);
  return true;
}

export function resetBrokers(): BrokerItem[] {
  saveStoredBrokers(DEFAULT_BROKERS);
  return DEFAULT_BROKERS;
}
