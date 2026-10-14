"use client";

import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import {
  TrendingUp,
  MessageCircle,
  Send,
  ExternalLink,
  ShieldAlert,
  X,
  FileText,
} from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/icons/SocialIcons";
import LeadForm from "./LeadForm";
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/siteSettingsStorage";
import { SiteSettings } from "@/types/settings";

export default function Footer() {
  const [activeModal, setActiveModal] = useState<"disclaimer" | "privacy" | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    setSettings(getSiteSettings());

    const handleUpdate = () => {
      setSettings(getSiteSettings());
    };

    window.addEventListener("kfi_settings_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("kfi_settings_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <footer className="bg-navy-950 text-white border-t border-navy-900">
      {/* Final Lead Capture Form Section */}
      <div className="border-b border-navy-900 bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider mb-2">
                <span>Langkah Pertama Edukasi</span>
              </div>
              <h2 className="font-[var(--font-heading)] text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4">
                Mulai perbaiki cara trading Anda bersama mentor kami
              </h2>
              <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">
                Tinggalkan kontak Anda untuk menerima panduan pengenalan kontrak berjangka, akses kalkulator margin, dan link undangan ruang diskusi komunitas.
              </p>
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Diskusi Interaktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold-400" />
                  <span>Kalkulator Risiko Mandiri</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sky-400" />
                  <span>100% Akses Edukasi Gratis</span>
                </div>
              </div>
            </div>

            <div className="bg-navy-900 p-6 sm:p-8 rounded-2xl border border-navy-800">
              <LeadForm dark source="footer" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <a href="#hero" className="flex items-center gap-2.5">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.projectTitle || "Logo Komunitas"}
                  className="h-9 max-w-[150px] object-contain rounded-md"
                />
              ) : (
                <div className="w-9 h-9 bg-gold-400 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-navy-950" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-white font-[var(--font-heading)] font-extrabold text-sm leading-tight tracking-tight uppercase">
                  {settings.projectTitle || "SEMAKIN PEDE"}
                </span>
                {settings.projectTagline && (
                  <span className="text-gold-400 font-[var(--font-heading)] font-bold text-[10px] leading-tight tracking-widest uppercase">
                    {settings.projectTagline}
                  </span>
                )}
              </div>
            </a>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              {settings.projectDescription}
            </p>

            {/* Button Media Sosial */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {settings.socialMedia?.whatsapp && (
                <a
                  href={settings.socialMedia.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-navy-900 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-colors shadow-xs"
                  aria-label="WhatsApp Komunitas"
                  title="WhatsApp Komunitas"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {settings.socialMedia?.telegram && (
                <a
                  href={settings.socialMedia.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-navy-900 hover:bg-sky-600 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-colors shadow-xs"
                  aria-label="Telegram Komunitas"
                  title="Telegram Komunitas"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
              {settings.socialMedia?.instagram && (
                <a
                  href={settings.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-navy-900 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-colors shadow-xs"
                  aria-label="Instagram Komunitas"
                  title="Instagram Komunitas"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {settings.socialMedia?.youtube && (
                <a
                  href={settings.socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-navy-900 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-colors shadow-xs"
                  aria-label="YouTube Channel"
                  title="YouTube Komunitas"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              )}
              <a
                href="https://bappebti.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-navy-900 hover:bg-gold-500 hover:text-navy-950 text-slate-300 rounded-lg flex items-center justify-center transition-colors shadow-xs"
                aria-label="Situs Resmi Bappebti"
                title="Bappebti.go.id"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigasi Cepat */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-[var(--font-heading)]">
              Alat & Kurikulum
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#alat-trading" className="hover:text-gold-400 transition-colors">
                  Kalkulator Margin & Pip
                </a>
              </li>
              <li>
                <a href="#alat-trading" className="hover:text-gold-400 transition-colors">
                  Jam Sesi Pasar Finansial WIB
                </a>
              </li>
              <li>
                <a href="#market" className="hover:text-gold-400 transition-colors">
                  Live Chart TradingView
                </a>
              </li>
              <li>
                <a href="#market" className="hover:text-gold-400 transition-colors">
                  Kalender Ekonomi Harian
                </a>
              </li>
              <li>
                <a href="#event" className="hover:text-gold-400 transition-colors">
                  Agenda & Arsip Event Komunitas
                </a>
              </li>
              <li>
                <a href="#alat-trading" className="hover:text-gold-400 transition-colors">
                  Kurikulum Edukasi 4 Tahap
                </a>
              </li>
            </ul>
          </div>

          {/* Legalitas & Bantuan */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-[var(--font-heading)]">
              Kepatuhan & Informasi Hukum
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#broker" className="hover:text-gold-400 transition-colors">
                  Kemitraan Pialang Resmi (TPFX)
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("disclaimer")}
                  className="hover:text-gold-400 transition-colors text-left"
                >
                  Pernyataan Penafian Risiko (Risk Disclaimer)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("privacy")}
                  className="hover:text-gold-400 transition-colors text-left"
                >
                  Kebijakan Privasi Data Pengguna
                </button>
              </li>
              <li>
                <a href="#faq" className="hover:text-gold-400 transition-colors">
                  Pertanyaan yang Sering Diajukan (FAQ)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Statutory Notice */}
        <div className="mt-12 pt-8 border-t border-navy-900 text-slate-500 text-xs space-y-3">
          <p className="leading-relaxed">
            Pernyataan Keterbukaan Risiko: Perdagangan Berjangka Komoditi mengandung risiko kerugian finansial yang signifikan karena memanfaatkan leverage. Kinerja masa lalu bukan merupakan acuan kepastian kinerja di masa yang akan datang. Seluruh analisis yang disajikan oleh Semakin Pede ditujukan semata-mata untuk tujuan edukasi dan peningkatan literasi masyarakat.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 text-[11px] text-slate-600">
            <span>© 2026 {settings.projectTitle || "Semakin Pede"}. Komunitas Edukasi Komoditas Berjangka Indonesia.</span>
            <div className="flex items-center gap-3">
              <span>Bukan Entitas Pengelola Investasi Maupun Penghimpun Dana.</span>
              <span>•</span>
              <Link href="/admin" className="text-slate-500 hover:text-gold-400 underline transition-colors">
                Superadmin
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Risk Disclaimer */}
      {activeModal === "disclaimer" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-xl w-full p-6 text-slate-300 relative shadow-2xl">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">Risk Disclaimer (Pemberitahuan Risiko)</h3>
            </div>
            <div className="text-xs leading-relaxed space-y-3 max-h-80 overflow-y-auto pr-2">
              <p>
                1. Perdagangan Berjangka Komoditi (Futures) memiliki tingkat risiko yang tinggi dan memiliki potensi kerugian yang dapat melebihi dana setoran awal Anda jika tidak dikelola dengan benar.
              </p>
              <p>
                2. Semakin Pede adalah wadah edukasi komunitas yang independen dan bukan merupakan pialang berjangka, bukan penasihat investasi, serta tidak menerima atau mengelola dana investasi nasabah.
              </p>
              <p>
                3. Setiap keputusan transaksi perdagangan yang diambil merupakan tanggung jawab pribadi dari masing-masing individu.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-navy-800 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white rounded-lg text-xs font-semibold"
              >
                Saya Memahami
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Privacy Policy */}
      {activeModal === "privacy" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-xl w-full p-6 text-slate-300 relative shadow-2xl">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-gold-400 mb-3">
              <FileText className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">Kebijakan Privasi Data (Privacy Policy)</h3>
            </div>
            <div className="text-xs leading-relaxed space-y-3 max-h-80 overflow-y-auto pr-2">
              <p>
                1. Data nama dan kontak (nomor WhatsApp atau username Telegram) yang Anda masukkan pada formulir di situs ini hanya digunakan untuk mengirimkan undangan grup belajar dan materi edukasi.
              </p>
              <p>
                2. Kami menghormati privasi Anda dan tidak akan pernah menjual, menyewakan, atau mendistribusikan data kontak Anda kepada pihak ketiga mana pun tanpa persetujuan Anda.
              </p>
              <p>
                3. Anda berhak untuk keluar dari saluran komunikasi komunitas atau meminta penghapusan data kontak kapan saja dengan menghubungi admin kami.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-navy-800 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
