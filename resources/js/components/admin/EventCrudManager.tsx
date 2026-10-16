"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  Image as ImageIcon,
  Upload,
  Check,
  X,
  AlertCircle,
  RotateCcw,
  Download,
  Eye,
  MapPin,
  Users,
  Video,
  TrendingUp,
  Trophy,
  Landmark,
  Layers,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { EventItem, EventStatus, EventCategory } from "@/types/event";
import {
  getStoredEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  resetToDefaultEvents,
  PRESET_POSTERS,
  formatEventDateFromInputs,
  formatEventTimeFromInputs,
} from "@/lib/eventStorage";

interface FormState {
  id?: string;
  // 4 Kolom Utama
  posterImage: string;
  title: string;
  description: string;
  // Input Tanggal Terstruktur (Hanya bisa input tanggal)
  isDateRange: boolean;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  // Input Jam Terstruktur (Hanya bisa input jam)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  // Kategori & Status
  category: EventCategory;
  status: EventStatus;
  // Field Kontekstual Berdasarkan Kategori
  // 1. Webinar Online
  meetingUrl: string;
  webinarHost: string;
  webinarSlots: string;
  // 2. Live Trading Bareng
  tradingSession: string;
  targetInstrument: string;
  tradingPlatform: string;
  leadTrader: string;
  // 3. Workshop Khusus
  workshopSubtype: "competition" | "bootcamp";
  prizePool: string;
  registrationDeadline: string; // YYYY-MM-DD
  competitionAccountPlatform: string;
  // 4. Seminar Edukasi
  venueName: string;
  venueCity: string;
  venueAddress: string;
  seatQuota: string;
  keynoteSpeaker: string;
  // Tambahan
  keyTakeaways: string;
  actionText: string;
  actionType: "join-live" | "rsvp" | "recap";
  telegramGroupUrl: string;
  tutorialAccountUrl: string;
}

const defaultStartDate = "2026-10-24";
const defaultEndDate = "2026-10-31";

const emptyForm: FormState = {
  posterImage: PRESET_POSTERS[0].dataUrl,
  title: "",
  description: "",
  isDateRange: false,
  startDate: defaultStartDate,
  endDate: "",
  startTime: "19:30",
  endTime: "21:00",
  category: "Webinar Online",
  status: "upcoming",
  // Webinar
  meetingUrl: "",
  webinarHost: "Mentor Berlisensi BAPPEBTI",
  webinarSlots: "500",
  // Live Trading
  tradingSession: "Sesi New York (19.00 - 04.00 WIB)",
  targetInstrument: "Gold (XAU/USD) & WTI Crude Oil",
  tradingPlatform: "MetaTrader 5 (MT5)",
  leadTrader: "Tim Riset & Mentor Semakin Pede",
  // Workshop / Competition
  workshopSubtype: "competition",
  prizePool: "Rp 50.000.000",
  registrationDeadline: "2026-10-25",
  competitionAccountPlatform: "Platform MT5 Pialang Resmi TPFX",
  // Seminar Edukasi
  venueName: "Ballroom Hotel Mercure Kemayoran",
  venueCity: "Jakarta Pusat",
  venueAddress: "Jl. H. Benyamin Sueb Kav B-6, Kota Baru Bandar Kemayoran",
  seatQuota: "100",
  keynoteSpeaker: "Dewan Pembina & Analis Senior BAPPEBTI",
  // Poin
  keyTakeaways:
    "Manajemen Risiko & Stop Loss Terukur\nAnalisis Volatilitas Harga Komoditas\nTanya Jawab Studi Kasus & Jurnal",
  actionText: "Daftar Sekarang",
  actionType: "rsvp",
  telegramGroupUrl: "https://t.me/semakinpede_official",
  tutorialAccountUrl:
    "https://drive.google.com/file/d/1kBVRqc8q6XcvHSdqVweg_Fc64Z_u79FV/view?usp=sharing",
};

export default function EventCrudManager() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Poster Input Mode: 'preset' | 'upload' | 'url'
  const [posterInputMode, setPosterInputMode] = useState<"preset" | "upload" | "url">("preset");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poster preview modal
  const [previewPosterUrl, setPreviewPosterUrl] = useState<string | null>(null);

  const loadEvents = () => {
    setEvents(getStoredEvents());
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Keyboard accessibility: close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewPosterUrl) {
          setPreviewPosterUrl(null);
        } else if (deleteTarget) {
          setDeleteTarget(null);
        } else if (isModalOpen) {
          setIsModalOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewPosterUrl, deleteTarget, isModalOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setForm({
      ...emptyForm,
      posterImage: PRESET_POSTERS[0].dataUrl,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      isDateRange: false,
    });
    setFormError("");
    setPosterInputMode("preset");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (event: EventItem) => {
    setIsEditing(true);

    const isRange = !!(event.endDate && event.endDate !== event.startDate);

    setForm({
      id: event.id,
      posterImage: event.posterImage || PRESET_POSTERS[0].dataUrl,
      title: event.title,
      description: event.description,
      isDateRange: isRange,
      startDate: event.startDate || (event.date.includes("2026-") ? event.date.slice(0, 10) : defaultStartDate),
      endDate: event.endDate || (isRange ? defaultEndDate : ""),
      startTime: event.startTime || "19:30",
      endTime: event.endTime || "21:00",
      category: event.category,
      status: event.status,
      // Webinar
      meetingUrl: event.meetingUrl || (event.location?.startsWith("http") ? event.location : ""),
      webinarHost: event.speaker || "Mentor Berlisensi BAPPEBTI",
      webinarSlots: event.attendeesCount?.replace(/[^0-9]/g, "") || "500",
      // Live Trading
      tradingSession: event.tradingSession || "Sesi New York (19.00 - 04.00 WIB)",
      targetInstrument: event.targetInstrument || "Gold (XAU/USD)",
      tradingPlatform: event.tradingPlatform || "MetaTrader 5 (MT5)",
      leadTrader: event.speaker || "Mentor Semakin Pede",
      // Workshop / Competition
      workshopSubtype: event.workshopSubtype || (event.title.toLowerCase().includes("competition") ? "competition" : "bootcamp"),
      prizePool: event.prizePool || "Rp 50.000.000",
      registrationDeadline: event.registrationDeadline || "2026-10-25",
      competitionAccountPlatform: event.location || "Platform MT5 Pialang Resmi TPFX",
      // Seminar
      venueName: event.location || "Hotel Mercure Kemayoran",
      venueCity: event.venueCity || "Jakarta Pusat",
      venueAddress: event.venueAddress || "",
      seatQuota: event.seatQuota ? String(event.seatQuota) : "100",
      keynoteSpeaker: event.speaker || "Dewan Pembina BAPPEBTI",
      // Extras
      keyTakeaways: event.keyTakeaways ? event.keyTakeaways.join("\n") : "",
      actionText: event.actionText || "Daftar Sekarang",
      actionType: event.actionType || "rsvp",
      telegramGroupUrl: event.telegramGroupUrl || "",
      tutorialAccountUrl: event.tutorialAccountUrl || "",
    });
    setFormError("");
    setPosterInputMode("preset");
    setIsModalOpen(true);
  };

  // Handle Poster File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("File poster harus berupa gambar (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError("Ukuran file poster maksimal 2 MB agar website memuat cepat.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) {
        setForm((prev) => ({ ...prev, posterImage: res }));
        setFormError("");
        showToast("Gambar poster berhasil diunggah.");
      }
    };
    reader.onerror = () => {
      setFormError("Gagal membaca file gambar.");
    };
    reader.readAsDataURL(file);
  };

  // Live Date Label Preview
  const computedDateLabel = formatEventDateFromInputs(
    form.startDate,
    form.isDateRange ? form.endDate : undefined
  );

  const computedTimeLabel = formatEventTimeFromInputs(form.startTime, form.endTime);

  // Form Submission
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi 1: Nama Event
    if (!form.title.trim()) {
      setFormError("Nama event wajib diisi.");
      return;
    }

    // Validasi 2: Input Tanggal (Native Date Validation)
    if (!form.startDate) {
      setFormError("Tanggal mulai pelaksanaan wajib dipilih.");
      return;
    }

    if (form.isDateRange) {
      if (!form.endDate) {
        setFormError("Tanggal selesai wajib dipilih jika memilih mode rentang multi-hari.");
        return;
      }
      if (form.endDate < form.startDate) {
        setFormError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
        return;
      }
    }

    // Validasi 3: Keterangan
    if (!form.description.trim()) {
      setFormError("Keterangan event wajib diisi.");
      return;
    }

    // Validasi 4: Field Kontekstual Berdasarkan Kategori
    if (form.category === "Workshop Khusus" && form.workshopSubtype === "competition") {
      if (form.registrationDeadline && form.registrationDeadline > form.startDate) {
        setFormError("Batas akhir pendaftaran tidak boleh melebihi tanggal mulai kompetisi.");
        return;
      }
    }

    const takeawaysArray = form.keyTakeaways
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const posterToSave = form.posterImage.trim() || PRESET_POSTERS[0].dataUrl;

    // Menentukan lokasi dan pembicara kontekstual
    let resolvedLocation = "";
    let resolvedSpeaker = "";
    let resolvedAttendees = "";

    if (form.category === "Webinar Online") {
      resolvedLocation = form.meetingUrl || "Zoom / Google Meet Live";
      resolvedSpeaker = form.webinarHost;
      resolvedAttendees = form.webinarSlots ? `${form.webinarSlots} Slot Online` : "Terbuka untuk Member";
    } else if (form.category === "Live Trading Bareng") {
      resolvedLocation = `${form.tradingPlatform} (${form.tradingSession})`;
      resolvedSpeaker = form.leadTrader;
      resolvedAttendees = "Live Room Terbuka";
    } else if (form.category === "Workshop Khusus") {
      resolvedLocation = form.competitionAccountPlatform;
      resolvedSpeaker = "Dewan Juri Mentor BAPPEBTI & Tim Riset";
      resolvedAttendees = "Slot Terbatas";
    } else if (form.category === "Seminar Edukasi") {
      resolvedLocation = `${form.venueName}, ${form.venueCity}`;
      resolvedSpeaker = form.keynoteSpeaker;
      resolvedAttendees = form.seatQuota ? `${form.seatQuota} Kursi Fisik` : "Kuota Terbatas";
    }

    const eventPayload: Omit<EventItem, "id" | "createdAt" | "updatedAt"> = {
      posterImage: posterToSave,
      title: form.title.trim(),
      date: computedDateLabel,
      time: computedTimeLabel,
      description: form.description.trim(),
      category: form.category,
      status: form.status,
      location: resolvedLocation,
      speaker: resolvedSpeaker,
      startDate: form.startDate,
      endDate: form.isDateRange ? form.endDate : undefined,
      startTime: form.startTime,
      endTime: form.endTime,
      meetingUrl: form.category === "Webinar Online" ? form.meetingUrl : undefined,
      tradingSession: form.category === "Live Trading Bareng" ? form.tradingSession : undefined,
      targetInstrument: form.category === "Live Trading Bareng" ? form.targetInstrument : undefined,
      tradingPlatform: form.category === "Live Trading Bareng" ? form.tradingPlatform : undefined,
      workshopSubtype: form.category === "Workshop Khusus" ? form.workshopSubtype : undefined,
      prizePool: form.category === "Workshop Khusus" ? form.prizePool : undefined,
      registrationDeadline: form.category === "Workshop Khusus" ? form.registrationDeadline : undefined,
      venueCity: form.category === "Seminar Edukasi" ? form.venueCity : undefined,
      venueAddress: form.category === "Seminar Edukasi" ? form.venueAddress : undefined,
      seatQuota: form.category === "Seminar Edukasi" && form.seatQuota ? Number(form.seatQuota) : undefined,
      keyTakeaways: takeawaysArray,
      attendeesCount: resolvedAttendees,
      actionText: form.actionText.trim() || "Daftar Sekarang",
      actionType: form.actionType,
      telegramGroupUrl: form.telegramGroupUrl.trim() || undefined,
      tutorialAccountUrl: form.tutorialAccountUrl.trim() || undefined,
    };

    if (isEditing && form.id) {
      const updated = updateEvent(form.id, eventPayload);
      if (updated) {
        showToast(`Event "${updated.title}" berhasil diperbarui.`);
      }
    } else {
      const created = addEvent(eventPayload);
      showToast(`Event "${created.title}" berhasil ditambahkan.`);
    }

    setIsModalOpen(false);
    loadEvents();
  };

  // Delete Action
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const ok = deleteEvent(deleteTarget.id);
    if (ok) {
      showToast(`Event "${deleteTarget.title}" berhasil dihapus.`);
      loadEvents();
    }
    setDeleteTarget(null);
  };

  // Reset to Default
  const handleResetDefault = () => {
    if (confirm("Reset seluruh daftar event kembali ke agenda kompetisi trading default?")) {
      resetToDefaultEvents();
      loadEvents();
      showToast("Data event dikembalikan ke agenda default.");
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agenda-events-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter Events
  const filteredEvents = events.filter((ev) => {
    const q = search.toLowerCase();
    const matchSearch =
      ev.title.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q) ||
      ev.date.toLowerCase().includes(q);

    const matchStatus = statusFilter === "all" || ev.status === statusFilter;
    const matchCategory = categoryFilter === "all" || ev.category === categoryFilter;

    return matchSearch && matchStatus && matchCategory;
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

      {/* Top Banner & Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Manajemen Agenda Komunitas &amp; Kompetisi</span>
            </div>
            <h2 className="font-[var(--font-heading)] text-xl sm:text-2xl font-extrabold text-slate-900">
              Daftar Event Landing Page
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl">
              Kelola seluruh tampilan agenda, webinar, live trading bareng, serta kompetisi trading nasional.
              Formulir input telah dilengkapi validasi tanggal kalender native dan field kontekstual sesuai jenis kegiatan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Event Baru</span>
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
              onClick={handleResetDefault}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              title="Reset ke Default"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Agenda</span>
            <span className="text-lg font-bold text-slate-900">{events.length} Event</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-700 block">Sesi Pekan Ini</span>
            <span className="text-lg font-bold text-emerald-900">
              {events.filter((e) => e.status === "ongoing").length} Sesi
            </span>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-700 block">Akan Datang (Upcoming)</span>
            <span className="text-lg font-bold text-amber-900">
              {events.filter((e) => e.status === "upcoming").length} Event
            </span>
          </div>
          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
            <span className="text-[11px] font-semibold text-sky-700 block">Sinkronisasi Landing Page</span>
            <span className="text-lg font-bold text-sky-900">Real-Time</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama event, keterangan, atau tanggal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Jenis Kegiatan</option>
            <option value="Trading Competition">Trading Competition</option>
            <option value="Webinar Online">Webinar Online</option>
            <option value="Live Trading Bareng">Live Trading Bareng</option>
            <option value="Workshop Khusus">Workshop Khusus</option>
            <option value="Seminar Edukasi">Seminar Edukasi</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EventStatus | "all")}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Status</option>
            <option value="ongoing">Terkini (Pekan Ini)</option>
            <option value="upcoming">Akan Datang</option>
            <option value="past">Telah Selesai</option>
          </select>
        </div>
      </div>

      {/* Cards List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Tidak ada event ditemukan</h3>
            <p className="text-slate-500 text-xs mt-1">
              {search ? "Coba kata kunci pencarian lain." : "Klik tombol 'Tambah Event Baru' untuk membuat agenda."}
            </p>
          </div>
        ) : (
          filteredEvents.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Poster Preview */}
                <div className="relative aspect-[16/9] bg-slate-900 border-b border-slate-100 overflow-hidden">
                  {item.posterImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.posterImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                      Poster Tidak Tersedia
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                        item.status === "ongoing"
                          ? "bg-emerald-600 text-white"
                          : item.status === "upcoming"
                            ? "bg-amber-500 text-navy-950"
                            : "bg-slate-700 text-white"
                      }`}
                    >
                      {item.status === "ongoing"
                        ? "PEKAN INI"
                        : item.status === "upcoming"
                          ? "AKAN DATANG"
                          : "SELESAI"}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                      {item.category}
                    </span>
                  </div>

                  {item.posterImage && (
                    <button
                      type="button"
                      onClick={() => setPreviewPosterUrl(item.posterImage)}
                      className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-lg text-xs"
                      title="Zoom Poster"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Nama Event
                    </span>
                    <h3 className="font-[var(--font-heading)] font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                  </div>

                  {/* Tanggal & Waktu */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>{item.date}</span>
                    </div>
                    {item.time && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{item.time}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Keterangan */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Keterangan
                    </span>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {item.id.slice(0, 14)}...
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-amber-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Hapus Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hapus Event Ini?</h3>
                <p className="text-slate-500 text-xs">Event &quot;{deleteTarget.title}&quot; akan dihapus permanen.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
              >
                Ya, Hapus Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Poster Zoom Modal */}
      {previewPosterUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs"
          onClick={() => setPreviewPosterUrl(null)}
        >
          <div
            className="max-w-4xl w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewPosterUrl(null)}
              className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black text-white rounded-full transition-colors z-10"
              aria-label="Tutup Pratinjau Poster"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewPosterUrl}
              alt="Pratinjau Penuh Poster"
              className="w-full h-auto max-h-[80vh] object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* MODAL KONFIGURASI EVENT (ANTI-SLOP ARCHITECTURE) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-event-title"
        >
          <div className="bg-white rounded-2xl border border-slate-300 max-w-3xl w-full my-6 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
            {/* Sticky Header */}
            <div className="px-6 py-4.5 border-b border-slate-200 bg-slate-50/90 backdrop-blur-xs flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-navy-950 text-gold-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="modal-event-title" className="font-[var(--font-heading)] font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                    {isEditing ? "Konfigurasi Event: Edit Data" : "Konfigurasi Event: Tambah Agenda Baru"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Formulir terstruktur dengan validasi tanggal kalender dan opsi kontekstual kegiatan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
                aria-label="Tutup Modal Konfigurasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 sm:p-7 overflow-y-auto space-y-6">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* SEGMENT 1: PILIHAN JENIS KEGIATAN */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Pilih Jenis Kegiatan <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {(
                    [
                      { key: "Trading Competition", icon: Trophy, desc: "Kejuaraan Berhadiah" },
                      { key: "Webinar Online", icon: Video, desc: "Sesi Virtual Meeting" },
                      { key: "Live Trading Bareng", icon: TrendingUp, desc: "Sesi Eksekusi Pasar" },
                      { key: "Workshop Khusus", icon: Sparkles, desc: "Bootcamp / Khusus" },
                      { key: "Seminar Edukasi", icon: Landmark, desc: "Tatap Muka / On-site" },
                    ] as const
                  ).map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = form.category === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, category: cat.key as EventCategory }))}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-navy-950 text-white border-navy-950 shadow-xs ring-2 ring-amber-400/40"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-gold-400" : "text-slate-500"}`} />
                          <span className="text-xs font-bold block">{cat.key}</span>
                        </div>
                        <span className={`text-[10px] block ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                          {cat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SEGMENT 2: NAMA EVENT & STATUS */}
              <div className="space-y-4 pt-1 border-t border-slate-100">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Nama Event <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {form.title.length}/120 karakter
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={120}
                    placeholder="Contoh: Semakin Pede Futures Trading Competition: Gold & Oil Championship 2026"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                      Status Pelaksanaan Event
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as EventStatus }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="upcoming">Akan Datang (Upcoming)</option>
                      <option value="ongoing">Terkini (Sedang Berjalan / Live)</option>
                      <option value="past">Telah Selesai (Arsip Event)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                      Keterangan Ringkas <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 block mb-1">
                      Penjelasan tujuan dan manfaat kegiatan
                    </span>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={3}
                    maxLength={500}
                    placeholder="Jelaskan deskripsi event, target peserta, serta manfaat mengikuti sesi ini..."
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 float-right mt-0.5">
                    {form.description.length}/500 karakter
                  </span>
                </div>
              </div>

              {/* SEGMENT 3: TANGGAL & WAKTU PELAKSANAAN (STRICT DATE & TIME INPUTS) */}
              <div className="p-4.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Tanggal &amp; Waktu Pelaksanaan
                    </span>
                  </div>

                  {/* Date Mode Toggle */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, isDateRange: false, endDate: "" }))}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                        !form.isDateRange
                          ? "bg-navy-950 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Satu Hari
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          isDateRange: true,
                          endDate: p.endDate || defaultEndDate,
                        }))
                      }
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                        form.isDateRange
                          ? "bg-navy-950 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Rentang Multi-Hari (Kompetisi)
                    </button>
                  </div>
                </div>

                {/* Date Inputs Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      {form.isDateRange ? "Tanggal Mulai Pelaksanaan" : "Tanggal Pelaksanaan"} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Pilih dari kalender (format sistem otomatis)
                    </span>
                  </div>

                  {form.isDateRange && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Tanggal Selesai Pelaksanaan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        min={form.startDate}
                        value={form.endDate}
                        onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Wajib sama atau setelah tanggal mulai
                      </span>
                    </div>
                  )}
                </div>

                {/* Time Inputs Grid */}
                <div className="grid sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Jam Mulai (WIB)</span>
                    </label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Jam Selesai (WIB)</span>
                    </label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Live Calculated Label */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Hasil Format Tampilan Website:
                    </span>
                    <span className="font-bold text-amber-800 text-xs sm:text-sm">
                      {computedDateLabel || "Pilih tanggal"}
                    </span>
                    <span className="text-slate-500 text-xs ml-2">
                      ({computedTimeLabel || "Waktu belum diisi"})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Otomatis Valid
                  </span>
                </div>
              </div>

              {/* SEGMENT 4: FIELD KONTEKSTUAL BERDASARKAN JENIS KEGIATAN */}
              <div className="p-4.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Pengaturan Khusus: {form.category}
                  </span>
                </div>

                {/* KONDISI 1: WEBINAR ONLINE */}
                {form.category === "Webinar Online" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Tautan Ruang Virtual (Zoom / Google Meet)
                      </label>
                      <input
                        type="url"
                        placeholder="https://zoom.us/j/123456789 atau link Google Meet"
                        value={form.meetingUrl}
                        onChange={(e) => setForm((p) => ({ ...p, meetingUrl: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Nama Host / Mentor Pemateri
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Mentor Analis BAPPEBTI"
                          value={form.webinarHost}
                          onChange={(e) => setForm((p) => ({ ...p, webinarHost: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Estimasi Kuota Peserta Online
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={5000}
                          placeholder="500"
                          value={form.webinarSlots}
                          onChange={(e) => setForm((p) => ({ ...p, webinarSlots: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* KONDISI 2: LIVE TRADING BARENG */}
                {form.category === "Live Trading Bareng" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Sesi Pasar Trading
                        </label>
                        <select
                          value={form.tradingSession}
                          onChange={(e) => setForm((p) => ({ ...p, tradingSession: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="Sesi New York (19.00 - 04.00 WIB)">Sesi New York (Malam: Volatilitas Gold &amp; Oil)</option>
                          <option value="Sesi London (14.00 - 22.00 WIB)">Sesi London (Sore: Pembukaan Pasar Eropa)</option>
                          <option value="Sesi Asia / Tokyo (07.00 - 14.00 WIB)">Sesi Asia / Tokyo (Pagi)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Instrumen Fokus Transaksi
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Gold (XAU/USD) & WTI Oil"
                          value={form.targetInstrument}
                          onChange={(e) => setForm((p) => ({ ...p, targetInstrument: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Platform Eksekusi Transaksi
                        </label>
                        <select
                          value={form.tradingPlatform}
                          onChange={(e) => setForm((p) => ({ ...p, tradingPlatform: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="MetaTrader 5 (MT5)">MetaTrader 5 (MT5)</option>
                          <option value="MetaTrader 4 (MT4)">MetaTrader 4 (MT4)</option>
                          <option value="TradingView Pro Chart">TradingView Chart</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Lead Trader / Pendamping
                        </label>
                        <input
                          type="text"
                          placeholder="Nama mentor eksekusi live"
                          value={form.leadTrader}
                          onChange={(e) => setForm((p) => ({ ...p, leadTrader: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* KONDISI KHUSUS: TRADING COMPETITION */}
                {form.category === "Trading Competition" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Total Hadiah Kompetisi
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Rp 5.700.000 (Best Performance & Best Volume)"
                          value={form.prizePool}
                          onChange={(e) => setForm((p) => ({ ...p, prizePool: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-bold text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Batas Akhir Pendaftaran (Date)
                        </label>
                        <input
                          type="date"
                          max={form.startDate}
                          value={form.registrationDeadline}
                          onChange={(e) => setForm((p) => ({ ...p, registrationDeadline: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Platform Akun Kompetisi
                      </label>
                      <input
                        type="text"
                        placeholder="Platform MetaTrader 5 (Didukung Pialang Resmi TPFX - BAPPEBTI)"
                        value={form.competitionAccountPlatform}
                        onChange={(e) => setForm((p) => ({ ...p, competitionAccountPlatform: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* KONDISI 3: WORKSHOP KHUSUS */}
                {form.category === "Workshop Khusus" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Format Kegiatan Workshop
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, workshopSubtype: "competition" }))}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                            form.workshopSubtype === "competition"
                              ? "bg-navy-950 text-white border-navy-950"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          Trading Competition (Kejuaraan)
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, workshopSubtype: "bootcamp" }))}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                            form.workshopSubtype === "bootcamp"
                              ? "bg-navy-950 text-white border-navy-950"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          Intensive Mentoring Bootcamp
                        </button>
                      </div>
                    </div>

                    {form.workshopSubtype === "competition" ? (
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-800 mb-1">
                              Total Hadiah Kompetisi
                            </label>
                            <input
                              type="text"
                              placeholder="Contoh: Rp 50.000.000 + Piala Bergilir"
                              value={form.prizePool}
                              onChange={(e) => setForm((p) => ({ ...p, prizePool: e.target.value }))}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-bold text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-800 mb-1">
                              Batas Akhir Pendaftaran (Date)
                            </label>
                            <input
                              type="date"
                              max={form.startDate}
                              value={form.registrationDeadline}
                              onChange={(e) => setForm((p) => ({ ...p, registrationDeadline: e.target.value }))}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1">
                            Platform Akun Kompetisi
                          </label>
                          <input
                            type="text"
                            placeholder="Platform MT5 Pialang Resmi TPFX"
                            value={form.competitionAccountPlatform}
                            onChange={(e) => setForm((p) => ({ ...p, competitionAccountPlatform: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
                        Format Bootcamp berfokus pada kurikulum bertahap: Audit Jurnal, Evaluasi Stop Loss, dan Simulasi Posisi Lot.
                      </div>
                    )}
                  </div>
                )}

                {/* KONDISI 4: SEMINAR EDUKASI (OFFLINE / TATAP MUKA) */}
                {form.category === "Seminar Edukasi" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Nama Gedung / Hotel Venue <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Hotel Mercure Kemayoran"
                          value={form.venueName}
                          onChange={(e) => setForm((p) => ({ ...p, venueName: e.target.value }))}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Kota Pelaksanaan <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Jakarta Pusat"
                          value={form.venueCity}
                          onChange={(e) => setForm((p) => ({ ...p, venueCity: e.target.value }))}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Alamat Lengkap Venue
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Jl. H. Benyamin Sueb Kav B-6, Kemayoran, Jakarta"
                        value={form.venueAddress}
                        onChange={(e) => setForm((p) => ({ ...p, venueAddress: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Kuota Kursi Fisik
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={1000}
                          placeholder="100"
                          value={form.seatQuota}
                          onChange={(e) => setForm((p) => ({ ...p, seatQuota: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Keynote Speaker
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Dewan Pengawas BAPPEBTI"
                          value={form.keynoteSpeaker}
                          onChange={(e) => setForm((p) => ({ ...p, keynoteSpeaker: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SEGMENT 5: FIELD GAMBAR POSTER (16:9) */}
              <div className="p-4.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Field Gambar Poster <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">Rasio standar 16:9</span>
                </div>

                {/* Poster Mode Selector */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPosterInputMode("preset")}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors border ${
                      posterInputMode === "preset"
                        ? "bg-navy-950 text-white border-navy-950"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    Preset Grafis Desain
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosterInputMode("upload")}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors border ${
                      posterInputMode === "upload"
                        ? "bg-navy-950 text-white border-navy-950"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    Unggah File Sendiri
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosterInputMode("url")}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors border ${
                      posterInputMode === "url"
                        ? "bg-navy-950 text-white border-navy-950"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    Tautan URL
                  </button>
                </div>

                {/* Preset Options */}
                {posterInputMode === "preset" && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                    {PRESET_POSTERS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, posterImage: preset.dataUrl }))}
                        className={`aspect-[16/9] rounded-xl overflow-hidden border-2 transition-all relative ${
                          form.posterImage === preset.dataUrl
                            ? "border-amber-500 ring-2 ring-amber-400"
                            : "border-slate-200 opacity-70 hover:opacity-100"
                        }`}
                        title={preset.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preset.dataUrl} alt={preset.name} className="w-full h-full object-cover" />
                        {form.posterImage === preset.dataUrl && (
                          <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white bg-amber-600 rounded-full p-0.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Upload File */}
                {posterInputMode === "upload" && (
                  <div className="pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-5 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl bg-white flex flex-col items-center justify-center text-xs text-slate-700 hover:text-amber-800 transition-colors"
                    >
                      <Upload className="w-5 h-5 mb-1.5 text-slate-400" />
                      <span className="font-bold">Klik untuk memilih file gambar dari komputer</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">Format PNG, JPG, SVG, WebP (Maksimal 2 MB)</span>
                    </button>
                  </div>
                )}

                {/* URL Input */}
                {posterInputMode === "url" && (
                  <div className="pt-1">
                    <input
                      type="url"
                      placeholder="https://domain.com/poster-championship.png"
                      value={form.posterImage.startsWith("data:") ? "" : form.posterImage}
                      onChange={(e) => setForm((p) => ({ ...p, posterImage: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}

                {/* Poster Live Preview */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Pratinjau Poster Terpilih:
                  </span>
                  <div className="aspect-[16/9] w-full max-w-sm rounded-xl overflow-hidden border border-slate-300 bg-slate-950 shadow-xs relative">
                    {form.posterImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.posterImage} alt="Pratinjau Poster" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                        Belum ada gambar poster
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SEGMENT 6: POIN PEMBAHASAN & TOMBOL AKSI */}
              <div className="space-y-4 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Poin Pembahasan / Fasilitas Acara
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Satu poin per baris (contoh: Total Hadiah Rp 50.000.000)..."
                    value={form.keyTakeaways}
                    onChange={(e) => setForm((p) => ({ ...p, keyTakeaways: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Gunakan baris baru (Enter) untuk memisahkan setiap poin.
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                      Teks Tombol Aksi Peserta
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Daftar Kompetisi via WhatsApp"
                      value={form.actionText}
                      onChange={(e) => setForm((p) => ({ ...p, actionText: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                      Tipe Respon Tombol
                    </label>
                    <select
                      value={form.actionType}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          actionType: e.target.value as "join-live" | "rsvp" | "recap",
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="rsvp">Form Pendaftaran Event (Registrasi & Verifikasi Akun)</option>
                      <option value="join-live">Masuk Langsung ke Link Acara</option>
                      <option value="recap">Buka Modal Ringkasan Event</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                      Link Grup Telegram Peserta Event
                    </label>
                    <input
                      type="url"
                      placeholder="Contoh: https://t.me/+xxxxxx"
                      value={form.telegramGroupUrl}
                      onChange={(e) => setForm((p) => ({ ...p, telegramGroupUrl: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Tautan grup Telegram yang ditampilkan saat peserta menyelesaikan verifikasi akun.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                      Link Tutorial Pendaftaran Akun (Opsional)
                    </label>
                    <input
                      type="url"
                      placeholder="Contoh: https://drive.google.com/file/d/1kBVRqc8q6XcvHSdqVweg_Fc64Z_u79FV/view?usp=sharing"
                      value={form.tutorialAccountUrl}
                      onChange={(e) => setForm((p) => ({ ...p, tutorialAccountUrl: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Tautan panduan/video pembuatan akun trading yang diberikan kepada peserta baru.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
              >
                {isEditing ? "Simpan Perubahan Event" : "Terbitkan Event Baru"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
