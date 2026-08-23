"use client";

import {
  TrendingUp,
  Calendar,
  Zap,
  Bell,
  BarChart3,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import LeadForm from "./LeadForm";
import TradingViewWidget from "./TradingViewWidget";

const economicEvents = [
  { time: "19:30", event: "CPI AS (YoY)", impact: "tinggi", currency: "USD" },
  { time: "19:30", event: "Retail Sales AS", impact: "tinggi", currency: "USD" },
  {
    time: "21:00",
    event: "Michigan Consumer Sentiment",
    impact: "sedang",
    currency: "USD",
  },
  {
    time: "22:00",
    event: "Crude Oil Inventories",
    impact: "tinggi",
    currency: "USD",
  },
  {
    time: "23:00",
    event: "FOMC Meeting Minutes",
    impact: "tinggi",
    currency: "USD",
  },
];

const impactColors: Record<string, string> = {
  tinggi: "bg-red-500",
  sedang: "bg-yellow-500",
  rendah: "bg-green-500",
};

const miniCharts = [
  { symbol: "OANDA:XAUUSD", name: "Gold", change: "+0.45%", up: true },
  { symbol: "OANDA:XBRUSD", name: "Brent Oil", change: "-0.23%", up: false },
  { symbol: "OANDA:XNGUSD", name: "Natural Gas", change: "+1.12%", up: true },
  { symbol: "USDCAD", name: "USD/CAD", change: "-0.08%", up: false },
];

export default function MarketCenter() {
  return (
    <section id="market" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-navy-900/5 rounded-full px-4 py-1.5 mb-4">
            <Zap className="w-4 h-4 text-gold-500" />
            <span className="text-navy-700 text-xs font-semibold uppercase tracking-wider">
              Live Market Update
            </span>
          </div>
          <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy-900">
            Pusat Informasi Trader
            <br />
            <span className="text-gold-500">Futures Hari Ini</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* TradingView Chart */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gold-500" />
                <span className="font-semibold text-navy-900 text-sm">
                  XAU/USD - Gold
                </span>
                <span className="text-xs text-gray-400">Live Chart</span>
              </div>
              <div className="flex gap-1">
                <span className="px-2 py-0.5 bg-navy-900 text-white text-[10px] rounded font-medium">
                  1H
                </span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded font-medium">
                  4H
                </span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded font-medium">
                  1D
                </span>
              </div>
            </div>
            {/* Real TradingView Widget */}
            <div className="bg-navy-950">
              <TradingViewWidget
                symbol="OANDA:XAUUSD"
                interval="60"
                theme="dark"
                height={450}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Economic Calendar */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold-500" />
                  <h3 className="font-[var(--font-heading)] font-bold text-navy-900">
                    Kalender Ekonomi Hari Ini
                  </h3>
                </div>
                <a
                  href="https://www.tradingview.com/economic-calendar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-navy-500 hover:text-gold-500 transition-colors flex items-center gap-1"
                >
                  Semua
                  <ChevronRight className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-2.5">
                {economicEvents.map((event, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-mono text-gray-500 w-12 flex-shrink-0">
                      {event.time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-navy-900 truncate">
                        {event.event}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {event.currency}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          event.impact === "tinggi"
                            ? "bg-red-100 text-red-600"
                            : event.impact === "sedang"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                        }`}
                      >
                        {event.impact}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${impactColors[event.impact]}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Charts Row */}
            <div className="grid grid-cols-2 gap-3">
              {miniCharts.map((chart) => (
                <div
                  key={chart.symbol}
                  className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition-shadow"
                >
                  <div className="text-[11px] text-gray-400 mb-1">
                    {chart.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`text-sm font-bold ${chart.up ? "text-green-600" : "text-red-500"}`}
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

            {/* Market Insight */}
            <div className="bg-navy-900 rounded-2xl shadow-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-gold-400 text-xs font-semibold uppercase tracking-wider">
                  Market Insight 1 Menit
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Data CPI AS malam ini berpotensi gerakkan Gold. Area pantau{" "}
                <span className="text-gold-400 font-bold">2,295 - 2,305</span>.
                Perhatikan reaksi pasar terhadap angka actual vs forecast.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1 mt-3 text-gold-400 text-sm font-semibold hover:text-gold-300 transition-colors"
              >
                Baca Analisis Lengkap
                <BarChart3 className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* CTA Box */}
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
                Dapat Insight + Notifikasi News
                <br />
                Langsung ke Telegram Kamu
              </h3>
              <p className="text-gray-400 text-sm">
                Update market setiap hari. Analisis teknikal + fundamental.
                Tidak spam.
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm mb-3">
                Tinggalin @Telegram kamu:
              </p>
              <LeadForm compact dark source="market-center" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
