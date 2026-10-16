"use client";

import { useState, useRef, useCallback } from "react";
import {
  Send,
  MessageCircle,
  Mail,
  User,
  ChevronDown,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { insertLeadDB } from "@/lib/db";

const WHATSAPP_NUMBER = "628176792110";
const TELEGRAM_USERNAME = "semakinpede";
const EMAIL_ADDRESS = "edukasi@semakinpede.id";

type ContactType = "wa" | "telegram" | "email";
type Level = "Pemula" | "Menengah" | "Lanjutan";

interface LeadFormProps {
  compact?: boolean;
  dark?: boolean;
  source?: string;
}

function saveLead(lead: {
  name: string;
  contactType: ContactType;
  contact: string;
  level: string;
  source: string;
  timestamp: string;
}) {
  const leadId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  try {
    const raw = localStorage.getItem("kfi_leads");
    const leads = raw ? JSON.parse(raw) : [];
    leads.push({ ...lead, id: leadId });
    localStorage.setItem("kfi_leads", JSON.stringify(leads));
  } catch {
    // localStorage unavailable
  }

  // Simpan ke database IndexedDB
  insertLeadDB({ ...lead, id: leadId }).catch(() => {
    // Non-blocking
  });
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;

    setIsSubmitting(true);

    const message = `Halo, saya ${name.trim()} ingin bergabung dengan komunitas edukasi Semakin Pede.\n\nLevel: ${level}\nKontak: ${contact.trim()}\nSumber: ${source}`;

    saveLead({
      name: name.trim(),
      contactType,
      contact: contact.trim(),
      level,
      source,
      timestamp: new Date().toISOString(),
    });

    timeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      if (contactType === "wa") {
        window.open(
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
          "_blank",
          "noopener,noreferrer"
        );
      } else if (contactType === "telegram") {
        window.open(
          `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`,
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        window.location.href = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent("Gabung Komunitas Semakin Pede")}&body=${encodeURIComponent(message)}`;
      }
    }, 400);
  };

  if (isSubmitted) {
    const messageTemplate = `Halo, saya ${name.trim()} ingin bergabung dengan komunitas edukasi Semakin Pede.\n\nLevel: ${level}\nKontak: ${contact.trim()}\nSumber: ${source}`;
    const destinationUrl =
      contactType === "wa"
        ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageTemplate)}`
        : contactType === "telegram"
          ? `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(messageTemplate)}`
          : `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent("Gabung Komunitas Semakin Pede")}&body=${encodeURIComponent(messageTemplate)}`;

    const contactLabel =
      contactType === "wa"
        ? "WhatsApp Resmi"
        : contactType === "telegram"
          ? "Telegram Komunitas"
          : "Email Komunitas";

    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl shadow-navy-950/20 relative overflow-hidden ring-1 ring-slate-900/5 transition-all text-slate-800">
        {/* Top Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        {/* Header Konfirmasi */}
        <div className="mb-5 pb-4 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] uppercase tracking-wider mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pendaftaran Berhasil Dicatat</span>
          </div>
          <h3 className="font-[var(--font-heading)] font-black text-xl sm:text-2xl text-slate-950 tracking-tight leading-snug">
            Selamat Datang, {name}!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
            Data registrasi Anda telah tersimpan rapi di sistem. Silakan selesaikan tahap verifikasi berikut untuk mendapatkan akses ruang diskusi komunitas.
          </p>
        </div>

        {/* Ringkasan Tiket Registrasi */}
        <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Nama Member</span>
            <span className="font-bold text-slate-900">{name}</span>
          </div>
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Jalur Verifikasi</span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              {contactType === "wa" && <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
              {contactType === "telegram" && <Send className="w-3.5 h-3.5 text-sky-600" />}
              {contactType === "email" && <Mail className="w-3.5 h-3.5 text-amber-600" />}
              <span>{contactLabel} ({contact})</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Kategori Materi</span>
            <span className="font-bold text-slate-900">{level}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-slate-500 font-medium">Biaya Keanggotaan</span>
            <span className="text-emerald-800 font-bold bg-emerald-100/90 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
              GRATIS (100% Edukasi)
            </span>
          </div>
        </div>

        {/* Panduan Langkah Selanjutnya */}
        <div className="mb-6 space-y-2">
          <span className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider">
            Langkah Aktivasi Akun:
          </span>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Buka obrolan resmi {contactType === "wa" ? "WhatsApp" : contactType === "telegram" ? "Telegram" : "Email"} melalui tombol utama di bawah.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Kirimkan pesan template pendaftaran yang sudah terisi otomatis.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Admin akan membagikan tautan ruang diskusi dan template jurnal trading.</span>
            </div>
          </div>
        </div>

        {/* Tombol Aksi Utama & Sekunder */}
        <div className="space-y-2.5">
          <a
            href={destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-md hover:shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {contactType === "wa" && <MessageCircle className="w-4 h-4" />}
            {contactType === "telegram" && <Send className="w-4 h-4" />}
            {contactType === "email" && <Mail className="w-4 h-4" />}
            <span>
              {contactType === "wa"
                ? "Buka WhatsApp & Kirim Pesan"
                : contactType === "telegram"
                  ? "Buka Telegram Komunitas"
                  : "Buka Email Pendaftaran"}
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setName("");
              setContact("");
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Daftarkan Kontak Lain / Input Ulang
          </button>
        </div>

        {/* Peringatan Keamanan Edukasi */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-700">Keamanan:</strong> Admin resmi Semakin Pede tidak pernah meminta titip modal, transfer dana, atau kata sandi akun transaksi trading Anda.
          </span>
        </div>
      </div>
    );
  }

  // Tampilan Compact (digunakan di dalam CTA baris horizontal)
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <label htmlFor={`lead-name-${source}`} className="sr-only">
          Nama Lengkap
        </label>
        <input
          id={`lead-name-${source}`}
          type="text"
          placeholder="Nama Lengkap Anda"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 px-4 py-3 rounded-xl bg-navy-950/90 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
        />
        <label htmlFor={`lead-contact-${source}`} className="sr-only">
          Kontak
        </label>
        <input
          id={`lead-contact-${source}`}
          type="text"
          placeholder="No. WhatsApp / @Telegram"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
          className="flex-1 px-4 py-3 rounded-xl bg-navy-950/90 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap disabled:opacity-50 shadow-md"
        >
          {isSubmitting ? "Memproses..." : "Daftar"}
        </button>
      </form>
    );
  }

  // Tampilan Utama (Hero Section Lead Form Modern Anti-Slop)
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl shadow-navy-950/20 relative overflow-hidden ring-1 ring-slate-900/5 transition-all"
    >
      {/* Top Accent Strip */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

      {/* Form Header */}
      <div className="mb-6 pb-4 border-b border-slate-100">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[11px] uppercase tracking-wider mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Akses Komunitas Edukasi 2026</span>
        </div>
        <h3 className="font-[var(--font-heading)] font-black text-xl sm:text-2xl text-slate-950 tracking-tight leading-snug">
          Daftar Akses Anggota
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
          100% gratis tanpa biaya keanggotaan dan tanpa kewajiban deposit dana.
        </p>
      </div>

      <div className="space-y-4">
        {/* Field 1: Nama Lengkap */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={`lead-name-full-${source}`}
              className="block text-xs font-bold text-slate-950 uppercase tracking-wider"
            >
              Nama Lengkap
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
              Wajib
            </span>
          </div>
          <div className="relative rounded-xl border-2 border-slate-200 hover:border-slate-300 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all bg-slate-50/60 focus-within:bg-white overflow-hidden">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 pointer-events-none" />
            <input
              id={`lead-name-full-${source}`}
              type="text"
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-950 font-bold text-sm placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
            />
          </div>
        </div>

        {/* Field 2: Kanal Komunikasi Pilihan */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="block text-xs font-bold text-slate-950 uppercase tracking-wider">
              Kanal Komunikasi Pilihan
            </span>
            <span className="text-[10px] font-semibold text-slate-500">
              Pilih 1 Opsi
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipe kontak">
            {[
              { type: "wa" as ContactType, label: "WhatsApp", icon: MessageCircle, activeColor: "text-emerald-400" },
              { type: "telegram" as ContactType, label: "Telegram", icon: Send, activeColor: "text-sky-400" },
              { type: "email" as ContactType, label: "Email", icon: Mail, activeColor: "text-amber-300" },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = contactType === opt.type;
              return (
                <button
                  key={opt.type}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setContactType(opt.type)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all border-2 ${
                    isSelected
                      ? "bg-slate-950 text-white border-slate-950 shadow-sm ring-1 ring-amber-400/40"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? opt.activeColor : "text-slate-600"}`} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Field 3: Kontak (Nomor WA / Username / Email) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={`lead-contact-full-${source}`}
              className="block text-xs font-bold text-slate-950 uppercase tracking-wider"
            >
              {contactType === "wa"
                ? "Nomor WhatsApp Aktif"
                : contactType === "telegram"
                  ? "Username Telegram"
                  : "Alamat Email Utama"}
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
              Wajib
            </span>
          </div>
          <div className="relative rounded-xl border-2 border-slate-200 hover:border-slate-300 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all bg-slate-50/60 focus-within:bg-white overflow-hidden">
            {contactType === "wa" ? (
              <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700 pointer-events-none" />
            ) : contactType === "telegram" ? (
              <Send className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-700 pointer-events-none" />
            ) : (
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 pointer-events-none" />
            )}
            <input
              id={`lead-contact-full-${source}`}
              type={contactType === "email" ? "email" : "text"}
              placeholder={
                contactType === "wa"
                  ? "Contoh: 08123456789"
                  : contactType === "telegram"
                    ? "@username_anda"
                    : "nama@email.com"
              }
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-950 font-bold text-sm placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
            />
          </div>
        </div>

        {/* Field 4: Tingkat Pengalaman */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={`lead-level-${source}`}
              className="block text-xs font-bold text-slate-950 uppercase tracking-wider"
            >
              Tingkat Pengalaman Trading
            </label>
            <span className="text-[10px] font-semibold text-slate-500">
              Materi Terarah
            </span>
          </div>
          <div className="relative rounded-xl border-2 border-slate-200 hover:border-slate-300 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all bg-slate-50/60 focus-within:bg-white overflow-hidden">
            <select
              id={`lead-level-${source}`}
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
              className="w-full pl-3.5 pr-10 py-3 bg-transparent text-slate-950 font-bold text-xs sm:text-sm appearance-none cursor-pointer focus:outline-none"
            >
              <option value="Pemula">Pemula (Baru ingin memahami komoditas berjangka)</option>
              <option value="Menengah">Menengah (Sudah memahami dasar analisis teknikal)</option>
              <option value="Lanjutan">Lanjutan (Aktif trading dan ingin evaluasi jurnal)</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tombol Aksi Utama */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Memproses Data...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Dapatkan Undangan Komunitas</span>
              <ArrowRight className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>

      {/* Jaminan Privasi Anti-Spam */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-600 font-medium">
        <Lock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span>Jaminan Privasi: Data aman &amp; hanya untuk pengiriman materi edukasi.</span>
      </div>
    </form>
  );
}
