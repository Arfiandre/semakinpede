"use client";

import { useState, useEffect } from "react";
import { Clock, Activity, Flame } from "lucide-react";

interface Session {
  name: string;
  city: string;
  startHourWIB: number;
  endHourWIB: number;
  description: string;
  instruments: string;
}

const sessions: Session[] = [
  {
    name: "Sesi Asia / Tokyo",
    city: "Tokyo & Sydney",
    startHourWIB: 6,
    endHourWIB: 15,
    description: "Rentang volatilitas tenang hingga sedang. Reaksi pertama rilis data Asia Pasifik.",
    instruments: "XAU/USD, JPY pairs, Komoditas CPO",
  },
  {
    name: "Sesi Eropa / London",
    city: "London & Frankfurt",
    startHourWIB: 14,
    endHourWIB: 23,
    description: "Pusat volume transaksi fisik dan institusi global. Mulai terjadi breakout tren harian.",
    instruments: "XAU/USD, Brent Oil, EUR/USD, GBP/USD",
  },
  {
    name: "Sesi Amerika / New York",
    city: "New York & Chicago",
    startHourWIB: 19,
    endHourWIB: 4, // 04:00 subuh WIB hari berikutnya
    description: "Volatilitas dan volume tertinggi. Reaksi langsung data rilis CPI, NFP, dan kebijakan FOMC AS.",
    instruments: "XAU/USD, WTI Oil, Gas Alam, Indeks Global",
  },
];

function isSessionActive(currentHour: number, start: number, end: number) {
  if (start < end) {
    return currentHour >= start && currentHour < end;
  }
  // Sesi melintasi tengah malam (19:00 sampai 04:00)
  return currentHour >= start || currentHour < end;
}

export default function MarketHoursClock() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Waktu WIB (UTC+7)
  const wibHour = currentTime
    ? (currentTime.getUTCHours() + 7) % 24
    : 12;

  const wibMinute = currentTime ? currentTime.getUTCMinutes() : 0;
  const wibSecond = currentTime ? currentTime.getUTCSeconds() : 0;

  const timeFormatted = `${String(wibHour).padStart(2, "0")}:${String(wibMinute).padStart(2, "0")}:${String(wibSecond).padStart(2, "0")} WIB`;

  // Golden hours overlap: London + New York (19:00 - 23:00 WIB)
  const isGoldenOverlap = wibHour >= 19 && wibHour < 23;

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-[var(--font-heading)] font-bold text-xl text-white">
              Waktu Sesi Pasar Futures Finansial
            </h3>
          </div>
          <p className="text-slate-400 text-sm">
            Ketahui jam pembukaan bursa global untuk memilih waktu trading dengan likuiditas optimal.
          </p>
        </div>

        {/* Live Clock Display */}
        <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/80 flex items-center gap-3 self-start">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Waktu Server Lokal
            </div>
            <div className="font-mono text-base font-bold text-white tracking-wider">
              {timeFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* Golden Overlap Highlight */}
      {isGoldenOverlap && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3 text-amber-200">
          <Flame className="w-5 h-5 text-amber-400 flex-shrink-0 animate-bounce" />
          <div className="text-xs">
            <span className="font-bold text-amber-300">Sesi Emas Aktif (London + New York Overlap):</span>{" "}
            Likuiditas dan volatilitas komoditas (Gold & Minyak) berada di puncak tertinggi harian.
            Gunakan batas Stop Loss ketat saat rilis berita penting.
          </div>
        </div>
      )}

      {/* Session Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {sessions.map((session) => {
          const active = isSessionActive(wibHour, session.startHourWIB, session.endHourWIB);
          const timeRange = `${String(session.startHourWIB).padStart(2, "0")}:00 - ${String(session.endHourWIB).padStart(2, "0")}:00 WIB`;

          return (
            <div
              key={session.name}
              className={`p-5 rounded-xl border transition-all ${
                active
                  ? "bg-slate-800 border-amber-500/50 shadow-lg shadow-black/30"
                  : "bg-slate-900/60 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    active
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {active ? "SEDANG AKTIF" : "TUTUP"}
                </span>
                <span className="text-xs font-mono font-medium text-slate-400">
                  {timeRange}
                </span>
              </div>

              <h4 className="font-[var(--font-heading)] font-bold text-base text-white mb-1">
                {session.name}
              </h4>
              <div className="text-xs text-amber-400/90 font-medium mb-3">
                {session.city}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {session.description}
              </p>

              <div className="pt-3 border-t border-slate-700/60 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Fokus Pasar:</span>{" "}
                {session.instruments}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
