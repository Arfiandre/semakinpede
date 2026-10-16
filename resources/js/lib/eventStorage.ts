import { EventItem } from "@/types/event";
import { saveBatchEventsDB } from "@/lib/db";

export const EVENT_STORAGE_KEY = "kfi_events_v4"; // Migrated to v4 for Trading Competition category
export const EVENT_UPDATE_EVENT = "kfi_events_updated";

// Poster khusus Trading Competition Akhir Oktober 2026
export const COMPETITION_POSTER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><defs><linearGradient id='bgGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23060E1B'/><stop offset='60%25' stop-color='%230F2140'/><stop offset='100%25' stop-color='%23060E1B'/></linearGradient><linearGradient id='goldGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23F59E0B'/><stop offset='50%25' stop-color='%23FCD34D'/><stop offset='100%25' stop-color='%23B45309'/></linearGradient></defs><rect width='800' height='450' fill='url(%23bgGrad)'/><circle cx='650' cy='225' r='180' fill='%23D4AF37' fill-opacity='0.08'/><path d='M60 340 L180 270 L280 290 L420 180 L520 200 L680 90 L740 110' stroke='%23D4AF37' stroke-width='4' fill='none' stroke-linecap='round'/><g fill='%2310B981' opacity='0.75'><rect x='200' y='220' width='8' height='50' rx='2'/><line x1='204' y1='205' x2='204' y2='285' stroke='%2310B981' stroke-width='2'/><rect x='340' y='160' width='8' height='60' rx='2'/><line x1='344' y1='145' x2='344' y2='235' stroke='%2310B981' stroke-width='2'/><rect x='580' y='110' width='8' height='80' rx='2'/><line x1='584' y1='95' x2='584' y2='205' stroke='%2310B981' stroke-width='2'/></g><rect x='60' y='50' width='210' height='30' rx='8' fill='%23D4AF37' fill-opacity='0.2'/><text x='74' y='71' fill='%23FCD34D' font-family='system-ui, sans-serif' font-weight='bold' font-size='12' letter-spacing='1'>TRADING COMPETITION</text><text x='60' y='140' fill='%23FFFFFF' font-family='system-ui, sans-serif' font-weight='900' font-size='38' letter-spacing='-0.5'>TRADING SEMAKIN PEDE</text><text x='60' y='185' fill='url(%23goldGrad)' font-family='system-ui, sans-serif' font-weight='900' font-size='38' letter-spacing='-0.5'>COMPETITION 2026</text><text x='60' y='225' fill='%23E2E8F0' font-family='system-ui, sans-serif' font-size='15'>Kategori: Best Performance (Profit) &amp; Best Volume</text><rect x='60' y='265' width='230' height='36' rx='8' fill='%230A1628' stroke='%23D4AF37' stroke-width='1'/><text x='74' y='288' fill='%23FCD34D' font-family='system-ui, sans-serif' font-weight='bold' font-size='13'>Total Hadiah Rp 5.700.000</text><rect x='305' y='265' width='230' height='36' rx='8' fill='%230A1628' stroke='%231E293B' stroke-width='1'/><text x='319' y='288' fill='%2394A3B8' font-family='system-ui, sans-serif' font-size='13'>29 Okt 2026 (Daftar s.d 26 Okt)</text><g transform='translate(600, 160)'><path d='M20 70 L20 100 L60 100 L60 70 Z M0 20 L80 20 L70 65 L10 65 Z M-10 25 C -25 25, -25 50, 0 50 M90 25 C 105 25, 105 50, 80 50' fill='none' stroke='url(%23goldGrad)' stroke-width='4' stroke-linejoin='round'/><circle cx='40' cy='38' r='10' fill='url(%23goldGrad)' opacity='0.8'/></g><rect x='60' y='360' width='360' height='30' rx='6' fill='%23060E1B'/><text x='72' y='380' fill='%2364748B' font-family='system-ui, sans-serif' font-size='11'>Didukung Pialang Legal BAPPEBTI: TPFX &bull; Tanpa Biaya Pendaftaran</text></svg>";

// Preset poster lainnya jika superadmin ingin membuat event tambahan
export const PRESET_POSTERS = [
  {
    id: "competition-gold-oil",
    name: "Poster Trading Competition (Unggulan)",
    dataUrl: COMPETITION_POSTER,
  },
  {
    id: "gold-mastery",
    name: "Gold (XAU/USD) Analysis",
    dataUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='340' viewBox='0 0 600 340'><rect width='600' height='340' fill='%23060E1B'/><circle cx='480' cy='170' r='120' fill='%23D4AF37' fill-opacity='0.12'/><path d='M40 240 L160 190 L260 210 L380 130 L480 150 L560 90' stroke='%23D4AF37' stroke-width='4' fill='none'/><rect x='40' y='40' width='80' height='24' rx='6' fill='%23D4AF37' fill-opacity='0.2'/><text x='52' y='57' fill='%23D4AF37' font-family='sans-serif' font-weight='bold' font-size='12'>GOLD XAU</text><text x='40' y='120' fill='%23FFFFFF' font-family='sans-serif' font-weight='800' font-size='26'>Setup Pasar Emas</text><text x='40' y='150' fill='%23CBD5E1' font-family='sans-serif' font-size='14'>Analisis Volatilitas Sesi New York</text><rect x='40' y='280' width='160' height='28' rx='6' fill='%230A1628'/><text x='50' y='299' fill='%2394A3B8' font-family='sans-serif' font-size='11'>Komunitas Semakin Pede</text></svg>",
  },
  {
    id: "crude-oil",
    name: "Crude Oil (WTI & Brent)",
    dataUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='340' viewBox='0 0 600 340'><rect width='600' height='340' fill='%230A1628'/><circle cx='500' cy='120' r='140' fill='%23EA580C' fill-opacity='0.15'/><path d='M30 250 C 150 210, 250 260, 370 170 C 450 110, 520 140, 570 100' stroke='%23F97316' stroke-width='4' fill='none'/><rect x='40' y='40' width='80' height='24' rx='6' fill='%23EA580C' fill-opacity='0.25'/><text x='52' y='57' fill='%23FB923C' font-family='sans-serif' font-weight='bold' font-size='12'>ENERGY OIL</text><text x='40' y='120' fill='%23FFFFFF' font-family='sans-serif' font-weight='800' font-size='26'>Minyak Mentah Dunia</text><text x='40' y='150' fill='%23CBD5E1' font-family='sans-serif' font-size='14'>Korelasi EIA & Geopolitik Global</text><rect x='40' y='280' width='160' height='28' rx='6' fill='%23060E1B'/><text x='50' y='299' fill='%2394A3B8' font-family='sans-serif' font-size='11'>Komoditas Berjangka</text></svg>",
  },
  {
    id: "cpo-futures",
    name: "CPO Sawit Indonesia",
    dataUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='340' viewBox='0 0 600 340'><rect width='600' height='340' fill='%23052E16'/><circle cx='460' cy='180' r='130' fill='%2316A34A' fill-opacity='0.15'/><path d='M30 240 L180 200 L320 220 L440 140 L570 120' stroke='%2322C55E' stroke-width='4' fill='none'/><rect x='40' y='40' width='90' height='24' rx='6' fill='%2316A34A' fill-opacity='0.25'/><text x='52' y='57' fill='%234ADE80' font-family='sans-serif' font-weight='bold' font-size='12'>CPO FUTURES</text><text x='40' y='120' fill='%23FFFFFF' font-family='sans-serif' font-weight='800' font-size='26'>Pasar CPO Indonesia</text><text x='40' y='150' fill='%23CBD5E1' font-family='sans-serif' font-size='14'>Siklus Musiman & Kontrak Bursa</text><rect x='40' y='280' width='160' height='28' rx='6' fill='%23022C22'/><text x='50' y='299' fill='%2386EFAC' font-family='sans-serif' font-size='11'>ICDX & JFX Komoditi</text></svg>",
  },
  {
    id: "bappebti-regulasi",
    name: "Regulasi & BAPPEBTI",
    dataUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='340' viewBox='0 0 600 340'><rect width='600' height='340' fill='%230F172A'/><circle cx='480' cy='150' r='120' fill='%230284C7' fill-opacity='0.15'/><rect x='40' y='40' width='100' height='24' rx='6' fill='%230369A1' fill-opacity='0.3'/><text x='52' y='57' fill='%2338BDF8' font-family='sans-serif' font-weight='bold' font-size='12'>BAPPEBTI & KBI</text><text x='40' y='120' fill='%23FFFFFF' font-family='sans-serif' font-weight='800' font-size='26'>Keamanan Legalitas</text><text x='40' y='150' fill='%23CBD5E1' font-family='sans-serif' font-size='14'>Perlindungan Segregated Account</text><rect x='40' y='280' width='180' height='28' rx='6' fill='%231E293B'/><text x='50' y='299' fill='%2394A3B8' font-family='sans-serif' font-size='11'>Seminar Literasi Publik</text></svg>",
  },
  {
    id: "trading-plan",
    name: "Workshop Trading Plan",
    dataUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='340' viewBox='0 0 600 340'><rect width='600' height='340' fill='%231E1B4B'/><circle cx='480' cy='160' r='120' fill='%236366F1' fill-opacity='0.18'/><rect x='40' y='40' width='90' height='24' rx='6' fill='%234338CA' fill-opacity='0.3'/><text x='52' y='57' fill='%23A5B4FC' font-family='sans-serif' font-weight='bold' font-size='12'>WORKSHOP</text><text x='40' y='120' fill='%23FFFFFF' font-family='sans-serif' font-weight='800' font-size='26'>Sistem Trading Plan</text><text x='40' y='150' fill='%23CBD5E1' font-family='sans-serif' font-size='14'>Audit Jurnal & Aturan Stop Loss</text><rect x='40' y='280' width='160' height='28' rx='6' fill='%23312E81'/><text x='50' y='299' fill='%23C7D2FE' font-family='sans-serif' font-size='11'>Mentoring Tatap Muka</text></svg>",
  },
];

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES_ID = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

/**
 * Mengonversi input type="date" menjadi teks tanggal Indonesia yang rapi.
 * Mendukung tanggal tunggal maupun rentang multi-hari.
 */
export function formatEventDateFromInputs(
  startDate: string,
  endDate?: string
): string {
  if (!startDate) return "";
  try {
    const [sYear, sMonth, sDay] = startDate.split("-").map(Number);
    const sDateObj = new Date(sYear, sMonth - 1, sDay);
    const sDayName = DAY_NAMES_ID[sDateObj.getDay()] || "";
    const sMonthName = MONTH_NAMES_ID[sMonth - 1] || "";

    if (!endDate || endDate === startDate) {
      return `${sDayName}, ${sDay} ${sMonthName} ${sYear}`;
    }

    const [eYear, eMonth, eDay] = endDate.split("-").map(Number);
    const eMonthName = MONTH_NAMES_ID[eMonth - 1] || "";

    if (sYear === eYear && sMonth === eMonth) {
      return `${sDay} - ${eDay} ${sMonthName} ${sYear}`;
    } else if (sYear === eYear) {
      return `${sDay} ${sMonthName} - ${eDay} ${eMonthName} ${sYear}`;
    } else {
      return `${sDay} ${sMonthName} ${sYear} - ${eDay} ${eMonthName} ${eYear}`;
    }
  } catch {
    return startDate;
  }
}

/**
 * Mengonversi input type="time" menjadi format jam Indonesia (contoh: 19.30 - 21.00 WIB).
 */
export function formatEventTimeFromInputs(
  startTime?: string,
  endTime?: string
): string {
  if (!startTime) return "";
  const s = startTime.replace(":", ".");
  if (!endTime) return `${s} WIB`;
  const e = endTime.replace(":", ".");
  return `${s} - ${e} WIB`;
}

// DATA UTAMA: Trading Semakin Pede Competition
export const DEFAULT_EVENTS: EventItem[] = [
  {
    id: "event-trading-competition-okt-2026",
    posterImage: COMPETITION_POSTER,
    title: "Trading Semakin Pede Competition",
    category: "Trading Competition",
    status: "upcoming",
    date: "Kamis, 29 Oktober 2026 (Pendaftaran s.d. 26 Oktober 2026)",
    time: "Sesi London & New York (14.00 - 04.00 WIB)",
    location: "Platform MetaTrader 5 (Didukung Pialang Resmi TPFX - BAPPEBTI)",
    speaker: "Dewan Juri Mentor BAPPEBTI & Tim Riset Semakin Pede",
    startDate: "2026-10-29",
    endDate: "2026-10-29",
    startTime: "14:00",
    endTime: "04:00",
    workshopSubtype: "competition",
    prizePool: "Rp 5.700.000",
    registrationDeadline: "2026-10-26",
    description:
      "Kompetisi trading berjangka komunitas Semakin Pede dengan total hadiah Rp 5.700.000 (5,7 Juta Rupiah). Pemenang terbagi menjadi 2 kategori utama: Best Performance (profit terbesar) dan Best Volume (volume lot transaksi terbanyak). Terbuka untuk seluruh member komunitas Semakin Pede.",
    keyTakeaways: [
      "Total Hadiah Rp 5.700.000 (5,7 Juta Rupiah)",
      "Kategori Juara: Best Performance (Profit Terbesar)",
      "Kategori Juara: Best Volume (Volume Lot Terbanyak)",
      "Batas Akhir Pendaftaran: 26 Oktober 2026",
      "Akun Kompetisi Resmi Didukung Pialang Legal BAPPEBTI: TPFX",
    ],
    actionText: "Daftar Sekarang",
    actionType: "rsvp",
    telegramGroupUrl: "https://t.me/semakinpede_official",
    tutorialAccountUrl:
      "https://drive.google.com/file/d/1kBVRqc8q6XcvHSdqVweg_Fc64Z_u79FV/view?usp=sharing",
    createdAt: "2026-10-12T08:00:00.000Z",
    updatedAt: "2026-10-16T13:30:00.000Z",
  },
];

export function getStoredEvents(): EventItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_EVENTS;
  }
  try {
    // Clear out any old v1/v2/v3 cached data if present
    localStorage.removeItem("kfi_events");
    localStorage.removeItem("kfi_events_v2");
    localStorage.removeItem("kfi_events_v3");

    const raw = localStorage.getItem(EVENT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(DEFAULT_EVENTS));
      return DEFAULT_EVENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(DEFAULT_EVENTS));
      return DEFAULT_EVENTS;
    }
    return parsed;
  } catch (err) {
    console.error("Gagal membaca events dari localStorage:", err);
    return DEFAULT_EVENTS;
  }
}

export function saveStoredEvents(events: EventItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(
      new CustomEvent(EVENT_UPDATE_EVENT, { detail: events })
    );
    // Simpan ke database IndexedDB
    saveBatchEventsDB(events).catch(() => {});
  } catch (err) {
    console.error("Gagal menyimpan events ke localStorage:", err);
  }
}

export function addEvent(
  newEvent: Omit<EventItem, "id" | "createdAt" | "updatedAt">
): EventItem {
  const current = getStoredEvents();
  const id = `event-${Date.now()}`;
  const now = new Date().toISOString();
  const item: EventItem = {
    ...newEvent,
    id,
    createdAt: now,
    updatedAt: now,
  };
  const updated = [item, ...current];
  saveStoredEvents(updated);
  return item;
}

export function updateEvent(
  id: string,
  updatedFields: Partial<Omit<EventItem, "id" | "createdAt">>
): EventItem | null {
  const current = getStoredEvents();
  const index = current.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const updatedItem: EventItem = {
    ...current[index],
    ...updatedFields,
    updatedAt: new Date().toISOString(),
  };

  current[index] = updatedItem;
  saveStoredEvents(current);
  return updatedItem;
}

export function deleteEvent(id: string): boolean {
  const current = getStoredEvents();
  const filtered = current.filter((e) => e.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredEvents(filtered);
  return true;
}

export function resetToDefaultEvents(): EventItem[] {
  saveStoredEvents(DEFAULT_EVENTS);
  return DEFAULT_EVENTS;
}
