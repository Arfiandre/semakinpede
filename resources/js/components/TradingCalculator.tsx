"use client";

import { useState, useEffect } from "react";
import { Calculator, DollarSign, ShieldAlert, Check, RefreshCw } from "lucide-react";
import {
  getStoredUSDIDRRate,
  fetchLiveUSDIDRRate,
  RATE_UPDATE_EVENT,
  ExchangeRateData,
} from "@/lib/exchangeRate";

interface Instrument {
  symbol: string;
  name: string;
  contractSize: number;
  pipUnit: number;
  typicalSpreadPips: number;
  defaultPrice: number;
  description: string;
}

const instruments: Instrument[] = [
  {
    symbol: "XAUUSD",
    name: "Emas (Gold)",
    contractSize: 100, // 100 troy oz
    pipUnit: 0.1,
    typicalSpreadPips: 2.5,
    defaultPrice: 2650,
    description: "1 Lot = 100 Troy Ounce. Setiap pergerakan $0.1 bernilai $10 per lot standar.",
  },
  {
    symbol: "USOIL",
    name: "Minyak Mentah (WTI Oil)",
    contractSize: 1000, // 1000 barrels
    pipUnit: 0.01,
    typicalSpreadPips: 3,
    defaultPrice: 72.5,
    description: "1 Lot = 1.000 Barel. Pergerakan $0.01 per barel bernilai $10 per lot standar.",
  },
  {
    symbol: "CPO",
    name: "Minyak Kelapa Sawit (CPO)",
    contractSize: 25, // 25 metric tons
    pipUnit: 1,
    typicalSpreadPips: 5,
    defaultPrice: 4200,
    description: "1 Lot = 25 Metrik Ton. Kontrak komoditas unggulan pasar berjangka Indonesia.",
  },
];

const LEVERAGE = 100; // 1:100 standar BAPPEBTI

export default function TradingCalculator() {
  const [selectedSymbol, setSelectedSymbol] = useState("XAUUSD");
  const [lots, setLots] = useState<number>(0.1);
  const [stopLossPips, setStopLossPips] = useState<number>(30);
  const [pipsInput, setPipsInput] = useState<string>("30");
  const [accountBalance, setAccountBalance] = useState<number>(1000); // USD

  // Kurs USD/IDR Terkini
  const [exchangeData, setExchangeData] = useState<ExchangeRateData>(() => getStoredUSDIDRRate());
  const [isRefreshingRate, setIsRefreshingRate] = useState(false);

  useEffect(() => {
    // Ambil data kurs tersimpan di awal
    setExchangeData(getStoredUSDIDRRate());

    // Panggil pembaruan kurs live secara background saat mendarat di halaman
    fetchLiveUSDIDRRate().then((data) => {
      setExchangeData(data);
    });

    // Perbarui otomatis setiap 5 menit
    const interval = setInterval(() => {
      fetchLiveUSDIDRRate().then((data) => setExchangeData(data));
    }, 5 * 60 * 1000);

    const handleRateUpdate = (e: Event) => {
      const custom = e as CustomEvent<ExchangeRateData>;
      if (custom.detail) {
        setExchangeData(custom.detail);
      }
    };

    window.addEventListener(RATE_UPDATE_EVENT, handleRateUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener(RATE_UPDATE_EVENT, handleRateUpdate);
    };
  }, []);

  const handleRefreshRate = async () => {
    setIsRefreshingRate(true);
    try {
      const data = await fetchLiveUSDIDRRate();
      setExchangeData(data);
    } finally {
      setTimeout(() => setIsRefreshingRate(false), 500);
    }
  };

  const instrument = instruments.find((i) => i.symbol === selectedSymbol) || instruments[0];

  // Perhitungan:
  // Nilai 1 Pip (USD) = PipUnit * ContractSize * Lots
  const pipValue = instrument.pipUnit * instrument.contractSize * lots;

  // Margin Requirement (USD) = (Price * ContractSize * Lots) / Leverage
  const marginRequired = (instrument.defaultPrice * instrument.contractSize * lots) / LEVERAGE;

  // Estimasi Risiko Kerugian jika terkena Stop Loss
  const riskAmountUSD = pipValue * stopLossPips;
  const currentRiskPercent = accountBalance > 0 ? (riskAmountUSD / accountBalance) * 100 : 0;

  // Estimasi Rupiah menggunakan kurs live terkini
  const marginRequiredIDR = marginRequired * exchangeData.rate;

  const handlePipsChange = (valStr: string) => {
    setPipsInput(valStr);
    if (valStr === "") {
      setStopLossPips(0);
      return;
    }
    const pips = parseFloat(valStr);
    if (!isNaN(pips) && pips > 0) {
      setStopLossPips(pips);
    }
  };

  const handleQuickPercent = (pct: number) => {
    if (accountBalance > 0 && pipValue > 0) {
      const targetRiskUSD = (pct / 100) * accountBalance;
      const calculatedPips = Math.max(1, Math.round(targetRiskUSD / pipValue));
      setStopLossPips(calculatedPips);
      setPipsInput(calculatedPips.toString());
    }
  };

  const handlePipsBlur = () => {
    if (!pipsInput || parseFloat(pipsInput) <= 0) {
      const defaultPips = 30;
      setStopLossPips(defaultPips);
      setPipsInput(defaultPips.toString());
    }
  };

  const handleLotsChange = (newLots: number) => {
    setLots(newLots);
  };

  const handleBalanceChange = (newBalance: number) => {
    setAccountBalance(newBalance);
  };

  const handleSymbolChange = (newSymbol: string) => {
    setSelectedSymbol(newSymbol);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-amber-600" />
            <h3 className="font-[var(--font-heading)] font-bold text-xl text-slate-900">
              Kalkulator Margin & Risiko Komoditas
            </h3>
          </div>
          <p className="text-slate-600 text-sm">
            Hitung kebutuhan margin dan estimasi risiko per trade sebelum membuka posisi di pasar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Badge Kurs Terkini (Live) */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-700">Kurs USD/IDR:</span>
            <span className="font-mono font-extrabold text-slate-900">
              Rp {exchangeData.rate.toLocaleString("id-ID")}
            </span>
            <button
              type="button"
              onClick={handleRefreshRate}
              disabled={isRefreshingRate}
              title={`Perbarui Kurs (Diperbarui ${exchangeData.timeString})`}
              className="ml-0.5 p-0.5 text-slate-500 hover:text-amber-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshingRate ? "animate-spin text-amber-600" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {instruments.map((item) => (
              <button
                key={item.symbol}
                type="button"
                onClick={() => handleSymbolChange(item.symbol)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSymbol === item.symbol
                    ? "bg-navy-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Input Parameters */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">{instrument.name}:</span>{" "}
            {instrument.description}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="calc-lots" className="text-xs font-semibold text-slate-700">
                Ukuran Posisi (Volume Lot)
              </label>
              <span className="text-xs font-mono font-extrabold text-navy-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {lots.toFixed(2)} Lot
              </span>
            </div>

            {/* Slider Bar Sizing Volume */}
            <div className="space-y-1 mb-3">
              <input
                id="calc-lots"
                type="range"
                min="0.01"
                max="2.00"
                step="0.01"
                value={lots}
                onChange={(e) => handleLotsChange(parseFloat(e.target.value) || 0.01)}
                className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium font-mono px-0.5">
                <span>Min: 0.01 Lot</span>
                <span>Max: 2.00 Lot</span>
              </div>
            </div>

            {/* Tombol Preset Lot Size */}
            <div className="grid grid-cols-5 gap-1.5">
              {[0.01, 0.05, 0.1, 0.5, 1.0].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleLotsChange(val)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-center ${
                    lots === val
                      ? "bg-amber-500 border-amber-600 text-slate-950 shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {val} Lot
                </button>
              ))}
            </div>
          </div>

          {/* Jarak Stop Loss (Pips) & Rekomendasi Risiko */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="calc-sl" className="text-xs font-semibold text-slate-700">
                  Jarak Stop Loss (Pips)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {stopLossPips} pips
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100/70 border border-amber-300/60 px-2 py-0.5 rounded-md">
                    {currentRiskPercent.toFixed(1)}% risiko modal
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  id="calc-sl"
                  type="number"
                  min="1"
                  max="5000"
                  step="1"
                  value={pipsInput}
                  onChange={(e) => handlePipsChange(e.target.value)}
                  onBlur={handlePipsBlur}
                  placeholder="30"
                  className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  Pips
                </span>
              </div>
            </div>

            {/* Quick Presets for Risk % */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-600 font-semibold mr-1">Rekomendasi Risiko:</span>
              {[1, 2, 3, 5].map((pct) => {
                const isActive = Math.abs(currentRiskPercent - pct) < 0.2;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickPercent(pct)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isActive
                        ? "bg-amber-500 border-amber-600 text-slate-950 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {pct}%
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="calc-bal" className="text-xs font-semibold text-slate-700">
                Saldo Akun Modal (USD)
              </label>
              <span className="text-xs font-mono text-slate-500">
                ≈ Rp {(accountBalance * exchangeData.rate).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="calc-bal"
                type="number"
                min="100"
                step="100"
                value={accountBalance}
                onChange={(e) => handleBalanceChange(Math.max(50, parseInt(e.target.value) || 100))}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Output Metrics Panel */}
        <div className="lg:col-span-6 bg-slate-900 text-white rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-1">
              Margin yang Dibutuhkan (Leverage 1:100)
            </span>
            <div className="text-3xl font-extrabold text-white font-[var(--font-heading)]">
              ${marginRequired.toFixed(2)}{" "}
              <span className="text-amber-400 text-sm font-normal">USD</span>
            </div>
            <div className="text-slate-400 text-xs mt-1">
              Estimasi Rupiah (Kurs Live):{" "}
              <span className="text-slate-200 font-semibold font-mono">
                Rp {Math.round(marginRequiredIDR).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs block mb-1">Nilai per Pip</span>
              <div className="text-lg font-bold text-amber-400 font-mono">
                ${pipValue.toFixed(2)} USD
              </div>
              <span className="text-[11px] text-slate-400">
                ≈ Rp {Math.round(pipValue * exchangeData.rate).toLocaleString("id-ID")} per 1 pip
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs block mb-1">Risiko Jika Kena SL</span>
              <div
                className={`text-lg font-bold font-mono ${
                  currentRiskPercent > 5 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                ${riskAmountUSD.toFixed(2)} USD
              </div>
              <span className="text-[11px] text-slate-400">
                {currentRiskPercent.toFixed(1)}% dari modal
              </span>
            </div>
          </div>

          {/* Risk Discipline Alert */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              currentRiskPercent > 5
                ? "bg-rose-950/40 border-rose-800/60 text-rose-200"
                : "bg-emerald-950/40 border-emerald-800/60 text-emerald-200"
            }`}
          >
            {currentRiskPercent > 5 ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold mb-0.5">
                {currentRiskPercent > 5
                  ? "Peringatan Manajemen Risiko: Di Atas 5%"
                  : "Manajemen Risiko Ideal: Sesuai Standar Komunitas"}
              </div>
              <p className="leading-relaxed opacity-90">
                {currentRiskPercent > 5
                  ? "Risiko melebihi batas konservatif rekomendasi mentor (1% hingga 3% per posisi). Pertimbangkan menurunkan ukuran lot atau memperkecil jarak SL."
                  : "Risiko terkontrol dengan aman di bawah batas maksimal per transaksi. Disiplin ini kunci kelangsungan akun."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
