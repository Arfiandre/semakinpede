"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  ExternalLink,
  MessageCircle,
  Send,
  Globe,
  FileText,
  Trash2,
  TrendingUp,
  Sliders,
  AlertCircle,
} from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/icons/SocialIcons";
import { SiteSettings } from "@/types/settings";
import {
  getSiteSettings,
  saveSiteSettings,
  resetSiteSettings,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/siteSettingsStorage";

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(getSiteSettings());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("File yang diunggah harus berupa gambar (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Ukuran logo maksimal 2 MB agar website memuat cepat.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSettings((prev) => ({ ...prev, logoUrl: result }));
        setErrorMessage("");
        showToast("Logo komunitas berhasil diunggah.");
      }
    };
    reader.onerror = () => {
      setErrorMessage("Gagal membaca file gambar.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setSettings((prev) => ({ ...prev, logoUrl: "" }));
    showToast("Logo kustom dihapus, kembali ke logo default.");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!settings.projectTitle.trim()) {
      setErrorMessage("Title project tidak boleh kosong.");
      return;
    }

    if (!settings.projectDescription.trim()) {
      setErrorMessage("Keterangan project tidak boleh kosong.");
      return;
    }

    saveSiteSettings(settings);
    setErrorMessage("");
    showToast("Pengaturan landing page berhasil disimpan dan diperbarui.");
  };

  const handleReset = () => {
    if (
      confirm(
        "Kembalikan pengaturan logo, title, keterangan, dan media sosial ke nilai default bawaan?"
      )
    ) {
      const def = resetSiteSettings();
      setSettings(def);
      showToast("Pengaturan telah dikembalikan ke default.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              <h2 className="font-[var(--font-heading)] font-bold text-lg text-slate-900">
                Pengaturan Tampilan Landing Page
              </h2>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Atur logo komunitas, title project, keterangan profil komunitas, dan link tombol media sosial yang ditampilkan di seluruh website.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/semakinpede/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
              Lihat di Website
            </a>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset Default
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-8">
          {/* BAGIAN 1: UPLOAD LOGO KOMUNITAS */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                1. Logo Komunitas (Ditampilkan pada Website)
              </label>
              <p className="text-slate-500 text-xs mt-0.5">
                Logo ini akan otomatis menggantikan icon bawaan di bilah navigasi (Navbar), Footer, dan Panel Admin.
              </p>
            </div>

            <div className="grid md:grid-cols-12 gap-6 items-center">
              {/* Preview Box */}
              <div className="md:col-span-5 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pratinjau Logo di Navbar Gelap:
                </span>
                <div className="p-4 bg-navy-950 rounded-xl border border-navy-800 flex items-center gap-3">
                  {settings.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settings.logoUrl}
                      alt="Logo Komunitas"
                      className="w-10 h-10 object-contain rounded-lg bg-white/5 p-0.5"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gold-400 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-navy-950" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-white font-[var(--font-heading)] font-extrabold text-sm leading-tight tracking-tight">
                      {settings.projectTitle || "SEMAKIN"}
                    </span>
                    <span className="text-gold-400 font-[var(--font-heading)] font-bold text-[10px] leading-tight tracking-widest">
                      {settings.projectTagline ? settings.projectTagline.split(" ")[0].toUpperCase() : "PEDE"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  {settings.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settings.logoUrl}
                      alt="Logo Komunitas"
                      className="w-8 h-8 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-navy-950 text-gold-400 rounded-lg flex items-center justify-center font-bold text-xs">
                      SP
                    </div>
                  )}
                  <span className="text-xs text-slate-600 font-medium">
                    {settings.logoUrl ? "Logo Kustom Aktif" : "Logo Bawaan Standar"}
                  </span>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="md:col-span-7 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <Upload className="w-4 h-4 text-gold-400" />
                    Upload Logo Baru
                  </button>

                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Logo Kustom
                    </button>
                  )}
                </div>

                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Atau Masukkan Tautan URL Logo:
                  </label>
                  <input
                    type="url"
                    placeholder="https://domain.com/logo-komunitas.png"
                    value={settings.logoUrl.startsWith("data:") ? "" : settings.logoUrl}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, logoUrl: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Format disarankan: PNG transparan atau SVG dengan dimensi persegi (contoh: 512x512 px).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BAGIAN 2: TITLE & TAGLINE PROJECT */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                2. Title Project <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Semakin Pede"
                value={settings.projectTitle}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, projectTitle: e.target.value }))
                }
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Nama utama merek/komunitas yang muncul di navbar, footer, dan tab browser.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Tagline / Sub-Judul Project
              </label>
              <input
                type="text"
                placeholder="Contoh: Komunitas Trader Futures Indonesia"
                value={settings.projectTagline}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, projectTagline: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Kalimat pendek identitas komunitas di bawah logo utama.
              </span>
            </div>
          </div>

          {/* BAGIAN 3: KETERANGAN PROJECT */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              3. Keterangan Project <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Jelaskan visi, misi, dan nilai utama komunitas edukasi trading berjangka Anda..."
              value={settings.projectDescription}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  projectDescription: e.target.value,
                }))
              }
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Teks profil dan keterangan resmi yang ditampilkan pada bagian footer, pengenalan komunitas, dan meta deskripsi situs.
            </span>
          </div>

          {/* BAGIAN 4: BUTTON MEDIA SOSIAL */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-600" />
                4. Button Media Sosial
              </label>
              <p className="text-slate-500 text-xs mt-0.5">
                Tautan resmi komunitas yang terhubung langsung pada tombol sosial di Footer, section Komunitas, dan tombol WhatsApp mengambang.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* WhatsApp */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp (Nomor / Link Chat)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://wa.me/628176792110"
                  value={settings.socialMedia.whatsapp}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialMedia: {
                        ...prev.socialMedia,
                        whatsapp: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              {/* Telegram */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-sky-600" />
                  <span>Telegram (Channel / Grup)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://t.me/semakinpede"
                  value={settings.socialMedia.telegram}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialMedia: {
                        ...prev.socialMedia,
                        telegram: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                  <span>Instagram Profile</span>
                </label>
                <input
                  type="text"
                  placeholder="https://instagram.com/semakinpede"
                  value={settings.socialMedia.instagram}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialMedia: {
                        ...prev.socialMedia,
                        instagram: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              {/* YouTube */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <YoutubeIcon className="w-3.5 h-3.5 text-rose-600" />
                  <span>YouTube Channel</span>
                </label>
                <input
                  type="text"
                  placeholder="https://youtube.com/@semakinpede"
                  value={settings.socialMedia.youtube}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialMedia: {
                        ...prev.socialMedia,
                        youtube: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Kembalikan Default
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
            >
              Simpan Pengaturan Landing Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
