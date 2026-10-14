"use client";

import { useState } from "react";
import { BarChart3, Activity, Award, ChevronDown, ChevronUp } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Rizky A.", gain: "+31.4%", winRate: "62%", pair: "XAUUSD (Gold)", trades: 48 },
  { rank: 2, name: "Diana P.", gain: "+24.1%", winRate: "58%", pair: "WTI Oil", trades: 36 },
  { rank: 3, name: "Ahmad F.", gain: "+18.6%", winRate: "54%", pair: "XAUUSD (Gold)", trades: 42 },
  { rank: 4, name: "Sari M.", gain: "+15.2%", winRate: "55%", pair: "CPO", trades: 28 },
  { rank: 5, name: "Budi K.", gain: "+11.8%", winRate: "51%", pair: "XAUUSD (Gold)", trades: 31 },
];

const extendedLeaderboard = [
  { rank: 6, name: "Hendra W.", gain: "+9.4%", winRate: "52%", pair: "Brent Oil", trades: 25 },
  { rank: 7, name: "Kevin T.", gain: "+8.1%", winRate: "49%", pair: "XAUUSD (Gold)", trades: 33 },
  { rank: 8, name: "Nadia S.", gain: "+6.5%", winRate: "50%", pair: "CPO", trades: 19 },
];

const heatmapData = [
  [2, 3, -1, 4, 2],
  [-1, 2, 3, -2, 3],
  [3, -1, 2, 4, 1],
  [-2, 3, -1, 3, 2],
  [1, 4, 2, -1, 3],
  [4, -2, 3, 1, 4],
  [-1, 2, 4, 3, -2],
  [2, 3, -1, 2, 4],
];

function getHeatColor(value: number) {
  if (value >= 4) return "bg-emerald-600";
  if (value >= 3) return "bg-emerald-500";
  if (value >= 2) return "bg-emerald-400";
  if (value >= 1) return "bg-emerald-300";
  if (value === 0) return "bg-slate-200";
  if (value >= -1) return "bg-rose-300";
  if (value >= -2) return "bg-rose-400";
  return "bg-rose-500";
}

export default function TradingJournal() {
  const [showAll, setShowAll] = useState(false);

  const displayedList = showAll
    ? [...leaderboardData, ...extendedLeaderboard]
    : leaderboardData;

  return (
    <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <span>Disiplin Evaluasi Transaksi</span>
          </div>
          <h2 className="font-[var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pentingnya jurnal trading &{" "}
            <span className="text-amber-700">evaluasi performa objektif</span>
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Keberhasilan dalam trading komoditas bukan ditentukan oleh satu transaksi beruntung, melainkan konsistensi pengelolaan risiko dan pencatatan yang disiplin.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Heatmap Journal Visualization */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-600" />
                <h3 className="font-[var(--font-heading)] font-bold text-slate-900 text-base">
                  Simulasi Kalender Disiplin Harian (8 Pekan)
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-rose-400 rounded" /> Merah (Minus)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-emerald-500 rounded" /> Hijau (Plus)
                </span>
              </div>
            </div>

            {/* Heatmap Matrix */}
            <div className="space-y-1.5 mb-2">
              {heatmapData.map((week, wi) => (
                <div key={wi} className="flex gap-1.5 items-center">
                  <span className="text-[11px] font-mono text-slate-400 w-7 flex-shrink-0 text-right">
                    P{wi + 1}
                  </span>
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={`flex-1 h-7 rounded ${getHeatColor(day)} transition-colors`}
                      title={`Pekan ${wi + 1}, Hari ${di + 1}: ${day > 0 ? "+" : ""}${day}`}
                      role="gridcell"
                      aria-label={`Pekan ${wi + 1}, Hari ${di + 1}: ${day > 0 ? "untung" : "rugi"}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="flex gap-1.5 ml-9 mb-4">
              {["Sen", "Sel", "Rab", "Kam", "Jum"].map((d, i) => (
                <span key={i} className="flex-1 text-center text-[10px] text-slate-400 font-medium">
                  {d}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block mb-0.5">Rata-rata Win Rate</span>
                <span className="font-bold text-slate-900 text-sm">56.4%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block mb-0.5">Risk-Reward Ratio</span>
                <span className="font-bold text-emerald-700 text-sm">1 : 1.8</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
              Catatan: Contoh di atas memperlihatkan bahwa trader tetap dapat bertumbuh meski mengalami hari-hari merah, selama risiko kerugian dibatasi ketat dengan Stop Loss.
            </p>
          </div>

          {/* Member Journal Highlights */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <h3 className="font-[var(--font-heading)] font-bold text-slate-900 text-base">
                    Rekam Jejak Disiplin Member Komunitas
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Periode Terverifikasi</span>
              </div>

              {/* Table / List */}
              <div className="space-y-2 mb-4">
                {displayedList.map((trader) => (
                  <div
                    key={trader.rank}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        trader.rank === 1
                          ? "bg-amber-400 text-navy-950"
                          : trader.rank === 2
                            ? "bg-slate-300 text-slate-800"
                            : trader.rank === 3
                              ? "bg-amber-700 text-white"
                              : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {trader.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                        {trader.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Fokus: {trader.pair} · {trader.trades} trade
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-700 font-bold text-xs sm:text-sm font-mono">
                        {trader.gain}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        WR {trader.winRate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                {showAll ? "Tampilkan Lebih Sedikit" : "Tampilkan Lebih Banyak Rekam Jejak"}
                {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <p className="text-[11px] text-slate-500 mt-4 text-center leading-relaxed">
                Peringatan: Kinerja masa lalu bukan merupakan jaminan hasil di masa mendatang. Data disajikan untuk tujuan studi dan edukasi komunitas Semakin Pede.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
