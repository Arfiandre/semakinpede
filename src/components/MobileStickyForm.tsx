"use client";

import { useState, useEffect } from "react";
import { MessageCircle, ArrowUp } from "lucide-react";

export default function MobileStickyForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero
      setIsVisible(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !wa.trim()) return;

    const message = `Halo, saya ${name} ingin bergabung komunitas Semakin Pede via mobile.`;
    window.open(
      `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="absolute -top-10 right-4 w-10 h-10 bg-navy-900 hover:bg-navy-800 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
        aria-label="Kembali ke atas"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* Form Bar */}
      <div className="bg-navy-900/95 backdrop-blur-md border-t border-gold-400/20 p-3 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-1/3 px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-xs focus:border-gold-400 transition-colors"
          />
          <input
            type="tel"
            placeholder="No. WA"
            value={wa}
            onChange={(e) => setWa(e.target.value)}
            required
            className="flex-1 px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-xs focus:border-gold-400 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-gold-400 hover:bg-gold-300 text-navy-900 font-bold rounded-lg transition-all text-xs whitespace-nowrap flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            Gabung
          </button>
        </form>
      </div>
    </div>
  );
}
