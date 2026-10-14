"use client";

import { useState } from "react";
import {
  Calculator,
  Clock,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import TradingCalculator from "./TradingCalculator";
import MarketHoursClock from "./MarketHoursClock";

const curriculumModules = [
  {
    level: "Tahap 1",
    title: "Fondasi & Legalitas Perdagangan Berjangka",
    target: "Pemula Tanpa Pengalaman",
    topics: [
      "Mekanisme Bursa Berjangka (JFX & ICDX) vs Pasar Spot",
      "Peran BAPPEBTI dan Lembaga Kliring Penjamin (KBI & ICH)",
      "Pentingnya Segregated Account (Rekening Terpisah)",
      "Mengenal Kontrak Standar Gold (XAUUSD), WTI Oil, dan CPO",
    ],
  },
  {
    level: "Tahap 2",
    title: "Manajemen Risiko & Perhitungan Margin",
    target: "Paham Dasar Teknis",
    topics: [
      "Rumus Margin Requirement, Leverage 1:100, dan Margin Call",
      "Perhitungan Nilai Pip dan Kontrak Lot Standar",
      "Aturan Risiko Konservatif: Maksimal 1% hingga 2% per Posisi",
      "Penetapan Stop Loss Logis Berdasarkan Struktur Pasar",
    ],
  },
  {
    level: "Tahap 3",
    title: "Analisis Pasar Komoditas (Teknikal & Fundamental)",
    target: "Trader Menengah",
    topics: [
      "Korelasi Dolar AS (DXY) terhadap Emas & Minyak Bumi",
      "Membaca Rilis Kalender Ekonomi: CPI, Non-Farm Payroll, FOMC",
      "Struktur Price Action, Support/Resistance, dan Likuiditas",
      "Dinamika Sesi Pasar: Menentukan Golden Hour London-NY",
    ],
  },
  {
    level: "Tahap 4",
    title: "Psikologi Eksekusi & Evaluasi Jurnal",
    target: "Trader Menuju Konsistensi",
    topics: [
      "Mencegah Overtrading, Revenge Trading, dan FOMO",
      "Menyusun Rencana Trading Tertulis (Trading Plan)",
      "Mencatat dan Menganalisis Jurnal Transaksi Harian",
      "Mengevaluasi Win Rate vs Risk-to-Reward Ratio",
    ],
  },
];

export default function LearningPaths() {
  const [activeTab, setActiveTab] = useState<"kalkulator" | "jam-sesi" | "kurikulum">("kalkulator");

  return (
    <section id="alat-trading" className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div id="edukasi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        {/* Section Header */}
        <div className="mb-10 md:mb-12">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>Alat Praktis & Jalur Belajar Komoditas</span>
          </div>
          <h2 className="font-[var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Alat bantu hitung risiko &{" "}
            <span className="text-amber-700">edukasi terstruktur</span>
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Gunakan kalkulator ukuran posisi, pantau status buka-tutup bursa internasional, dan pelajari kurikulum bertahap yang disusun untuk trader komoditas Indonesia.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-xl max-w-xl mb-8 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab("kalkulator")}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "kalkulator"
                ? "bg-navy-950 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            Kalkulator Margin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("jam-sesi")}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "jam-sesi"
                ? "bg-navy-950 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            Jam Sesi Pasar WIB
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("kurikulum")}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "kurikulum"
                ? "bg-navy-950 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            Kurikulum Belajar
          </button>
        </div>

        {/* Tab Contents */}
        <div>
          {activeTab === "kalkulator" && <TradingCalculator />}

          {activeTab === "jam-sesi" && <MarketHoursClock />}

          {activeTab === "kurikulum" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {curriculumModules.map((mod, idx) => (
                  <div
                    key={mod.title}
                    className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-navy-950 text-amber-400">
                          {mod.level}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {mod.target}
                        </span>
                      </div>
                      <h3 className="font-[var(--font-heading)] font-bold text-base md:text-lg text-slate-900 mb-4">
                        {mod.title}
                      </h3>
                      <ul className="space-y-2.5 mb-6">
                        {mod.topics.map((topic) => (
                          <li
                            key={topic}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a
                      href="#komunitas"
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:border-amber-600 text-slate-800 text-xs font-semibold hover:bg-amber-50 transition-colors w-full"
                    >
                      Ikuti Pembahasan Modul Ini di Grup
                      <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                    </a>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Semua materi di atas dibahas gratis dalam format webinar rutin 3 kali seminggu bersama mentor berlisensi.
                  Tidak dipungut biaya langganan modul atau iuran keanggotaan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
