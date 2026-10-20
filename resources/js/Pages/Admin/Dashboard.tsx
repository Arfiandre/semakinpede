"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  TrendingUp,
  MessageCircle,
  Send,
  Mail,
  Download,
  Search,
  Trash2,
  RefreshCw,
  BarChart3,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Sliders,
  Building2,
  Radio,
  LogOut,
  KeyRound,
  Database,
  Trophy,
} from "lucide-react";
import { Link, Head } from "@inertiajs/react";
import EventCrudManager from "@/components/admin/EventCrudManager";
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";
import BrokerCrudManager from "@/components/admin/BrokerCrudManager";
import ForexFactoryNewsManager from "@/components/admin/ForexFactoryNewsManager";
import DatabaseManager from "@/components/admin/DatabaseManager";
import CompetitionParticipantsManager from "@/components/admin/CompetitionParticipantsManager";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import SecuritySettingsModal from "@/components/admin/SecuritySettingsModal";
import { deleteLeadDB, clearAllLeadsDB } from "@/lib/db";
import {
  isSuperadminAuthenticated,
  logoutSuperadmin,
  getActiveSession,
  touchSession,
  AUTH_EVENT_NAME,
} from "@/lib/authStorage";

interface Lead {
  id?: string;
  name: string;
  contactType: "wa" | "telegram" | "email";
  contact: string;
  level: string;
  source: string;
  timestamp: string;
}

interface DashboardProps {
  initialLeads?: any[];
  initialEvents?: any[];
  initialBrokers?: any[];
  initialNews?: any[];
  initialSettings?: any;
  initialStats?: any;
  auditLogs?: any[];
}

const STORAGE_KEY = "kfi_leads";

export default function AdminPage({ initialLeads = [] }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "events" | "brokers" | "news" | "settings" | "leads" | "database" | "participants"
  >("events");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [filterContact, setFilterContact] = useState("all");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [adminUsername, setAdminUsername] = useState<string>("superadmin");
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);

  const checkAuth = useCallback(() => {
    const authed = isSuperadminAuthenticated();
    setIsAuthenticated(authed);
    if (authed) {
      const session = getActiveSession();
      if (session) {
        setAdminUsername(session.username);
        touchSession();
      }
    }
    setAuthChecking(false);
  }, []);

  const loadLeads = useCallback(async () => {
    setIsLoadingLeads(true);
    try {
      const combinedMap = new Map<string, Lead>();

      const getLeadKey = (item: any): string => {
        const contact = (item.contact || "").trim();
        const digits = contact.replace(/[^0-9]/g, "");
        const suffix = digits.length >= 8 ? digits.slice(-9) : contact;
        const name = (item.name || "").trim().toLowerCase();
        if (suffix && name && name !== "-") {
          return `contact:${suffix}:${name}`;
        }
        if (suffix) {
          return `phone:${suffix}`;
        }
        return `id:${item.id || Math.random()}`;
      };

      const upsertLead = (leadObj: Lead) => {
        const key = getLeadKey(leadObj);
        if (!combinedMap.has(key)) {
          combinedMap.set(key, leadObj);
        } else {
          const existing = combinedMap.get(key)!;
          // Prefer existing server ID or non-hyphen name
          combinedMap.set(key, {
            ...leadObj,
            ...existing,
            name: existing.name !== "-" ? existing.name : leadObj.name,
            timestamp:
              new Date(leadObj.timestamp).getTime() > new Date(existing.timestamp).getTime()
                ? leadObj.timestamp
                : existing.timestamp,
          });
        }
      };

      // 1. Initial Leads dari database Laravel
      if (Array.isArray(initialLeads)) {
        initialLeads.forEach((l: any) => {
          upsertLead({
            id: l.id,
            name: l.name || "-",
            contactType: (l.contact_type || l.contactType || "wa") as any,
            contact: l.contact || "-",
            level: l.level || "Pemula",
            source: l.source || "Website",
            timestamp: l.submitted_at || l.created_at || new Date().toISOString(),
          });
        });
      }

      // 2. Fetch data realtime dari endpoint /api/leads
      try {
        const res = await fetch("/api/leads", {
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const serverData = await res.json();
          if (Array.isArray(serverData)) {
            serverData.forEach((l: any) => {
              upsertLead({
                id: l.id,
                name: l.name || "-",
                contactType: (l.contact_type || l.contactType || "wa") as any,
                contact: l.contact || "-",
                level: l.level || "Pemula",
                source: l.source || "Website",
                timestamp: l.submitted_at || l.created_at || new Date().toISOString(),
              });
            });
          }
        }
      } catch {}

      // 3. Gabungkan dengan localStorage jika ada
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const localList = JSON.parse(raw);
          if (Array.isArray(localList)) {
            localList.forEach((l: any) => {
              upsertLead({
                id: l.id,
                name: l.name || "-",
                contactType: (l.contact_type || l.contactType || "wa") as any,
                contact: l.contact || "-",
                level: l.level || "Pemula",
                source: l.source || "Website",
                timestamp: l.timestamp || l.submitted_at || new Date().toISOString(),
              });
            });
          }
        }
      } catch {}

      const sorted = Array.from(combinedMap.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setLeads(sorted);
    } catch {
      console.error("Gagal memuat data lead");
    } finally {
      setIsLoadingLeads(false);
    }
  }, [initialLeads]);

  useEffect(() => {
    setMounted(true);
    checkAuth();
    loadLeads();

    const handleAuthEvent = () => {
      checkAuth();
    };

    window.addEventListener(AUTH_EVENT_NAME, handleAuthEvent);
    window.addEventListener("storage", handleAuthEvent);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handleAuthEvent);
      window.removeEventListener("storage", handleAuthEvent);
    };
  }, [checkAuth, loadLeads]);

  const deleteLead = async (leadToDelete: Lead) => {
    if (!confirm(`Hapus lead "${leadToDelete.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    const leadId = leadToDelete.id;

    // 1. Langsung hapus dari state UI
    const newLeads = leads.filter((l) => l !== leadToDelete);
    setLeads(newLeads);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLeads));

    // 2. Hapus dari IndexedDB & server
    if (leadId) {
      try {
        await deleteLeadDB(leadId);
      } catch {}

      try {
        if (typeof window !== "undefined" && (window as any).axios) {
          await (window as any).axios.delete(`/api/leads/${leadId}`);
        } else {
          const csrf = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
          await fetch(`/api/leads/${leadId}`, {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              "X-CSRF-TOKEN": csrf,
              "X-Requested-With": "XMLHttpRequest",
            },
          });
        }
      } catch (err) {
        console.warn("Gagal hapus lead di server:", err);
      }
    }
  };

  const clearAllLeads = async () => {
    if (!confirm("Hapus semua lead? Tindakan ini tidak bisa dibatalkan.")) {
      return;
    }

    try {
      if (typeof window !== "undefined" && (window as any).axios) {
        await (window as any).axios.delete("/api/leads");
      } else {
        const csrf = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
        await fetch("/api/leads", {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "X-CSRF-TOKEN": csrf,
            "X-Requested-With": "XMLHttpRequest",
          },
        });
      }
    } catch {}

    try {
      await clearAllLeadsDB();
    } catch {}

    setLeads([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(leads, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, `leads-${formatDateForFile(new Date())}.json`);
  };

  const exportCSV = () => {
    const headers = ["Nama", "Tipe Kontak", "Kontak", "Level", "Sumber", "Waktu"];
    const rows = leads.map((l) => [
      l.name,
      l.contactType.toUpperCase(),
      l.contact,
      l.level,
      l.source,
      new Date(l.timestamp).toLocaleString("id-ID"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `leads-${formatDateForFile(new Date())}.csv`);
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(leads, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDateForFile = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Filter leads
  const filtered = leads.filter((lead) => {
    const matchSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.contact.toLowerCase().includes(search.toLowerCase());
    const matchSource = filterSource === "all" || lead.source === filterSource;
    const matchContact =
      filterContact === "all" || lead.contactType === filterContact;
    return matchSearch && matchSource && matchContact;
  });

  // Stats
  const stats = {
    total: leads.length,
    byContact: {
      wa: leads.filter((l) => l.contactType === "wa").length,
      telegram: leads.filter((l) => l.contactType === "telegram").length,
      email: leads.filter((l) => l.contactType === "email").length,
    },
    bySource: leads.reduce(
      (acc, l) => {
        acc[l.source] = (acc[l.source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byLevel: leads.reduce(
      (acc, l) => {
        acc[l.level] = (acc[l.level] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    today: leads.filter(
      (l) => new Date(l.timestamp).toDateString() === new Date().toDateString()
    ).length,
  };

  const sources = [...new Set(leads.map((l) => l.source))];

  const contactIcons = {
    wa: <MessageCircle className="w-4 h-4 text-emerald-500" />,
    telegram: <Send className="w-4 h-4 text-sky-500" />,
    email: <Mail className="w-4 h-4 text-amber-500" />,
  };

  if (!mounted || authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase font-mono">
          Memeriksa Hak Akses Superadmin...
        </p>
      </div>
    );
  }

  // Jika belum login, tampilkan Login Portal anti-bocor
  if (!isAuthenticated) {
    return (
      <AdminLoginForm
        onSuccess={() => {
          checkAuth();
          loadLeads();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70">
      <Head title="Superadmin Panel - Semakin Pede" />
      {/* Superadmin Top Navbar */}
      <header className="bg-navy-950 text-white border-b border-navy-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Link
                href="/"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors"
                title="Kembali ke Landing Page"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider">
                    Superadmin Panel
                  </span>
                </div>
                <h1 className="font-[var(--font-heading)] text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  Pengelolaan Landing Page & Data
                </h1>
              </div>
            </div>

            {/* Quick Actions & Auth Control */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {/* User badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400 font-medium">Masuk sebagai:</span>
                <span className="font-mono font-bold text-amber-400">
                  {adminUsername}
                </span>
              </div>

              {/* Tombol Keamanan Akun */}
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                title="Kelola Keamanan & Kredensial Superadmin"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Keamanan Akun</span>
              </button>

              <Link
                href="/admin/participants"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-xs"
                title="Lihat Data Partisipan Lomba"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Partisipan Lomba</span>
              </Link>

              <Link
                href="/#event"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
                <span>Lihat Web</span>
              </Link>

              {/* Tombol Logout */}
              <button
                type="button"
                onClick={async () => {
                  if (confirm("Keluar dari sesi superadmin?")) {
                    try {
                      if (typeof window !== "undefined" && (window as any).axios) {
                        await (window as any).axios.post("/admin/logout");
                      }
                    } catch {}
                    logoutSuperadmin();
                    window.location.href = "/admin/login";
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold rounded-xl transition-colors"
                title="Keluar dari Portal Superadmin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>

              {activeTab === "leads" && (
                <>
                  <button
                    type="button"
                    onClick={loadLeads}
                    disabled={isLoadingLeads}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-slate-300 hover:text-white disabled:opacity-50"
                    title="Refresh Data Leads"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingLeads ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={copyJSON}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-slate-300 hover:text-white"
                    title="Salin JSON Leads"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-navy-800 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("events")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === "events"
                  ? "bg-gold-400 text-navy-950 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>1. Kelola Event (CRUD)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("brokers")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === "brokers"
                  ? "bg-gold-400 text-navy-950 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>2. Kemitraan Pialang Resmi (CRUD)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("news")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === "news"
                  ? "bg-gold-400 text-navy-950 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>3. Feed ForexFactory (Medium/High)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === "settings"
                  ? "bg-gold-400 text-navy-950 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>4. Pengaturan Landing Page</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("leads")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === "leads"
                  ? "bg-gold-400 text-navy-950 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>5. Data Leads Masuk ({stats.total})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("database")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === "database"
                  ? "bg-gold-400 text-navy-950 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>6. Database & Cadangan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("participants")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === "participants"
                  ? "bg-gold-400 text-navy-950 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>7. Partisipan Lomba</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: KELOLA EVENT (CRUD) */}
        {activeTab === "events" && <EventCrudManager />}

        {/* TAB 2: KELOLA KEMITRAAN PIALANG RESMI (CRUD) */}
        {activeTab === "brokers" && <BrokerCrudManager />}

        {/* TAB 3: FEED BERITA FOREXFACTORY (MEDIUM & HIGH IMPACT) */}
        {activeTab === "news" && <ForexFactoryNewsManager />}

        {/* TAB 4: PENGATURAN LANDING PAGE */}
        {activeTab === "settings" && <SiteSettingsManager />}

        {/* TAB 5: DATA LEADS CRM */}
        {activeTab === "leads" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Users className="w-5 h-5 text-blue-500" />}
                label="Total Leads"
                value={stats.total}
              />
              <StatCard
                icon={<Clock className="w-5 h-5 text-emerald-500" />}
                label="Hari Ini"
                value={stats.today}
              />
              <StatCard
                icon={<MessageCircle className="w-5 h-5 text-emerald-600" />}
                label="WhatsApp"
                value={stats.byContact.wa}
              />
              <StatCard
                icon={<Send className="w-5 h-5 text-sky-500" />}
                label="Telegram"
                value={stats.byContact.telegram}
              />
            </div>

            {/* Toolbar & Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau kontak lead..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Source Filter */}
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
                >
                  <option value="all">Semua Sumber</option>
                  {sources.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {/* Contact Filter */}
                <select
                  value={filterContact}
                  onChange={(e) => setFilterContact(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
                >
                  <option value="all">Semua Kanal</option>
                  <option value="wa">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="email">Email</option>
                </select>
              </div>

              {/* Export Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 mr-1 font-medium">
                  {filtered.length} lead terdaftar
                </span>
                <button
                  type="button"
                  onClick={exportJSON}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-950 hover:bg-navy-900 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={exportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
                {leads.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllLeads}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus Semua
                  </button>
                )}
              </div>
            </div>

            {/* Leads Table */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 text-base mb-1">
                  {leads.length === 0 ? "Belum Ada Lead Masuk" : "Tidak Ada Hasil"}
                </h3>
                <p className="text-slate-500 text-xs">
                  {leads.length === 0
                    ? "Data kontak akan otomatis muncul di sini saat pengunjung mengisi formulir di landing page."
                    : "Coba sesuaikan kata kunci pencarian Anda."}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Nama</th>
                        <th className="px-4 py-3">Kontak</th>
                        <th className="px-4 py-3">Level</th>
                        <th className="px-4 py-3">Sumber</th>
                        <th className="px-4 py-3">Waktu</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {filtered.map((lead, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                            {leads.indexOf(lead) + 1}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {lead.name}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {contactIcons[lead.contactType]}
                              <span className="text-slate-700 font-mono">
                                {lead.contact}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                              {lead.level}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {lead.source}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                            {new Date(lead.timestamp).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => deleteLead(lead)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filtered.map((lead, i) => (
                    <div key={i} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">
                          {lead.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteLead(lead)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        {contactIcons[lead.contactType]}
                        <span className="font-mono">{lead.contact}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                          {lead.level}
                        </span>
                        <span>·</span>
                        <span>{lead.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: DATABASE & CADANGAN */}
        {activeTab === "database" && <DatabaseManager />}

        {/* TAB 7: DATA PARTISIPAN LOMBA */}
        {activeTab === "participants" && <CompetitionParticipantsManager />}
      </main>

      {/* Modal Pengaturan Keamanan Kredensial Superadmin */}
      <SecuritySettingsModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onUpdated={() => {
          checkAuth();
        }}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
            {value}
          </div>
          <div className="text-xs text-slate-500 font-medium">{label}</div>
        </div>
      </div>
    </div>
  );
}
