"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Trophy,
  Users,
  Search,
  Download,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  FileCheck,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Maximize2,
  Phone,
  Mail,
  User,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";
import { getAllLeadsDB, DBLead } from "@/lib/db";

export interface ParticipantItem {
  id: string;
  name: string;
  contactType: "wa" | "telegram" | "email";
  contact: string;
  level: string;
  source: string;
  timestamp: string;
  notes?: string;
  eventId?: string;
  eventTitle?: string;
  hasAccount?: "sudah" | "belum";
  demoAccountNumber?: string;
  demoInvestorPassword?: string;
  screenshotRealAccount?: string;
  screenshotTransfer?: string;
}

interface CompetitionParticipantsManagerProps {
  initialData?: ParticipantItem[];
}

export default function CompetitionParticipantsManager({
  initialData = [],
}: CompetitionParticipantsManagerProps) {
  const [participants, setParticipants] = useState<ParticipantItem[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterAccount, setFilterAccount] = useState<"all" | "sudah" | "belum">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "complete" | "initial">("all");
  const [filterEvent, setFilterEvent] = useState<string>("all");

  // State for Password visibility per participant ID
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // State for Copied feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // State for Image Preview Modal
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  // State for Detail Modal
  const [detailItem, setDetailItem] = useState<ParticipantItem | null>(null);

  // Load participants from Server & IndexedDB
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const combinedMap = new Map<string, ParticipantItem>();

    // 1. Load from Initial Data prop
    initialData.forEach((item) => {
      combinedMap.set(item.id, item);
    });

    // 2. Fetch from Backend Laravel API
    try {
      const res = await fetch("/api/leads", {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const serverLeads = await res.json();
        if (Array.isArray(serverLeads)) {
          serverLeads.forEach((l: any) => {
            const mapped: ParticipantItem = {
              id: l.id || `lead-${Math.random()}`,
              name: l.name || "-",
              contactType: (l.contact_type || l.contactType || "wa") as any,
              contact: l.contact || "-",
              level: l.level || "Peserta Event",
              source: l.source || "Event",
              timestamp: l.submitted_at || l.created_at || l.timestamp || new Date().toISOString(),
              notes: l.notes || undefined,
              eventId: l.event_id || l.eventId || undefined,
              eventTitle: l.event_title || l.eventTitle || undefined,
              hasAccount: (l.has_account || l.hasAccount || undefined) as any,
              demoAccountNumber: l.demo_account_number || l.demoAccountNumber || undefined,
              demoInvestorPassword: l.demo_investor_password || l.demoInvestorPassword || undefined,
              screenshotRealAccount: l.screenshot_real_account || l.screenshotRealAccount || undefined,
              screenshotTransfer: l.screenshot_transfer || l.screenshotTransfer || undefined,
            };

            // Filter: only event registrations or competition leads
            const isEventParticipant =
              Boolean(mapped.eventId) ||
              Boolean(mapped.eventTitle) ||
              Boolean(mapped.demoAccountNumber) ||
              Boolean(mapped.hasAccount) ||
              mapped.source.toLowerCase().includes("event");

            if (isEventParticipant) {
              combinedMap.set(mapped.id, mapped);
            }
          });
        }
      }
    } catch {
      // Backend may be offline or local
    }

    // 3. Fetch from Client-side IndexedDB
    try {
      const dbLeads = await getAllLeadsDB();
      if (Array.isArray(dbLeads)) {
        dbLeads.forEach((l: DBLead) => {
          const isEventParticipant =
            Boolean(l.eventId) ||
            Boolean(l.eventTitle) ||
            Boolean(l.demoAccountNumber) ||
            Boolean(l.hasAccount) ||
            l.source.toLowerCase().includes("event");

          if (isEventParticipant) {
            combinedMap.set(l.id, {
              id: l.id,
              name: l.name,
              contactType: l.contactType,
              contact: l.contact,
              level: l.level,
              source: l.source,
              timestamp: l.timestamp,
              notes: l.notes,
              eventId: l.eventId,
              eventTitle: l.eventTitle,
              hasAccount: l.hasAccount,
              demoAccountNumber: l.demoAccountNumber,
              demoInvestorPassword: l.demoInvestorPassword,
              screenshotRealAccount: l.screenshotRealAccount,
              screenshotTransfer: l.screenshotTransfer,
            });
          }
        });
      }
    } catch {
      // IndexedDB unavailable
    }

    // Convert map to sorted array by timestamp desc
    const sorted = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setParticipants(sorted);
    setIsLoading(false);
  }, [initialData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle password visibility
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete participant
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data partisipan ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    // Try deleting from backend
    try {
      await fetch(`/api/leads/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
    } catch {}

    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  // Unique Events for filter
  const eventOptions = useMemo(() => {
    const set = new Set<string>();
    participants.forEach((p) => {
      if (p.eventTitle) set.add(p.eventTitle);
    });
    return Array.from(set);
  }, [participants]);

  // Filtered List
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      // Search
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.contact.toLowerCase().includes(q) ||
        (p.demoAccountNumber && p.demoAccountNumber.toLowerCase().includes(q)) ||
        (p.eventTitle && p.eventTitle.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Filter Account
      if (filterAccount !== "all" && p.hasAccount !== filterAccount) {
        return false;
      }

      // Filter Status
      if (filterStatus === "complete") {
        const hasDemo = Boolean(p.demoAccountNumber);
        if (!hasDemo) return false;
      } else if (filterStatus === "initial") {
        const hasDemo = Boolean(p.demoAccountNumber);
        if (hasDemo) return false;
      }

      // Filter Event
      if (filterEvent !== "all" && p.eventTitle !== filterEvent) {
        return false;
      }

      return true;
    });
  }, [participants, search, filterAccount, filterStatus, filterEvent]);

  // Statistics
  const stats = useMemo(() => {
    const total = participants.length;
    const sudah = participants.filter((p) => p.hasAccount === "sudah").length;
    const belum = participants.filter((p) => p.hasAccount === "belum").length;
    const withDemo = participants.filter((p) => Boolean(p.demoAccountNumber)).length;
    const withRealScreenshot = participants.filter((p) => Boolean(p.screenshotRealAccount)).length;

    return { total, sudah, belum, withDemo, withRealScreenshot };
  }, [participants]);

  // Export to CSV
  const exportCSV = () => {
    const headers = [
      "No",
      "Nama Peserta",
      "Kanal Kontak",
      "Nomor Kontak",
      "Event Lomba",
      "Status Akun Trading",
      "Nomor Akun Demo MT5",
      "Investor Password",
      "Bukti Akun Riil",
      "Bukti Transfer",
      "Tanggal Pendaftaran",
      "Catatan",
    ];

    const rows = filteredParticipants.map((p, idx) => [
      idx + 1,
      `"${p.name.replace(/"/g, '""')}"`,
      p.contactType.toUpperCase(),
      `"${p.contact}"`,
      `"${(p.eventTitle || "-").replace(/"/g, '""')}"`,
      p.hasAccount === "sudah" ? "Sudah Punya Akun" : "Belum Punya Akun",
      `"${p.demoAccountNumber || "-"}"`,
      `"${p.demoInvestorPassword || "-"}"`,
      p.screenshotRealAccount ? "Ada Screenshot" : "Tidak Ada",
      p.screenshotTransfer ? "Ada Bukti Transfer" : "Tidak Ada",
      `"${new Date(p.timestamp).toLocaleString("id-ID")}"`,
      `"${(p.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `data-partisipan-lomba-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export to JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredParticipants, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `data-partisipan-lomba-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Trophy className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Manajemen Partisipan Event & Lomba
            </span>
          </div>
          <h2 className="font-[var(--font-heading)] text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Data Partisipan Lomba & Verifikasi Akun
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Daftar lengkap member yang telah mengisi formulir event trading competition,
            termasuk rincian akun demo MT5, investor password, serta bukti verifikasi screenshot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all border border-white/10"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Perbarui Data</span>
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={exportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Pendaftar</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {stats.total}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Formulir Terisi</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Sudah Punya Akun</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
            {stats.sudah}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Kategori Akun Riil</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Belum Punya Akun</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
            {stats.belum}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Perlu Bantuan Akun</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Akun MT5 Terisi</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 font-mono">
            {stats.withDemo}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Akun Demo & Sandi</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Bukti Terunggah</span>
            <FileCheck className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 font-mono">
            {stats.withRealScreenshot}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Dokumen Screenshot</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, WhatsApp, atau nomor akun demo MT5..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Filter Status Akun */}
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Status Akun</option>
            <option value="sudah">Sudah Punya Akun</option>
            <option value="belum">Belum Punya Akun</option>
          </select>

          {/* Filter Kelengkapan Verifikasi */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Tahap Registrasi</option>
            <option value="complete">Lengkap (Akun Demo MT5 Terisi)</option>
            <option value="initial">Registrasi Awal Saja</option>
          </select>

          {/* Filter Event jika ada lebih dari 1 */}
          {eventOptions.length > 1 && (
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Semua Agenda Lomba</option>
              {eventOptions.map((ev) => (
                <option key={ev} value={ev}>
                  {ev}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Menampilkan <strong>{filteredParticipants.length}</strong> dari{" "}
            <strong>{participants.length}</strong> total partisipan
          </span>
          {(search || filterAccount !== "all" || filterStatus !== "all" || filterEvent !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterAccount("all");
                setFilterStatus("all");
                setFilterEvent("all");
              }}
              className="text-amber-700 hover:text-amber-800 font-bold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      {filteredParticipants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base mb-1">
            Tidak Ada Data Partisipan
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
            {search || filterAccount !== "all" || filterStatus !== "all"
              ? "Tidak ada pendaftar yang cocok dengan filter pencarian saat ini."
              : "Belum ada peserta yang mengisi formulir registrasi event. Data akan muncul otomatis saat ada pendaftar baru."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Peserta</th>
                  <th className="px-4 py-3.5">Kontak</th>
                  <th className="px-4 py-3.5">Event Lomba</th>
                  <th className="px-4 py-3.5">Status Akun</th>
                  <th className="px-4 py-3.5">Akun Demo MT5</th>
                  <th className="px-4 py-3.5">Bukti Berkas</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredParticipants.map((p, idx) => {
                  const cleanPhone = p.contact.replace(/[^0-9]/g, "");
                  const formattedPhone = cleanPhone.startsWith("0")
                    ? "62" + cleanPhone.slice(1)
                    : cleanPhone.startsWith("62")
                    ? cleanPhone
                    : "62" + cleanPhone;
                  const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
                    `Halo ${p.name}, saya Admin Semakin Pede ingin mengonfirmasi pendaftaran Anda untuk event ${p.eventTitle || "Trading Competition"}.`
                  )}`;

                  const isPasswordVisible = visiblePasswords[p.id];
                  const hasDemo = Boolean(p.demoAccountNumber);
                  const hasRealPic = Boolean(p.screenshotRealAccount);
                  const hasTransferPic = Boolean(p.screenshotTransfer);

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* No */}
                      <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Peserta */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-950 text-sm">{p.name}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(p.timestamp).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Kontak */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono font-bold text-slate-900 hover:text-emerald-600 transition-colors bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded-md border border-slate-200"
                            title="Chat via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>{p.contact}</span>
                          </a>
                        </div>
                      </td>

                      {/* Event Lomba */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <span className="font-semibold text-slate-800 line-clamp-1 block">
                          {p.eventTitle || "Trading Semakin Pede Competition"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {p.source.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Status Akun */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {p.hasAccount === "sudah" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Sudah Punya
                          </span>
                        ) : p.hasAccount === "belum" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Belum Punya
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">-</span>
                        )}
                      </td>

                      {/* Akun Demo MT5 & Sandi */}
                      <td className="px-4 py-3.5">
                        {hasDemo ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 font-mono text-xs">
                              <span className="text-slate-500 font-normal text-[10px]">No:</span>
                              <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                                {p.demoAccountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(p.demoAccountNumber || "", `acc-${p.id}`)}
                                className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 transition-colors"
                                title="Salin Nomor Akun"
                              >
                                {copiedId === `acc-${p.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {p.demoInvestorPassword && (
                              <div className="flex items-center gap-1 font-mono text-xs">
                                <span className="text-slate-500 font-normal text-[10px]">Pass:</span>
                                <span className="font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded">
                                  {isPasswordVisible ? p.demoInvestorPassword : "••••••••"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(p.id)}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 transition-colors"
                                  title={isPasswordVisible ? "Sembunyikan Password" : "Lihat Password"}
                                >
                                  {isPasswordVisible ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(p.demoInvestorPassword || "", `pass-${p.id}`)}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 transition-colors"
                                  title="Salin Password"
                                >
                                  {copiedId === `pass-${p.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Belum Submit Akun
                          </span>
                        )}
                      </td>

                      {/* Bukti Dokumen Screenshot */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {hasRealPic && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  url: p.screenshotRealAccount!,
                                  title: `Bukti Akun Riil - ${p.name}`,
                                  subtitle: `Event: ${p.eventTitle || "Trading Competition"}`,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold border border-blue-200 transition-colors cursor-pointer"
                              title="Lihat Bukti Akun Riil"
                            >
                              <ImageIcon className="w-3 h-3 text-blue-600" />
                              <span>Akun Riil</span>
                            </button>
                          )}

                          {hasTransferPic && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  url: p.screenshotTransfer!,
                                  title: `Bukti Transfer - ${p.name}`,
                                  subtitle: `Event: ${p.eventTitle || "Trading Competition"}`,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200 transition-colors cursor-pointer"
                              title="Lihat Bukti Transfer"
                            >
                              <FileCheck className="w-3 h-3 text-emerald-600" />
                              <span>Transfer</span>
                            </button>
                          )}

                          {!hasRealPic && !hasTransferPic && (
                            <span className="text-[10px] text-slate-400 font-medium italic">
                              Tidak ada berkas
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailItem(p)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Rincian Lengkap Peserta"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="Chat WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Hapus Partisipan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: PREVIEW BUKTI SCREENSHOT */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-white">{previewImage.title}</h4>
                {previewImage.subtitle && (
                  <p className="text-[11px] text-slate-400">{previewImage.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-auto">
              {previewImage.url.startsWith("data:") || previewImage.url.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs">
                    File tercatat sebagai nama:{" "}
                    <strong className="text-white font-mono">{previewImage.url}</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RINCIAN LENGKAP PARTISIPAN */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{detailItem.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {detailItem.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-800">
              {/* Event Info */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Agenda Lomba yang Diikuti
                </span>
                <div className="font-bold text-slate-950 text-sm">
                  {detailItem.eventTitle || "Trading Semakin Pede Competition"}
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-2 pt-1 font-mono">
                  <span>Waktu Daftar: {new Date(detailItem.timestamp).toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Identity & Contact */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Nama Lengkap
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{detailItem.name}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Kontak / WhatsApp
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      {detailItem.contact}
                    </span>
                    <a
                      href={`https://wa.me/${detailItem.contact.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      title="Buka WA"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Trading Account Credentials */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Akun MetaTrader 5 (Demo Lomba)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {detailItem.hasAccount === "sudah" ? "Sudah Ada Akun" : "Perlu Panduan"}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Nomor Akun Demo:</span>
                    <span className="text-white font-bold text-sm bg-slate-800 px-2 py-1 rounded block">
                      {detailItem.demoAccountNumber || "Belum diisi"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Investor Password:</span>
                    <span className="text-amber-400 font-bold text-sm bg-slate-800 px-2 py-1 rounded block">
                      {detailItem.demoInvestorPassword || "Belum diisi"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Dokumen Pendukung Terlampir
                </span>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {detailItem.screenshotRealAccount ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImage({
                          url: detailItem.screenshotRealAccount!,
                          title: `Screenshot Akun Riil - ${detailItem.name}`,
                        })
                      }
                      className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-left hover:bg-blue-100/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-blue-900 text-xs">Bukti Akun Riil</span>
                      </div>
                      <span className="text-[10px] text-blue-700">Klik untuk melihat gambar</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs italic">
                      Tidak ada screenshot akun riil
                    </div>
                  )}

                  {detailItem.screenshotTransfer ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImage({
                          url: detailItem.screenshotTransfer!,
                          title: `Screenshot Bukti Transfer - ${detailItem.name}`,
                        })
                      }
                      className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-left hover:bg-emerald-100/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-emerald-900 text-xs">Bukti Transfer</span>
                      </div>
                      <span className="text-[10px] text-emerald-700">Klik untuk melihat gambar</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs italic">
                      Tidak ada bukti transfer
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {detailItem.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Catatan Pendaftaran
                  </span>
                  <p className="text-slate-700 text-xs leading-relaxed">{detailItem.notes}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDelete(detailItem.id)}
                className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
              >
                Hapus Data
              </button>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
