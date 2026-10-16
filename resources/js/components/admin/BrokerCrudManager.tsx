"use client";

import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  Star,
  ExternalLink,
  RotateCcw,
  Download,
  Check,
  X,
  Upload,
  MessageCircle,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Award,
} from "lucide-react";
import { BrokerItem } from "@/types/broker";
import {
  getStoredBrokers,
  saveStoredBrokers,
  addBroker,
  updateBroker,
  deleteBroker,
  resetBrokers,
  DEFAULT_BROKERS,
  BROKER_UPDATE_EVENT,
} from "@/lib/brokerStorage";

const HIGHLIGHT_SUGGESTIONS = [
  "Rekening Terpisah (Segregated Account) di Bank Nasional Terdaftar",
  "Penjaminan Transaksi via Kliring Berjangka Indonesia (KBI) & ICH",
  "Anggota Resmi Bursa Berjangka Jakarta (JFX) & ICDX",
  "Pilihan Platform Transaksi: MetaTrader 4 & MetaTrader 5",
  "Dukungan Customer Support 24/5 Berbahasa Indonesia",
  "Spread Rendah & Eksekusi Pasar Real-Time Tanpa Requote",
  "Layanan Edukasi & Akun Demo Gratis untuk Pemula",
];

export default function BrokerCrudManager() {
  const [brokers, setBrokers] = useState<BrokerItem[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<BrokerItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    logoUrl: "",
    licenseNumber: "",
    statusBadge: "Mitra Utama Resmi",
    tagline: "",
    description: "",
    highlights: [""] as string[],
    actionText: "Konsultasi Pendaftaran",
    actionUrl: "",
    officialSiteUrl: "https://bappebti.go.id",
    isFeatured: false,
    order: 1,
  });

  const [formError, setFormError] = useState("");

  const refreshBrokers = () => {
    setBrokers(getStoredBrokers());
  };

  useEffect(() => {
    refreshBrokers();

    const handleUpdate = () => {
      setBrokers(getStoredBrokers());
    };

    window.addEventListener(BROKER_UPDATE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(BROKER_UPDATE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingBroker(null);
    setFormData({
      name: "",
      shortName: "",
      logoUrl: "",
      licenseNumber: "No. 407/BAPPEBTI/SI/VII/2004",
      statusBadge: "Pialang Terdaftar Resmi",
      tagline: "Pialang Berjangka Terdaftar & Diawasi Resmi BAPPEBTI",
      description: "",
      highlights: [
        "Izin Usaha Pialang Berjangka Resmi BAPPEBTI",
        "Rekening Terpisah (Segregated Account) di Bank Nasional",
        "Penjaminan Transaksi Kliring KBI / ICH",
      ],
      actionText: "Konsultasi Pendaftaran",
      actionUrl: "https://wa.me/628176792110?text=Halo%20Admin%20Semakin%20Pede,%20saya%20ingin%20konsultasi%20pendaftaran%20pialang%20resmi",
      officialSiteUrl: "https://bappebti.go.id",
      isFeatured: false,
      order: brokers.length + 1,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (broker: BrokerItem) => {
    setEditingBroker(broker);
    setFormData({
      name: broker.name,
      shortName: broker.shortName,
      logoUrl: broker.logoUrl || "",
      licenseNumber: broker.licenseNumber,
      statusBadge: broker.statusBadge || "Pialang Resmi",
      tagline: broker.tagline,
      description: broker.description,
      highlights: broker.highlights.length > 0 ? [...broker.highlights] : [""],
      actionText: broker.actionText,
      actionUrl: broker.actionUrl,
      officialSiteUrl: broker.officialSiteUrl,
      isFeatured: !!broker.isFeatured,
      order: broker.order || 1,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("File harus berupa gambar (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError("Ukuran logo maksimal 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) {
        setFormData((prev) => ({ ...prev, logoUrl: res }));
        setFormError("");
        showToast("Logo pialang berhasil diunggah.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, ""],
    }));
  };

  const handleHighlightChange = (index: number, val: string) => {
    setFormData((prev) => {
      const copy = [...prev.highlights];
      copy[index] = val;
      return { ...prev, highlights: copy };
    });
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData((prev) => {
      const copy = prev.highlights.filter((_, i) => i !== index);
      return {
        ...prev,
        highlights: copy.length > 0 ? copy : [""],
      };
    });
  };

  const handleAddSuggestion = (text: string) => {
    if (formData.highlights.includes(text)) return;
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((h) => h.trim() !== "").concat(text),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError("Nama lengkap pialang wajib diisi.");
      return;
    }

    if (!formData.shortName.trim()) {
      setFormError("Nama inisial/singkatan pialang wajib diisi (contoh: TPFX).");
      return;
    }

    if (!formData.licenseNumber.trim()) {
      setFormError("Nomor izin BAPPEBTI wajib diisi.");
      return;
    }

    if (!formData.description.trim()) {
      setFormError("Keterangan profil pialang wajib diisi.");
      return;
    }

    const cleanHighlights = formData.highlights
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    if (cleanHighlights.length === 0) {
      setFormError("Minimal sertakan 1 poin fasilitas atau keunggulan pialang.");
      return;
    }

    if (editingBroker) {
      // Update
      updateBroker(editingBroker.id, {
        name: formData.name.trim(),
        shortName: formData.shortName.trim().toUpperCase(),
        logoUrl: formData.logoUrl.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        statusBadge: formData.statusBadge.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        highlights: cleanHighlights,
        actionText: formData.actionText.trim() || "Konsultasi Pendaftaran",
        actionUrl: formData.actionUrl.trim(),
        officialSiteUrl: formData.officialSiteUrl.trim() || "https://bappebti.go.id",
        isFeatured: formData.isFeatured,
        order: Number(formData.order) || 1,
      });
      showToast("Data pialang resmi berhasil diperbarui.");
    } else {
      // Create
      addBroker({
        name: formData.name.trim(),
        shortName: formData.shortName.trim().toUpperCase(),
        logoUrl: formData.logoUrl.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        statusBadge: formData.statusBadge.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        highlights: cleanHighlights,
        actionText: formData.actionText.trim() || "Konsultasi Pendaftaran",
        actionUrl: formData.actionUrl.trim(),
        officialSiteUrl: formData.officialSiteUrl.trim() || "https://bappebti.go.id",
        isFeatured: formData.isFeatured,
        order: Number(formData.order) || 1,
      });
      showToast("Pialang resmi baru berhasil ditambahkan.");
    }

    setIsModalOpen(false);
    refreshBrokers();
  };

  const handleToggleFeatured = (broker: BrokerItem) => {
    updateBroker(broker.id, { isFeatured: !broker.isFeatured });
    showToast(
      broker.isFeatured
        ? `${broker.shortName} dilepas dari pialang utama.`
        : `${broker.shortName} dijadikan pialang utama (featured).`
    );
    refreshBrokers();
  };

  const handleDelete = (id: string) => {
    deleteBroker(id);
    setDeleteConfirmId(null);
    showToast("Pialang berhasil dihapus.");
    refreshBrokers();
  };

  const handleReset = () => {
    if (confirm("Reset seluruh daftar pialang kembali ke mitra resmi default (TPFX)?")) {
      resetBrokers();
      showToast("Daftar kemitraan pialang direset ke default.");
      refreshBrokers();
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(brokers, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kemitraan-pialang-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredBrokers = brokers.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.shortName.toLowerCase().includes(q) ||
      b.licenseNumber.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy-950 text-white border border-gold-400 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Manajemen Kemitraan Pialang Berjangka BAPPEBTI</span>
            </div>
            <h2 className="font-[var(--font-heading)] text-xl sm:text-2xl font-extrabold text-slate-900">
              Daftar Kemitraan Pialang Resmi
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl">
              Kelola data pialang resmi yang direkomendasikan kepada member komunitas. Seluruh perubahan pada nomor izin, profil, fasilitas, dan tautan pendaftaran langsung otomatis tampil di section broker landing page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pialang Resmi</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              title="Ekspor JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Ekspor</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              title="Reset ke Default (TPFX)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Pialang</span>
            <span className="text-lg font-bold text-slate-900">{brokers.length} Entitas</span>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-700 block">Pialang Utama (Featured)</span>
            <span className="text-lg font-bold text-amber-900">
              {brokers.filter((b) => b.isFeatured).length} Pialang
            </span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-700 block">Status Regulasi</span>
            <span className="text-lg font-bold text-emerald-900">100% BAPPEBTI</span>
          </div>
          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
            <span className="text-[11px] font-semibold text-sky-700 block">Sinkronisasi Landing Page</span>
            <span className="text-lg font-bold text-sky-900">Real-Time Aktif</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pialang atau no. izin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium self-end sm:self-auto">
          Menampilkan <span className="font-bold text-slate-900">{filteredBrokers.length}</span> dari {brokers.length} pialang
        </div>
      </div>

      {/* Broker List Cards */}
      <div className="space-y-4">
        {filteredBrokers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Tidak ada pialang ditemukan</h3>
            <p className="text-slate-500 text-xs mt-1">
              {search ? "Coba kata kunci pencarian yang lain." : "Klik tombol 'Tambah Pialang Resmi' untuk menambahkan data."}
            </p>
          </div>
        ) : (
          filteredBrokers.map((broker) => (
            <div
              key={broker.id}
              className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 shadow-xs ${
                broker.isFeatured
                  ? "border-amber-300 ring-2 ring-amber-100"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                {/* Broker Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Logo or Badge */}
                  {broker.logoUrl ? (
                    <img
                      src={broker.logoUrl}
                      alt={broker.name}
                      className="w-14 h-14 rounded-xl object-contain border border-slate-200 p-1 bg-white flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-navy-950 text-gold-400 font-black text-lg flex items-center justify-center flex-shrink-0 font-[var(--font-heading)] shadow-xs">
                      {broker.shortName.slice(0, 4)}
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-[var(--font-heading)] font-extrabold text-base sm:text-lg text-slate-900">
                        {broker.name}
                      </h3>
                      {broker.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          Mitra Utama
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {broker.statusBadge}
                      </span>
                    </div>

                    <p className="text-amber-800 text-xs font-semibold flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{broker.licenseNumber}</span>
                    </p>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-3xl">
                      {broker.description}
                    </p>

                    {/* Highlights Badges */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {broker.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 text-[11px]"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions & Links */}
                <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(broker)}
                      className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
                        broker.isFeatured
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      title={broker.isFeatured ? "Lepas status pialang utama" : "Jadikan pialang utama"}
                    >
                      <Star className={`w-3.5 h-3.5 ${broker.isFeatured ? "fill-amber-600 text-amber-600" : ""}`} />
                      <span className="hidden sm:inline">
                        {broker.isFeatured ? "Utama" : "Jadikan Utama"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(broker)}
                      className="p-2 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                      title="Edit Data Pialang"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(broker.id)}
                      className="p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl transition-colors"
                      title="Hapus Pialang"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {broker.actionUrl && (
                      <a
                        href={broker.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline font-semibold"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span>Link Pendaftaran</span>
                      </a>
                    )}
                    {broker.officialSiteUrl && (
                      <a
                        href={broker.officialSiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Web Bappebti</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hapus Pialang Resmi?</h3>
                <p className="text-slate-500 text-xs">Tindakan ini akan menghapus pialang dari landing page.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
              >
                Ya, Hapus Pialang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 my-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>{editingBroker ? "Edit Pialang Resmi" : "Tambah Pialang Resmi Baru"}</span>
            </div>
            <h3 className="font-[var(--font-heading)] font-extrabold text-xl sm:text-2xl text-slate-900 mb-6">
              {editingBroker ? `Edit Data: ${editingBroker.shortName}` : "Formulir Pialang Berjangka BAPPEBTI"}
            </h3>

            {formError && (
              <div className="p-3 mb-5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              {/* Row 1: Nama Lengkap & Inisial */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Nama Perusahaan Pialang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Trijaya Pratama Futures (TPFX)"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Nama Singkat / Inisial <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: TPFX"
                    value={formData.shortName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shortName: e.target.value.toUpperCase() }))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono uppercase"
                  />
                </div>
              </div>

              {/* Row 2: Izin BAPPEBTI & Status Badge */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Nomor Izin Usaha BAPPEBTI <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: No. 407/BAPPEBTI/SI/VII/2004"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Label Status Kemitraan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Mitra Utama Resmi / Pialang Terdaftar"
                    value={formData.statusBadge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, statusBadge: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Row 3: Logo Pialang */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Logo Pialang (Upload File atau URL Gambar)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-200"
                  >
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Pilih Gambar Logo</span>
                  </button>

                  <input
                    type="url"
                    placeholder="Atau tautan URL: https://example.com/logo.png"
                    value={formData.logoUrl.startsWith("data:") ? "" : formData.logoUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />

                  {formData.logoUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={formData.logoUrl}
                        alt="Preview Logo"
                        className="w-9 h-9 object-contain rounded-lg border border-slate-200 bg-white p-0.5"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, logoUrl: "" }))}
                        className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Tagline & Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Sub-Judul / Tagline
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pialang Berjangka Terdaftar & Diawasi Resmi"
                  value={formData.tagline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Keterangan Profil Pialang <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan spesialisasi produk (Gold, Oil, CPO), legalitas, dan keamanan dana nasabah..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Row 5: Poin Keunggulan / Highlights */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    Poin Keunggulan & Fasilitas Transaksi:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Poin
                  </button>
                </div>

                {/* Suggestions Quick Buttons */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Rekomendasi Cepat:</span>
                  {HIGHLIGHT_SUGGESTIONS.slice(0, 4).map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => handleAddSuggestion(sugg)}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-600 hover:border-amber-400 hover:text-amber-800 transition-colors"
                    >
                      + {sugg.slice(0, 32)}...
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {formData.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: Rekening Terpisah (Segregated Account) di Bank BCA, Mandiri"
                        value={highlight}
                        onChange={(e) => handleHighlightChange(idx, e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      {formData.highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white"
                          title="Hapus baris"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 6: Tautan Aksi Pendaftaran & Bappebti */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Tautan Pendaftaran / Konsultasi (WA / Web)
                  </label>
                  <input
                    type="text"
                    placeholder="https://wa.me/62812... atau link registrasi"
                    value={formData.actionUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, actionUrl: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Tautan Situs Resmi / Profil Bappebti
                  </label>
                  <input
                    type="url"
                    placeholder="https://bappebti.go.id"
                    value={formData.officialSiteUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, officialSiteUrl: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Row 7: Featured Checkbox & Urutan */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Tandai sebagai Pialang Utama (Featured Partner)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Pialang featured akan disorot pada posisi teratas di halaman landing page.
                    </span>
                  </div>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    Nomor Urut:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={formData.order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                    className="w-16 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
                >
                  {editingBroker ? "Simpan Perubahan" : "Tambahkan Pialang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
