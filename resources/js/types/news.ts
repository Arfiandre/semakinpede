export type NewsImpact = "High" | "Medium";

export interface ForexFactoryRawEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast?: string;
  previous?: string;
}

export interface EconomicNewsEvent {
  id: string;
  title: string;
  country: string;
  dateRaw: string;
  timeFormatted: string; // Format jam WIB (contoh: 19:30 WIB)
  dateFormatted: string; // Format tanggal (contoh: 14 Okt 2026)
  dayName: string; // Hari dalam bahasa Indonesia
  impact: NewsImpact; // Hanya "High" atau "Medium"
  forecast: string;
  previous: string;
  source: string; // "ForexFactory.com"
}
