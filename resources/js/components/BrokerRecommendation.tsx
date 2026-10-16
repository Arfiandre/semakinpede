"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Lock,
  FileCheck,
  Star,
  Building2,
  Award,
} from "lucide-react";
import { BrokerItem } from "@/types/broker";
import {
  getStoredBrokers,
  DEFAULT_BROKERS,
  BROKER_UPDATE_EVENT,
} from "@/lib/brokerStorage";

const safetyChecklist = [
  {
    title: "1. Pastikan Izin BAPPEBTI Aktif",
    desc: "Cek nomor legalitas pialang langsung di situs resmi bappebti.go.id pada daftar pialang berizin.",
  },
  {
    title: "2. Verifikasi Rekening Terpisah (Segregated)",
    desc: "Setoran deposit wajib disetor ke rekening atas nama PT Pialang Terdaftar di bank nasional, bukan rekening perorangan.",
  },
  {
    title: "3. Terdaftar di Lembaga Kliring",
    desc: "Setiap transaksi harus terdaftar dan memiliki nomor kliring resmi di KBI atau ICH.",
  },
  {
    title: "4. Waspadai Janji Fixed Income",
    desc: "Pialang legal dilarang menjanjikan imbal hasil pasti (fixed profit) atau titip dana kelolaan tanpa risiko.",
  },
];

export default function BrokerRecommendation() {
  const [brokers, setBrokers] = useState<BrokerItem[]>(DEFAULT_BROKERS);
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>("");

  useEffect(() => {
    const list = getStoredBrokers();
    setBrokers(list);
    if (list.length > 0) {
      const featured = list.find((b) => b.isFeatured) || list[0];
      setSelectedBrokerId(featured.id);
    }

    const handleUpdate = () => {
      const updatedList = getStoredBrokers();
      setBrokers(updatedList);
      if (updatedList.length > 0) {
        setSelectedBrokerId((prev) => {
          const exists = updatedList.find((b) => b.id === prev);
          if (exists) return prev;
          const featured = updatedList.find((b) => b.isFeatured) || updatedList[0];
          return featured.id;
        });
      }
    };

    window.addEventListener(BROKER_UPDATE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(BROKER_UPDATE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const activeBroker =
    brokers.find((b) => b.id === selectedBrokerId) ||
    brokers.find((b) => b.isFeatured) ||
    brokers[0] ||
    DEFAULT_BROKERS[0];

  return (
    <section id="broker" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Kemitraan Broker & Standar Keamanan Dana</span>
          </div>
          <h2 className="font-[var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pialang Berjangka Resmi Berizin{" "}
            <span className="text-amber-700">BAPPEBTI</span>
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Keamanan legalitas adalah syarat mutlak sebelum melakukan transaksi. Komunitas Semakin Pede hanya bermitra dengan pialang resmi yang memenuhi standar kepatuhan regulasi di Republik Indonesia.
          </p>
        </div>

        {/* Multi-Broker Selector Tabs (if more than 1 broker) */}
        {brokers.length > 1 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 bg-slate-200/60 p-1.5 rounded-2xl w-fit border border-slate-300/80">
            <span className="text-xs font-bold text-slate-600 px-2 py-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              Pilih Mitra Resmi:
            </span>
            {brokers.map((broker) => {
              const isSelected = activeBroker.id === broker.id;
              return (
                <button
                  key={broker.id}
                  type="button"
                  onClick={() => setSelectedBrokerId(broker.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span>{broker.shortName}</span>
                  {broker.isFeatured && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-200 px-1.5 py-0.2 rounded font-extrabold">
                      Utama
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Active Broker Partner Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
              <div className="flex items-center gap-3.5">
                {activeBroker.logoUrl ? (
                  <img
                    src={activeBroker.logoUrl}
                    alt={activeBroker.name}
                    className="w-12 h-12 rounded-xl object-contain border border-slate-200 p-1 bg-white"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-navy-950 flex items-center justify-center text-amber-400 font-[var(--font-heading)] font-black text-lg shadow-xs">
                    {activeBroker.shortName.slice(0, 4)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-[var(--font-heading)] font-bold text-lg sm:text-xl text-slate-900">
                      {activeBroker.name}
                    </h3>
                    {activeBroker.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        Mitra Utama
                      </span>
                    )}
                  </div>
                  <p className="text-amber-700 text-xs font-semibold mt-0.5">
                    {activeBroker.tagline || activeBroker.statusBadge}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold self-start sm:self-auto">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{activeBroker.licenseNumber}</span>
              </span>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {activeBroker.description}
            </p>

            {/* Keunggulan & Legalitas */}
            <div className="space-y-3 mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Standar Kepatuhan & Fasilitas Transaksi:
              </span>
              {activeBroker.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
              {activeBroker.actionUrl ? (
                <a
                  href={activeBroker.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 bg-navy-950 hover:bg-navy-900 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>{activeBroker.actionText || "Konsultasi Pendaftaran"}</span>
                </a>
              ) : (
                <a
                  href={`https://wa.me/628176792110?text=${encodeURIComponent(
                    `Halo Admin Semakin Pede, saya ingin konsultasi pendaftaran pialang resmi ${activeBroker.name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 bg-navy-950 hover:bg-navy-900 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Konsultasi Pendaftaran {activeBroker.shortName}</span>
                </a>
              )}

              {activeBroker.officialSiteUrl && (
                <a
                  href={activeBroker.officialSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-medium text-xs sm:text-sm transition-colors"
                >
                  <span>Cek Profil di Bappebti.go.id</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Panduan Edukasi Verifikasi Keamanan */}
          <div className="lg:col-span-5 bg-navy-950 text-white rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Edukasi Perlindungan Investor</span>
              </div>
              <h3 className="font-[var(--font-heading)] font-bold text-lg sm:text-xl text-white">
                4 Panduan Wajib Memilih Pialang Legal
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Hindari risiko penipuan pialang ilegal atau robot trading abal-abal dengan menerapkan panduan dasar ini.
              </p>
            </div>

            <div className="space-y-4">
              {safetyChecklist.map((item) => (
                <div
                  key={item.title}
                  className="p-3.5 rounded-xl bg-navy-900/80 border border-navy-800"
                >
                  <h4 className="font-bold text-xs sm:text-sm text-amber-300 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-navy-800 text-[11px] text-slate-400 leading-relaxed">
              Catatan Keterbukaan: Komunitas Semakin Pede menyediakan pendampingan edukasi objektif.
              Kami tidak memungut biaya apapun dari member untuk konsultasi pendaftaran pialang resmi.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
