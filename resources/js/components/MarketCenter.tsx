"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Calendar,
  Zap,
  Bell,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Clock,
} from "lucide-react";
import LeadForm from "./LeadForm";
import TradingViewWidget from "./TradingViewWidget";
import { EconomicNewsEvent } from "@/types/news";
import {
  getStoredForexFactoryNews,
  refreshForexFactoryNews,
  checkAndAutoUpdateForexFactoryNews,
  getLastSyncTimestamp,
  NEWS_UPDATE_EVENT,
} from "@/lib/newsService";

// Pilihan Pasangan Mata Uang & Komoditas Terfavorit untuk Livechart TradingView
const FOREX_PAIR_OPTIONS = [
  { id: "OANDA:XAUUSD", name: "XAU/USD", label: "Emas (Gold)", badge: "Komoditas Utama" },
  { id: "FX:EURUSD", name: "EUR/USD", label: "Euro / US Dollar", badge: "Major Favorit" },
  { id: "FX:GBPUSD", name: "GBP/USD", label: "Pound / US Dollar", badge: "Major Cable" },
  { id: "FX:USDJPY", name: "USD/JPY", label: "USD / Yen Jepang", badge: "Safe Haven" },
  { id: "FX:AUDUSD", name: "AUD/USD", label: "Aussie / US Dollar", badge: "Major Pasifik" },
];

const miniCharts = [
  { symbol: "OANDA:XAUUSD", name: "Gold (XAU/USD)", change: "+0.45%", up: true },
  { symbol: "FX:EURUSD", name: "EUR/USD", change: "+0.18%", up: true },
  { symbol: "FX:GBPUSD", name: "GBP/USD", change: "-0.12%", up: false },
  { symbol: "FX:USDJPY", name: "USD/JPY", change: "+0.25%", up: true },
];

export default function MarketCenter() {
  const [selectedSymbol, setSelectedSymbol] = useState("OANDA:XAUUSD");
  const [selectedInterval, setSelectedInterval] = useState("60");
  const [newsEvents, setNewsEvents] = useState<EconomicNewsEvent[]>([]);
  const [impactFilter, setImpactFilter] = useState<"ALL" | "High" | "Medium">("ALL");
  const [currencyFilter, setCurrencyFilter] = useState<string>("ALL");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    // 1. Ambil data awal dari penyimpanan
    setNewsEvents(getStoredForexFactoryNews());
    const initialLastSync = getLastSyncTimestamp();
    if (initialLastSync) {
      setLastSyncTime(
        new Date(initialLastSync).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }

    // 2. Pemeriksaan otomatis: update berkala jika data sudah kadaluarsa (>= 15 menit)
    const runAutoCheck = async () => {
      await checkAndAutoUpdateForexFactoryNews(15);
      setNewsEvents(getStoredForexFactoryNews());
      const updatedSync = getLastSyncTimestamp();
      if (updatedSync) {
        setLastSyncTime(
          new Date(updatedSync).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      }
    };
    runAutoCheck();

    // 3. Interval background: update berkala otomatis setiap 10 menit
    const periodicTimer = setInterval(async () => {
      await refreshForexFactoryNews();
      setNewsEvents(getStoredForexFactoryNews());
      const nowSync = getLastSyncTimestamp();
      if (nowSync) {
        setLastSyncTime(
          new Date(nowSync).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      }
    }, 10 * 60 * 1000);

    // 4. Listener update event
    const handleUpdate = () => {
      setNewsEvents(getStoredForexFactoryNews());
      const last = getLastSyncTimestamp();
      if (last) {
        setLastSyncTime(
          new Date(last).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      }
    };

    window.addEventListener(NEWS_UPDATE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      clearInterval(periodicTimer);
      window.removeEventListener(NEWS_UPDATE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await refreshForexFactoryNews();
    setNewsEvents(getStoredForexFactoryNews());
    setIsSyncing(false);
    setSyncFeedback(result.message);
    const nowSync = getLastSyncTimestamp();
    if (nowSync) {
      setLastSyncTime(
        new Date(nowSync).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  // ATURAN MUTLAK: Hanya mengambil data Medium & High impact dari ForexFactory
  const filteredNews = newsEvents.filter((ev) => {
    if (ev.impact !== "High" && ev.impact !== "Medium") return false;
    if (impactFilter !== "ALL" && ev.impact !== impactFilter) return false;
    if (currencyFilter !== "ALL" && ev.country !== currencyFilter) return false;
    return true;
  });

  const countHigh = newsEvents.filter((e) => e.impact === "High").length;
  const countMedium = newsEvents.filter((e) => e.impact === "Medium").length;
  const activePair = FOREX_PAIR_OPTIONS.find((p) => p.id === selectedSymbol) || FOREX_PAIR_OPTIONS[0];

  return (
    <section id="market" className="py-16 md:py-24 bg-gray-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Terminal Pasar Real-Time</span>
          </div>
          <h2 className="font-[var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pantau pergerakan harga komoditas &{" "}
            <span className="text-amber-700">kalender ekonomi hari ini</span>
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Akses langsung grafik interaktif TradingView dengan pilihan pasangan mata uang utama serta jadwal rilis indikator makroekonomi berdampak sedang dan tinggi (Medium &amp; High Impact) dari ForexFactory yang diperbarui secara berkala.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Livechart TradingView dengan Pilihan Pair Forex Terfavorit */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col justify-between">
            {/* Header Livechart & Pair Switcher */}
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-slate-50/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-navy-950 text-sm">
                    {activePair.name} ({activePair.label})
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                    Live Chart
                  </span>
                </div>

                {/* Timeframe Selector */}
                <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-200/90 p-0.5 rounded-lg border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setSelectedInterval("60")}
                    className={`px-2.5 py-1 text-[11px] rounded-md font-bold transition-all ${
                      selectedInterval === "60"
                        ? "bg-navy-950 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    1H
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInterval("240")}
                    className={`px-2.5 py-1 text-[11px] rounded-md font-bold transition-all ${
                      selectedInterval === "240"
                        ? "bg-navy-950 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    4H
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInterval("D")}
                    className={`px-2.5 py-1 text-[11px] rounded-md font-bold transition-all ${
                      selectedInterval === "D"
                        ? "bg-navy-950 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    1D
                  </button>
                </div>
              </div>

              {/* Opsi Pair Forex & Komoditas Terfavorit (Paling Sedikit 3 Pasangan) */}
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Pilih Pair Terfavorit:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {FOREX_PAIR_OPTIONS.map((pair) => {
                    const isActive = selectedSymbol === pair.id;
                    return (
                      <button
                        key={pair.id}
                        type="button"
                        onClick={() => setSelectedSymbol(pair.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isActive
                            ? "bg-navy-950 text-white border-navy-900 shadow-sm ring-1 ring-amber-500/50"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <span>{pair.name}</span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                            isActive
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {pair.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* TradingView Widget Container */}
            <div className="bg-navy-950 min-h-[460px]">
              <TradingViewWidget
                key={`${selectedSymbol}_${selectedInterval}`}
                symbol={selectedSymbol}
                interval={selectedInterval}
                theme="dark"
                height={460}
              />
            </div>
          </div>

          {/* Kolom Kanan: Kalender ForexFactory Medium & High Impact dengan Auto-Update Berkala */}
          <div className="lg:col-span-5 space-y-6">
            {/* Economic Calendar Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-navy-950 flex items-center justify-center text-amber-400 font-[var(--font-heading)] font-black text-xs shadow-xs">
                    FF
                  </div>
                  <div>
                    <h3 className="font-[var(--font-heading)] font-bold text-navy-900 text-sm sm:text-base leading-tight">
                      Kalender Berita ForexFactory
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-amber-700 font-semibold">
                        Khusus Medium &amp; High Impact
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Auto-Update
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-navy-950 hover:bg-slate-100 transition-colors"
                    title="Perbarui data ForexFactory sekarang"
                    aria-label="Refresh Kalender ForexFactory"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-amber-600" : ""}`} />
                  </button>
                  <a
                    href="https://www.forexfactory.com/calendar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-slate-600 hover:text-amber-700 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-50 border border-slate-200"
                  >
                    <span>ForexFactory</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Status Update Berkala */}
              <div className="mb-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Terakhir diperbarui:
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {lastSyncTime ? `${lastSyncTime} WIB` : "Hari Ini"}
                </span>
              </div>

              {syncFeedback && (
                <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-semibold">
                  {syncFeedback}
                </div>
              )}

              {/* Filter Impact Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setImpactFilter("ALL")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      impactFilter === "ALL"
                        ? "bg-navy-950 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Semua ({filteredNews.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setImpactFilter("High")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      impactFilter === "High"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    High Impact ({countHigh})
                  </button>
                  <button
                    type="button"
                    onClick={() => setImpactFilter("Medium")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      impactFilter === "Medium"
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Medium Impact ({countMedium})
                  </button>
                </div>

                {/* Filter Mata Uang */}
                <select
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                >
                  <option value="ALL">Semua Valuta</option>
                  <option value="USD">USD (Dolar AS)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (Poundsterling)</option>
                  <option value="JPY">JPY (Yen Jepang)</option>
                  <option value="AUD">AUD (Dolar Aussie)</option>
                  <option value="CAD">CAD (Dolar Kanada)</option>
                  <option value="CHF">CHF (Franc Swiss)</option>
                </select>
              </div>

              {/* Event List */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredNews.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Tidak ada agenda berita untuk filter yang dipilih.
                  </div>
                ) : (
                  filteredNews.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Impact Tag */}
                        <div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            event.impact === "High" ? "bg-rose-500" : "bg-amber-500"
                          }`}
                          title={`Impact: ${event.impact}`}
                        />

                        {/* Currency Code */}
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] flex-shrink-0">
                          {event.country}
                        </span>

                        {/* Title & Date */}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate text-xs">
                            {event.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {event.dateFormatted} · {event.timeFormatted}
                          </p>
                        </div>
                      </div>

                      {/* Forecast / Previous */}
                      <div className="text-right flex-shrink-0 font-mono text-[11px]">
                        <div className="text-slate-900 font-bold">
                          F: {event.forecast || "-"}
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          P: {event.previous || "-"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Sumber: ForexFactory.com</span>
                <span className="text-emerald-700 font-semibold">Tersaring: Medium &amp; High Saja</span>
              </div>
            </div>

            {/* Mini Quotes Bar */}
            <div className="grid grid-cols-2 gap-3">
              {miniCharts.map((chart) => (
                <div
                  key={chart.symbol}
                  className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition-shadow"
                >
                  <div className="text-[11px] text-gray-500 font-medium mb-1">
                    {chart.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`text-sm font-bold font-mono ${chart.up ? "text-green-600" : "text-red-500"}`}
                    >
                      {chart.change}
                    </div>
                    <div
                      className={`text-xs ${chart.up ? "text-green-500" : "text-red-400"}`}
                    >
                      {chart.up ? "▲" : "▼"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Box (Bagan Market Insight yang belum ada AI telah dihapus sepenuhnya) */}
        <div className="mt-10 bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-6 md:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-gold-400" />
                <span className="text-gold-400 text-sm font-semibold">
                  GRATIS
                </span>
              </div>
              <h3 className="font-[var(--font-heading)] text-xl md:text-2xl font-bold text-white mb-2">
                Dapatkan Notifikasi Kalender Berita
                <br />
                Langsung ke Telegram Kamu
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Jadwal rilis data makroekonomi Medium &amp; High Impact dikirim tepat waktu sebelum sesi perdagangan aktif.
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm mb-3">
                Tinggalkan @Telegram kamu:
              </p>
              <LeadForm compact dark source="market-center" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
