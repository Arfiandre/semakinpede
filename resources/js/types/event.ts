export type EventStatus = "ongoing" | "upcoming" | "past";

export type EventCategory =
  | "Trading Competition"
  | "Webinar Online"
  | "Live Trading Bareng"
  | "Workshop Khusus"
  | "Seminar Edukasi";

export interface EventItem {
  id: string;
  posterImage: string; // Field Gambar Poster (Base64 atau URL)
  title: string; // Nama Event
  date: string; // Tanggal Pelaksanaan format teks (contoh: "Sabtu, 24 Oktober 2026")
  time?: string; // Jam Pelaksanaan (contoh: "19.30 - 21.30 WIB")
  description: string; // Keterangan Event
  category: EventCategory;
  status: EventStatus;
  location?: string; // Lokasi fisik atau platform meeting
  speaker?: string; // Pembicara / Mentor

  // Input terstruktur tanggal & waktu
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (opsional untuk rentang multi-hari)
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM

  // Field khusus: Webinar Online
  meetingUrl?: string; // Tautan Zoom / Google Meet

  // Field khusus: Live Trading Bareng
  tradingSession?: string; // Sesi London / New York / Asia
  targetInstrument?: string; // XAU/USD, WTI Oil, CPO
  tradingPlatform?: string; // MetaTrader 5, MT4, TradingView

  // Field khusus: Workshop Khusus / Trading Competition
  workshopSubtype?: "competition" | "bootcamp";
  prizePool?: string; // Total hadiah (contoh: Rp 50.000.000)
  maxDrawdown?: string; // Batas Drawdown (contoh: 5%)
  registrationDeadline?: string; // Tanggal penutupan registrasi (YYYY-MM-DD)

  // Field khusus: Seminar Edukasi (Offline)
  venueCity?: string; // Kota pelaksanaan
  venueAddress?: string; // Alamat lengkap gedung
  seatQuota?: number; // Kuota kursi fisik

  // Poin pembahasan / fasilitas
  keyTakeaways?: string[];
  attendeesCount?: string;
  actionText?: string;
  actionType?: "join-live" | "rsvp" | "recap";
  recapNote?: string;
  // Link integrasi pendaftaran & grup event
  telegramGroupUrl?: string; // Tautan grup Telegram untuk koordinasi peserta event
  tutorialAccountUrl?: string; // Tautan panduan/tutorial pembuatan akun trading

  createdAt?: string;
  updatedAt?: string;
}
