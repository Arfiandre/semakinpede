"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Users,
  Calendar,
  Building2,
  Sliders,
  History,
  ShieldAlert,
} from "lucide-react";
import {
  getDatabaseStats,
  exportFullDatabase,
  importFullDatabase,
  syncStorageWithIndexedDB,
  getAuditLogsDB,
  DatabaseStats,
  DBAuditLog,
  clearAllLeadsDB,
} from "@/lib/db";

export default function DatabaseManager() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [logs, setLogs] = useState<DBAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      await syncStorageWithIndexedDB();
      const [s, l] = await Promise.all([getDatabaseStats(), getAuditLogsDB()]);
      setStats(s);
      setLogs(l.slice(0, 15));
    } catch {
      setFeedback({ type: "error", text: "Gagal memuat status database." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleExport = async () => {
    try {
      const snapshot = await exportFullDatabase();
      const jsonStr = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `semakinpede-database-backup-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("success", "Pencadangan database (JSON snapshot) berhasil diunduh.");
      loadData();
    } catch {
      showToast("error", "Gagal mengekspor cadangan database.");
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Peringatan: Memulihkan database akan memperbarui data leads, events, dan kemitraan sesuai file cadangan. Lanjutkan?")) {
      e.target.value = "";
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const ok = await importFullDatabase(parsed);
      if (ok) {
        showToast("success", "Database berhasil dipulihkan dari cadangan.");
        loadData();
      } else {
        showToast("error", "Format berkas cadangan database tidak valid.");
      }
    } catch {
      showToast("error", "Gagal membaca atau memulihkan berkas JSON.");
    } finally {
      e.target.value = "";
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    await syncStorageWithIndexedDB();
    await loadData();
    showToast("success", "Sinkronisasi dua arah IndexedDB dan LocalStorage berhasil.");
  };

  const handleClearLeads = async () => {
    if (confirm("Hapus seluruh data leads dari database? Tindakan ini tidak dapat dibatalkan.")) {
      await clearAllLeadsDB();
      localStorage.removeItem("kfi_leads");
      await loadData();
      showToast("success", "Data leads dalam database berhasil dikosongkan.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 font-[var(--font-heading)]">
              Penyimpanan Database Terintegrasi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Engine IndexedDB v1 terstruktur untuk leads, events, kemitraan broker, dan log audit
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSync}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
            title="Sinkronkan database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-600" : ""}`} />
            <span>Sinkronkan Data</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Cadangkan Database (.json)</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Pulihkan Database</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Grid Status Database */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {stats?.leadsCount ?? 0}
              </div>
              <div className="text-xs font-medium text-slate-500">Tabel Leads</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {stats?.eventsCount ?? 0}
              </div>
              <div className="text-xs font-medium text-slate-500">Tabel Events</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {stats?.brokersCount ?? 0}
              </div>
              <div className="text-xs font-medium text-slate-500">Tabel Mitra Pialang</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-slate-800">
                IndexedDB v1
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                Penyimpanan Permanen
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Rincian Skema & Log Audit */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Kolom Skema & Status */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>Arsitektur & Status Penyimpanan</span>
            </h3>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              AKTIF
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Database Name</span>
              <span className="font-mono font-bold text-slate-900">semakin_pede_database_v1</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Engine Penyimpanan</span>
              <span className="font-mono font-semibold text-slate-800">IndexedDB API + Fallback</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Kapasitas Batas</span>
              <span className="font-mono text-emerald-700 font-bold">&gt; 1 Gigabyte (Uncapped Quota)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Dukungan Offline</span>
              <span className="font-mono font-semibold text-emerald-700">Ya, 100% Persisten Lokal</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleClearLeads}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan Seluruh Leads</span>
            </button>
          </div>
        </div>

        {/* Kolom Log Audit */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-600" />
              <span>Riwayat Aktivitas Database (Audit Log)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {logs.length} entri terbaru
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Belum ada aktivitas tercatat pada log database.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-bold text-slate-900 text-[11px] bg-slate-200 px-1.5 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Oleh {log.operator || "Superadmin"}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-slate-600 text-[11px] truncate">
                        {log.details}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
