"use client";

import { BarChart3, TrendingUp, Award, ArrowRight, Activity } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

const leaderboard = [
  { rank: 1, name: "Rizky A.", gain: "+312,4%", winRate: "68%", pair: "XAUUSD" },
  { rank: 2, name: "Diana P.", gain: "+287,1%", winRate: "72%", pair: "XBRUSD" },
  { rank: 3, name: "Ahmad F.", gain: "+198,6%", winRate: "61%", pair: "XAUUSD" },
  { rank: 4, name: "Sari M.", gain: "+156,2%", winRate: "65%", pair: "CPO" },
  { rank: 5, name: "Budi K.", gain: "+134,8%", winRate: "58%", pair: "XAUUSD" },
];

const heatmapData = [
  // Minggu 1-12, hari Senin-Jumat, warna merah (rugi) ke hijau (untung)
  [2, 3, -1, 4, 2],
  [-1, 2, 5, -2, 3],
  [3, -1, 2, 4, 1],
  [-2, 3, -1, 5, 2],
  [1, 4, 2, -1, 3],
  [4, -2, 3, 1, 5],
  [-1, 2, 4, 3, -2],
  [2, 5, -1, 2, 4],
];

function getHeatColor(value: number) {
  if (value >= 4) return "bg-green-500";
  if (value >= 3) return "bg-green-400";
  if (value >= 2) return "bg-green-300";
  if (value >= 1) return "bg-green-200";
  if (value === 0) return "bg-gray-200";
  if (value >= -1) return "bg-red-200";
  if (value >= -2) return "bg-red-300";
  return "bg-red-400";
}

export default function TradingJournal() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-16">
          <AnimateOnScroll animation="fade-up">
            <div className="inline-flex items-center gap-2 bg-navy-900/5 rounded-full px-4 py-1.5 mb-4">
              <BarChart3 className="w-4 h-4 text-gold-500" />
              <span className="text-navy-700 text-xs font-semibold uppercase tracking-wider">
                Journal & Leaderboard
              </span>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={100}>
            <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy-900 mb-4">
              Trader terbaik Semakin Pede,
              <br />
              <span className="text-gold-500">angka nyata.</span>
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={200}>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl">
              Bukan klaim. Tiap gain dan win rate di bawah tercatat dari akun
              trading yang tersambung — update sendiri tiap ada trade baru.
            </p>
          </AnimateOnScroll>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Heatmap Journal */}
          <AnimateOnScroll animation="fade-left">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gold-500" />
                  <h3 className="font-[var(--font-heading)] font-bold text-navy-900">
                    Heatmap Trading
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-300 rounded" /> Rugi
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-green-400 rounded" /> Untung
                  </span>
                </div>
              </div>

              {/* Heatmap Grid */}
              <div className="space-y-1.5">
                {heatmapData.map((week, wi) => (
                  <div key={wi} className="flex gap-1.5">
                    <span className="text-[10px] text-gray-400 w-6 flex-shrink-0 text-right">
                      W{wi + 1}
                    </span>
                    {week.map((day, di) => (
                      <div
                        key={di}
                        className={`flex-1 h-7 rounded ${getHeatColor(day)} transition-colors`}
                        title={`Minggu ${wi + 1}, Hari ${di + 1}: ${day > 0 ? "+" : ""}${day}`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex gap-1.5 mt-2 ml-8">
                {["S", "S", "R", "K", "J"].map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[10px] text-gray-400">
                    {d}
                  </span>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total trade</span>
                  <span className="font-bold text-navy-900">1.247</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-500">Win rate</span>
                  <span className="font-bold text-green-600">64,2%</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 mt-3 italic">
                Contoh tampilan · 12 minggu data · update otomatis dari MT5
              </p>
            </div>
          </AnimateOnScroll>

          {/* Leaderboard */}
          <AnimateOnScroll animation="fade-right">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold-500" />
                  <h3 className="font-[var(--font-heading)] font-bold text-navy-900">
                    Leaderboard
                  </h3>
                </div>
                <span className="text-xs text-gray-400">Agustus 2026</span>
              </div>

              {/* Leaderboard Table */}
              <div className="space-y-2">
                {leaderboard.map((trader) => (
                  <div
                    key={trader.rank}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        trader.rank === 1
                          ? "bg-gold-400 text-navy-900"
                          : trader.rank === 2
                            ? "bg-gray-300 text-navy-900"
                            : trader.rank === 3
                              ? "bg-amber-600 text-white"
                              : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {trader.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-navy-900 text-sm truncate">
                        {trader.name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {trader.pair}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-bold text-sm">
                        {trader.gain}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        WR {trader.winRate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="#"
                className="flex items-center justify-center gap-2 mt-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-semibold text-navy-900 transition-colors"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </a>

              <p className="text-[11px] text-gray-400 mt-3 italic">
                Hasil individual, bukan jaminan profit — trading berisiko,
                konten Semakin Pede murni edukasi.
              </p>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Disclaimer */}
        <AnimateOnScroll animation="fade-up" delay={200}>
          <p className="text-center text-gray-400 text-xs mt-8">
            ⓘ Angka di atas adalah hasil individual dari akun yang pemiliknya
            memilih tampil publik — bukan rata-rata member, bukan jaminan, dan
            bukan ajakan meniru.
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
