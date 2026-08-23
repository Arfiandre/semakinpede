"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

const WHATSAPP_NUMBER = "6281234567890"; // Ganti dengan nomor WA admin

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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
    <div className="fixed bottom-20 right-4 lg:bottom-8 lg:right-6 z-40">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-navy-900 text-sm font-semibold mb-1">
            Butuh bantuan?
          </p>
          <p className="text-gray-500 text-xs leading-relaxed">
            Chat langsung admin untuk tanya seputar komunitas, broker, atau
            edukasi.
          </p>
        </div>
      )}

      {/* Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Halo,%20saya%20ingin%20tahu%20lebih%20lanjut%20tentang%20komunitas%20Semakin%20Pede`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-400 text-white rounded-full shadow-lg shadow-green-500/30 transition-all hover:scale-110 active:scale-95"
        aria-label="Chat WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
}
