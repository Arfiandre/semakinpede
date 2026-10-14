"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { getSiteSettings } from "@/lib/siteSettingsStorage";

const DEFAULT_WA_URL =
  "https://wa.me/6281211119999?text=Halo%20Admin%20Semakin%20Pede,%20saya%20ingin%20tahu%20lebih%20lanjut%20tentang%20komunitas%20dan%20edukasi%20komoditas";

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [waUrl, setWaUrl] = useState(DEFAULT_WA_URL);

  useEffect(() => {
    const updateLink = () => {
      const s = getSiteSettings();
      if (s.socialMedia?.whatsapp) {
        setWaUrl(s.socialMedia.whatsapp);
      } else {
        setWaUrl(DEFAULT_WA_URL);
      }
    };
    updateLink();

    window.addEventListener("kfi_settings_updated", updateLink);
    window.addEventListener("storage", updateLink);
    return () => {
      window.removeEventListener("kfi_settings_updated", updateLink);
      window.removeEventListener("storage", updateLink);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Show tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showTooltip) setShowTooltip(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [showTooltip]);

  // Auto-hide tooltip after 8 seconds
  useEffect(() => {
    if (!showTooltip) return;
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, [showTooltip]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-16 right-4 lg:bottom-8 lg:right-6 z-40">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-3 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600"
            aria-label="Tutup"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-slate-900 text-xs font-bold mb-1">
            Butuh Bantuan atau Tanya Komunitas?
          </p>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Hubungi admin resmi untuk konsultasi seputar jadwal webinar, kurikulum komoditas, atau pembukaan akun pialang BAPPEBTI.
          </p>
        </div>
      )}

      {/* Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
        aria-label="Konsultasi WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}
