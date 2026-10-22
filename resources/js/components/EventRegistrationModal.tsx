"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  MessageCircle,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  ArrowLeft,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { EventItem } from "@/types/event";
import { getSiteSettings } from "@/lib/siteSettingsStorage";
import { insertLeadDB, DBLead } from "@/lib/db";

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
}

type ModalStep =
  | "step1_initial"
  | "step1_not_registered_modal"
  | "step2_trading_account"
  | "step3_final_success";

export default function EventRegistrationModal({
  isOpen,
  onClose,
  event,
}: EventRegistrationModalProps) {
  // Step State
  const [currentStep, setCurrentStep] = useState<ModalStep>("step1_initial");

  // Step 1 Form Data
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hasAccount, setHasAccount] = useState<"sudah" | "belum">("belum");

  // Step 2 Form Data
  const [demoAccountNumber, setDemoAccountNumber] = useState("");
  const [demoInvestorPassword, setDemoInvestorPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // File Uploads
  const [screenshotRealAccount, setScreenshotRealAccount] = useState<string>("");
  const [screenshotRealName, setScreenshotRealName] = useState<string>("");
  const [screenshotTransfer, setScreenshotTransfer] = useState<string>("");
  const [screenshotTransferName, setScreenshotTransferName] = useState<string>("");

  // Validation & Loading
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState<string>("");

  // Refs for hidden file inputs
  const realAccountInputRef = useRef<HTMLInputElement>(null);
  const transferInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens or event changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep("step1_initial");
      setErrorMessage("");
      setIsSubmitting(false);
      setCurrentLeadId("");
    }
  }, [isOpen, event]);

  // Keyboard Escape navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const siteSettings = getSiteSettings();
  const rawWa = siteSettings?.socialMedia?.whatsapp || "https://wa.me/628176792110";
  const adminWaUrl = rawWa.startsWith("http") ? rawWa : `https://wa.me/${rawWa.replace(/[^0-9]/g, "")}`;

  const whatsappGroupLink =
    "https://chat.whatsapp.com/Eus8VPcBtyg3GKxhezvtuD?s=sh&p=a&mlu=4&ilr=4";

  const tutorialLink =
    event.tutorialAccountUrl?.trim() ||
    "https://drive.google.com/file/d/1kBVRqc8q6XcvHSdqVweg_Fc64Z_u79FV/view?usp=sharing";

  // File Upload Handlers (converts image to Base64)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "real_account" | "transfer"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("File bukti harus berformat gambar (PNG, JPG, JPEG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran gambar maksimal 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (eventReader) => {
      const base64 = eventReader.target?.result as string;
      if (target === "real_account") {
        setScreenshotRealAccount(base64);
        setScreenshotRealName(file.name);
      } else {
        setScreenshotTransfer(base64);
        setScreenshotTransferName(file.name);
      }
      setErrorMessage("");
    };
    reader.readAsDataURL(file);
  };

  // Submit Step 1
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage("Nomor telepon/WhatsApp aktif wajib diisi.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Format email tidak valid.");
      return;
    }

    setIsSubmitting(true);

    try {
      const activeLeadId = currentLeadId || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setCurrentLeadId(activeLeadId);

      // Simpan lead awal ke IndexedDB & sinkronisasi ke server (menggunakan ID yang konsisten)
      const leadInitial: DBLead = {
        id: activeLeadId,
        name: name.trim(),
        contactType: "wa",
        contact: cleanPhone,
        level: "Peserta Event",
        source: "event_registration_step1",
        timestamp: new Date().toISOString(),
        notes: `Pendaftaran event: "${event.title}". Sudah punya akun: ${hasAccount}`,
        eventId: event.id,
        eventTitle: event.title,
        hasAccount,
      };
      await insertLeadDB(leadInitial);

      if (hasAccount === "belum") {
        // Muncul modal notifikasi registrasi berhasil + link tutorial & link submit akun
        setCurrentStep("step1_not_registered_modal");
      } else {
        // Langsung direct ke form submit akun trading
        setCurrentStep("step2_trading_account");
      }
    } catch {
      setErrorMessage("Terjadi kendala saat menyimpan pendaftaran. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Step 2
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");

    if (!screenshotRealAccount) {
      setErrorMessage("Screenshot request submitted real account wajib diunggah.");
      return;
    }

    if (!screenshotTransfer) {
      setErrorMessage("Screenshot bukti transfer wajib diunggah.");
      return;
    }

    const cleanedDemoAcc = demoAccountNumber.replace(/\D/g, "");
    if (!cleanedDemoAcc) {
      setErrorMessage("Nomor account demo wajib diisi.");
      return;
    }

    if (cleanedDemoAcc.length !== 6) {
      setErrorMessage("Nomor account demo harus terdiri dari tepat 6 digit angka.");
      return;
    }

    if (!demoInvestorPassword.trim()) {
      setErrorMessage("Investor password demo account wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Gunakan leadId yang sama dari Step 1 agar memperbarui record (bukan membuat duplikat baru)
      const activeLeadId = currentLeadId || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const leadFull: DBLead = {
        id: activeLeadId,
        name: name.trim() || "Peserta Event",
        contactType: "wa",
        contact: phone.replace(/[^0-9+]/g, "") || "0812xxxx",
        level: "Verifikasi Akun Event Selesai",
        source: "event_trading_account_submitted",
        timestamp: new Date().toISOString(),
        notes: `Verifikasi Akun Trading untuk event "${event.title}". Akun Demo: ${cleanedDemoAcc}`,
        eventId: event.id,
        eventTitle: event.title,
        hasAccount: "sudah",
        demoAccountNumber: cleanedDemoAcc,
        demoInvestorPassword: demoInvestorPassword.trim(),
        screenshotRealAccount,
        screenshotTransfer,
      };

      await insertLeadDB(leadFull);
      setCurrentStep("step3_final_success");
    } catch {
      setErrorMessage("Terjadi kendala saat menyimpan data verifikasi. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                {event.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {event.date}
              </span>
            </div>
            <h3 className="font-[var(--font-heading)] font-extrabold text-base sm:text-lg text-white leading-snug line-clamp-1">
              {event.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            aria-label="Tutup formulir pendaftaran"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-900">
          {/* STEP 1: FORM PENDAFTARAN AWAL */}
          {currentStep === "step1_initial" && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
                  Langkah 1 dari 2
                </span>
                <h4 className="text-lg font-bold text-slate-950 font-[var(--font-heading)]">
                  Formulir Pendaftaran Agenda
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Lengkapi data identitas Anda untuk mengamankan kursi dan mendapatkan koordinasi acara.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Field 1: Nama */}
              <div>
                <label htmlFor="reg-name" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Nama Lengkap <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="Contoh: Budi Prasetyo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-950 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 2: Nomor Telepon */}
              <div>
                <label htmlFor="reg-phone" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Nomor Telepon / WhatsApp <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-950 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 3: Email */}
              <div>
                <label htmlFor="reg-email" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Alamat Email <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="Contoh: budi@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-950 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 4: Sudah Punya Akun? */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Sudah Punya Akun Trading? <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border-2 flex flex-col items-start gap-1 cursor-pointer transition-all ${
                      hasAccount === "sudah"
                        ? "border-amber-500 bg-amber-50/60 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="radio"
                        name="hasAccount"
                        value="sudah"
                        checked={hasAccount === "sudah"}
                        onChange={() => setHasAccount("sudah")}
                        className="accent-amber-600 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-900">Sudah Punya</span>
                    </div>
                    <span className="text-[11px] text-slate-600 pl-5">
                      Siap submit verifikasi akun
                    </span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border-2 flex flex-col items-start gap-1 cursor-pointer transition-all ${
                      hasAccount === "belum"
                        ? "border-amber-500 bg-amber-50/60 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="radio"
                        name="hasAccount"
                        value="belum"
                        checked={hasAccount === "belum"}
                        onChange={() => setHasAccount("belum")}
                        className="accent-amber-600 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-900">Belum Punya</span>
                    </div>
                    <span className="text-[11px] text-slate-600 pl-5">
                      Perlu panduan pembuatan akun baru
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan Pendaftaran...</span>
                    </>
                  ) : (
                    <>
                      <span>Lanjutkan Pendaftaran</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 1-A: MODAL NOTIFIKASI REGISTRASI BERHASIL (JIKA BELUM PUNYA AKUN) */}
          {currentStep === "step1_not_registered_modal" && (
            <div className="space-y-5 text-center sm:text-left">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-950">
                    Registrasi Awal Berhasil Terkirim!
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Terima kasih <strong>{name}</strong>, formulir RSVP agenda <strong>{event.title}</strong> telah tersimpan di sistem kami.
                  </p>
                </div>
              </div>

              {/* Kotak Kontak Admin */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Layanan Bantuan & Kontak Admin
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jika mengalami kesulitan dalam proses pendaftaran atau membutuhkan asistensi mentor, silakan hubungi tim admin kami secara langsung.
                </p>
                <div className="mt-2.5">
                  <a
                    href={`${adminWaUrl}?text=${encodeURIComponent(
                      `Halo Admin Semakin Pede, saya ${name} baru saja registrasi untuk agenda "${event.title}". Mohon bantuan panduan akun trading.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat Admin WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Langkah Berikutnya: Pendaftaran Akun Trading */}
              <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-200 text-left space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    Tahap Selanjutnya
                  </span>
                  <h5 className="text-sm font-bold text-slate-950 mt-0.5">
                    Pendaftaran Akun Trading Resmi
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1">
                    Untuk dapat mengikuti agenda kompetisi atau webinar live trading, Anda wajib memiliki akun trading resmi. Silakan ikuti tutorial atau lanjut ke formulir submit akun jika sudah membuat.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Link 1: Tutorial Pembuatan Akun Trading */}
                  <a
                    href={tutorialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs font-bold transition-all"
                  >
                    <span>1. Tutorial Pembuatan Akun</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>

                  {/* Link 2: Submit Akun Trading */}
                  <button
                    type="button"
                    onClick={() => setCurrentStep("step2_trading_account")}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-sm cursor-pointer"
                  >
                    <span>2. Lanjut Submit Akun Trading</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FORM SUBMIT AKUN TRADING */}
          {currentStep === "step2_trading_account" && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                    Langkah 2 dari 2
                  </span>
                  <h4 className="text-lg font-bold text-slate-950 font-[var(--font-heading)]">
                    Submit Data Akun Trading
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep("step1_initial")}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Upload 1: Screenshot request submitted real account */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Screenshot Request Submitted Real Account <span className="text-rose-600">*</span>
                </label>
                <input
                  ref={realAccountInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "real_account")}
                  className="hidden"
                />
                {screenshotRealAccount ? (
                  <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={screenshotRealAccount}
                        alt="Preview Real Account"
                        className="w-12 h-12 object-cover rounded-lg border border-emerald-200 flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-emerald-950 block truncate">
                          {screenshotRealName}
                        </span>
                        <span className="text-[10px] text-emerald-700">Gambar berhasil diunggah</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotRealAccount("");
                        setScreenshotRealName("");
                      }}
                      className="px-2.5 py-1 text-xs text-rose-700 hover:text-rose-900 font-semibold hover:bg-rose-100 rounded-lg cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => realAccountInputRef.current?.click()}
                    className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/30 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">
                      Pilih Tangkapan Layar Pengajuan Real Account
                    </span>
                    <span className="text-[10px] text-slate-500">Maksimal 5 MB (PNG, JPG)</span>
                  </button>
                )}
              </div>

              {/* Upload 2: Screenshot bukti transfer */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Screenshot Bukti Transfer <span className="text-rose-600">*</span>
                </label>
                <input
                  ref={transferInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "transfer")}
                  className="hidden"
                />
                {screenshotTransfer ? (
                  <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={screenshotTransfer}
                        alt="Preview Bukti Transfer"
                        className="w-12 h-12 object-cover rounded-lg border border-emerald-200 flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-emerald-950 block truncate">
                          {screenshotTransferName}
                        </span>
                        <span className="text-[10px] text-emerald-700">Gambar berhasil diunggah</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotTransfer("");
                        setScreenshotTransferName("");
                      }}
                      className="px-2.5 py-1 text-xs text-rose-700 hover:text-rose-900 font-semibold hover:bg-rose-100 rounded-lg cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => transferInputRef.current?.click()}
                    className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/30 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">
                      Pilih Tangkapan Layar Bukti Transfer / Setoran
                    </span>
                    <span className="text-[10px] text-slate-500">Maksimal 5 MB (PNG, JPG)</span>
                  </button>
                )}
              </div>

              {/* Field 3: Nomor account demo (wajib 6 digit angka) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="reg-demo-acc" className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Nomor Account Demo <span className="text-rose-600">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      demoAccountNumber.length === 6 ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {demoAccountNumber.length}/6 digit
                  </span>
                </div>
                <input
                  id="reg-demo-acc"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  placeholder="Contoh: 123456"
                  value={demoAccountNumber}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setDemoAccountNumber(onlyDigits);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-950 text-sm font-mono font-bold tracking-wider focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Nomor account demo kompetisi harus terdiri dari tepat 6 digit angka.
                </p>
              </div>

              {/* Field 4: Investor password demo account */}
              <div>
                <label htmlFor="reg-demo-pwd" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Investor Password Demo Account <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="reg-demo-pwd"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Masukkan password investor read-only"
                    value={demoInvestorPassword}
                    onChange={(e) => setDemoInvestorPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-950 text-sm font-mono font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Password investor hanya memiliki hak baca (read-only) untuk evaluasi performa kompetisi.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-extrabold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{isSubmitting ? "Menyimpan Data..." : "Kirim Verifikasi Akun Trading"}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: MODAL NOTIFIKASI REGISTRASI BERHASIL & LINK WHATSAPP */}
          {currentStep === "step3_final_success" && (
            <div className="space-y-5 text-center sm:text-left py-2">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-emerald-950">
                    Registrasi Berhasil & Data Terverifikasi!
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Selamat, <strong>{name}</strong>! Pendaftaran Anda untuk agenda <strong>{event.title}</strong> beserta rincian akun demo dan dokumen verifikasi telah berhasil disimpan ke basis data komunitas.
                  </p>
                </div>
              </div>

              {/* Kartu Khusus Link Grup WhatsApp */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-sky-900 to-slate-900 text-white border border-sky-800/80 shadow-md space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">
                      Grup WhatsApp Peserta Event
                    </h5>
                    <span className="text-[11px] text-sky-200">
                      Ruang Koordinasi & Saluran Materi
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Bergabung ke grup WhatsApp peserta untuk mengikuti koordinasi acara.
                </p>

                <div className="pt-1">
                  <a
                    href={whatsappGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-md hover:shadow-sky-500/25"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Gabung Grup WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5 text-sky-100" />
                  </a>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Selesai & Tutup Jendela
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
