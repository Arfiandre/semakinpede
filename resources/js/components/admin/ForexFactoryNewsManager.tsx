"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  ExternalLink,
  Flame,
  AlertTriangle,
  Search,
  Check,
  ShieldCheck,
  Clock,
  Globe,
  Radio,
} from "lucide-react";
import { EconomicNewsEvent } from "@/types/news";
import {
  getStoredForexFactoryNews,
  refreshForexFactoryNews,
  getLastSyncTimestamp,
  NEWS_UPDATE_EVENT,
  FOREX_FACTORY_FEED_URL,
} from "@/lib/newsService";

export default function ForexFactoryNewsManager() {
  const [news, setNews] = useState<EconomicNewsEvent[]>([]);
  const [search, setSearch] = useState("");
  const [impactFilter, setImpactFilter] = useState<"ALL" | "High" | "Medium">("ALL");
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    setNews(getStoredForexFactoryNews());
    const last = getLastSyncTimestamp();
    if (last) {
      setLastSyncTime(new Date(last).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    }

    const handleUpdate = () => {
      setNews(getStoredForexFactoryNews());
      const updated = getLastSyncTimestamp();
      if (updated) {
        setLastSyncTime(new Date(updated).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
      }
    };

    window.addEventListener(NEWS_UPDATE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(NEWS_UPDATE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const result = await refreshForexFactoryNews();
    setNews(getStoredForexFactoryNews());
    setIsSyncing(false);
    setToastMessage(result.message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const filteredNews = news.filter((ev) => {
    // ATURAN MUTLAK: Hanya Medium & High dan batas terbawah per hari ini
    if (ev.impact !== "High" && ev.impact !== "Medium") return false;
    const eventTime = new Date(ev.dateRaw).getTime();
    if (!isNaN(eventTime) && eventTime < todayStart.getTime()) return false;

    const q = search.toLowerCase();
    const matchSearch =
      ev.title.toLowerCase().includes(q) ||
      ev.country.toLowerCase().includes(q) ||
      ev.dateFormatted.toLowerCase().includes(q);

    const matchImpact = impactFilter === "ALL" || ev.impact === impactFilter;
    return matchSearch && matchImpact;
  });

  const countHigh = news.filter((e) => {
    const t = new Date(e.dateRaw).getTime();
    return e.impact === "High" && (isNaN(t) || t >= todayStart.getTime());
  }).length;

  const countMedium = news.filter((e) => {
    const t = new Date(e.dateRaw).getTime();
    return e.impact === "Medium" && (isNaN(t) || t >= todayStart.getTime());
  }).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy-950 text-white border border-gold-400 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Radio className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Feed Berita Kalender Makroekonomi Real-Time</span>
            </div>
            <h2 className="font-[var(--font-heading)] text-xl sm:text-2xl font-extrabold text-slate-900">
              Integrasi Kalender ForexFactory.com
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl">
              Sistem telah dikonfigurasi untuk <strong>hanya mengambil dan menyaring data Medium &amp; High Impact</strong> dari feed resmi ForexFactory.com. Seluruh agenda berkategori Low dan Libur Bank (Holiday) otomatis diabaikan demi fokus analisa volatilitas pasar Gold, Oil, dan Valas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Menyinkronkan..." : "Sinkronisasi ForexFactory"}</span>
            </button>
            <a
              href="https://www.forexfactory.com/calendar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <span>Buka ForexFactory.com</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Status Sinkronisasi Berkala */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">
              Pembaruan Otomatis: Aktif Berkala (Setiap 10 - 15 Menit)
            </span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">
            Terakhir Diperbarui: {lastSyncTime ? `${lastSyncTime} WIB` : "Hari Ini"}
          </span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Data Lolos Saring</span>
            <span className="text-lg font-bold text-slate-900">{news.length} Agenda</span>
          </div>
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
            <span className="text-[11px] font-semibold text-rose-700 block">High Impact (Merah)</span>
            <span className="text-lg font-bold text-rose-900">{countHigh} Rilis</span>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-700 block">Medium Impact (Oranye)</span>
            <span className="text-lg font-bold text-amber-900">{countMedium} Rilis</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-700 block">Zona Waktu Ditampilkan</span>
            <span className="text-lg font-bold text-emerald-900">WIB (UTC+7)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul berita atau negara (USD, EUR, GBP)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setImpactFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              impactFilter === "ALL"
                ? "bg-navy-950 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({news.length})
          </button>
          <button
            type="button"
            onClick={() => setImpactFilter("High")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              impactFilter === "High"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            High Saja ({countHigh})
          </button>
          <button
            type="button"
            onClick={() => setImpactFilter("Medium")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              impactFilter === "Medium"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Medium Saja ({countMedium})
          </button>
        </div>
      </div>

      {/* News Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-3">Mata Uang</th>
                <th className="py-3 px-4">Nama Agenda / Berita</th>
                <th className="py-3 px-3">Impact</th>
                <th className="py-3 px-4">Forecast</th>
                <th className="py-3 px-4">Previous</th>
                <th className="py-3 px-4">Sumber</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredNews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ada agenda berita yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredNews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 block">{item.timeFormatted}</span>
                      <span className="text-[10px] text-slate-400 block">{item.dateFormatted}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-navy-950 text-white font-mono font-bold text-[11px]">
                        {item.country}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{item.title}</span>
                      <span className="text-[10px] text-slate-400">{item.dayName}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.impact === "High"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.impact === "High" ? "bg-rose-600" : "bg-amber-600"
                          }`}
                        />
                        {item.impact}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {item.forecast}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {item.previous}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span>ForexFactory</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
