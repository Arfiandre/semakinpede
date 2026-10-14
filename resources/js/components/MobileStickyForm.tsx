"use client";

import { useState, useEffect } from "react";
import { MessageCircle, ArrowUp } from "lucide-react";
import { getSiteSettings } from "@/lib/siteSettingsStorage";

export default function MobileStickyForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.4);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;

    const message = `Halo Admin Semakin Pede, saya ${name.trim()} (${contact.trim()}) ingin bergabung ke grup komunitas via mobile sticky bar.`;
    const settings = getSiteSettings();
    const baseWa = settings.socialMedia?.whatsapp || "https://wa.me/6281211119999";
    const waUrl = baseWa.includes("?") 
      ? `${baseWa}&text=${encodeURIComponent(message)}`
      : `${baseWa}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="absolute -top-11 right-4 w-9 h-9 bg-navy-950 hover:bg-navy-900 text-white rounded-lg flex items-center justify-center shadow-lg border border-navy-800 transition-colors"
        aria-label="Kembali ke atas"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {/* Form Bar */}
      <div className="bg-navy-950/95 backdrop-blur-md border-t border-navy-800 p-2.5 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-1/3 px-3 py-2 rounded-lg bg-navy-900 border border-navy-700 text-white placeholder-slate-400 text-xs focus:border-gold-400 transition-colors"
          />
          <input
            type="text"
            placeholder="No. WhatsApp"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="flex-1 px-3 py-2 rounded-lg bg-navy-900 border border-navy-700 text-white placeholder-slate-400 text-xs focus:border-gold-400 transition-colors"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-gold-400 hover:bg-gold-300 text-navy-950 font-bold rounded-lg transition-all text-xs whitespace-nowrap flex items-center gap-1 shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Gabung
          </button>
        </form>
      </div>
    </div>
  );
}
