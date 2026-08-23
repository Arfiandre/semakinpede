"use client";

import { useState } from "react";
import { Send, MessageCircle, Mail, User, ChevronDown } from "lucide-react";

const WHATSAPP_NUMBER = "6281234567890"; // Ganti dengan nomor WA admin
const TELEGRAM_USERNAME = "@semakinpede"; // Ganti dengan username Telegram
const EMAIL_ADDRESS = "info@semakinpede.id"; // Ganti dengan email

type ContactType = "wa" | "telegram" | "email";
type Level = "Pemula" | "Menengah" | "Lanjutan";

interface LeadFormProps {
  compact?: boolean;
  dark?: boolean;
  source?: string;
}

export default function LeadForm({
  compact = false,
  dark = false,
  source = "hero",
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [contactType, setContactType] = useState<ContactType>("wa");
  const [contact, setContact] = useState("");
  const [level, setLevel] = useState<Level>("Pemula");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;

    setIsSubmitting(true);

    const message = `Halo, saya ${name} ingin bergabung komunitas Semakin Pede.\n\nLevel: ${level}\nKontak: ${contact}\nSumber: ${source}`;

    // Simpan ke localStorage untuk tracking
    const lead = {
      name,
      contactType,
      contact,
      level,
      source,
      timestamp: new Date().toISOString(),
    };
    const leads = JSON.parse(localStorage.getItem("kfi_leads") || "[]");
    leads.push(lead);
    localStorage.setItem("kfi_leads", JSON.stringify(leads));

    // Redirect ke platform yang dipilih
    setTimeout(() => {
      if (contactType === "wa") {
        window.open(
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
          "_blank"
        );
      } else if (contactType === "telegram") {
        window.open(
          `https://t.me/${TELEGRAM_USERNAME.replace("@", "")}?text=${encodeURIComponent(message)}`,
          "_blank"
        );
      } else {
        window.open(
          `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent("Gabung Semakin Pede")}&body=${encodeURIComponent(message)}`,
          "_self"
        );
      }
      setIsSubmitting(false);
    }, 300);
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Nama kamu..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:border-gold-400 transition-colors"
        />
        <input
          type="text"
          placeholder="No. WA / Telegram"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
          className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:border-gold-400 transition-colors"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-navy-900 font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 text-sm whitespace-nowrap disabled:opacity-50"
        >
          {isSubmitting ? "Mengirim..." : "KIRIM"}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl p-6 md:p-8 shadow-2xl ${
        dark
          ? "bg-navy-800/80 backdrop-blur-sm border border-white/10"
          : "bg-white border border-gray-100"
      }`}
    >
      <h3 className="font-[var(--font-heading)] font-bold text-lg text-navy-900 mb-4">
        🎯 Gabung Grup Gratis
      </h3>

      {/* Nama */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Nama Lengkap
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Masukkan nama kamu"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-navy-900 placeholder-gray-400 text-sm transition-colors"
          />
        </div>
      </div>

      {/* Contact Type */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Kontak via
        </label>
        <div className="flex gap-2">
          {[
            { type: "wa" as ContactType, label: "WA", icon: "💬" },
            { type: "telegram" as ContactType, label: "Telegram", icon: "✈️" },
            { type: "email" as ContactType, label: "Email", icon: "📧" },
          ].map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => setContactType(opt.type)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                contactType === opt.type
                  ? "bg-navy-900 text-gold-400 border-navy-900"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {contactType === "wa"
            ? "Nomor WhatsApp"
            : contactType === "telegram"
              ? "Username Telegram"
              : "Alamat Email"}
        </label>
        <div className="relative">
          {contactType === "wa" ? (
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          ) : contactType === "telegram" ? (
            <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          ) : (
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          )}
          <input
            type={contactType === "email" ? "email" : "tel"}
            placeholder={
              contactType === "wa"
                ? "08xxxxxxxxxx"
                : contactType === "telegram"
                  ? "@username"
                  : "email@domain.com"
            }
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-navy-900 placeholder-gray-400 text-sm transition-colors"
          />
        </div>
      </div>

      {/* Level */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Level Trading Kamu
        </label>
        <div className="relative">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as Level)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-navy-900 text-sm appearance-none transition-colors"
          >
            <option value="Pemula">🟢 Pemula - Baru mulai</option>
            <option value="Menengah">🟡 Menengah - Sudah tahu dasar</option>
            <option value="Lanjutan">🔴 Lanjutan - Sudah trading aktif</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 bg-gold-400 hover:bg-gold-300 text-navy-900 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm disabled:opacity-50 pulse-cta"
      >
        {isSubmitting ? "Mengarahkan..." : "🚀 GABUNG GRUP GRATIS"}
      </button>

      {/* Disclaimer */}
      <p className="text-[11px] text-gray-400 text-center mt-3">
        🔒 Data aman. No spam. Kapanpun bisa unsubscribe.
      </p>
    </form>
  );
}
