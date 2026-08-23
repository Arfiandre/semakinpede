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
} from "lucide-react";
import Link from "next/link";

interface Lead {
  name: string;
  contactType: "wa" | "telegram" | "email";
  contact: string;
  level: string;
  source: string;
  timestamp: string;
}

const STORAGE_KEY = "kfi_leads";

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [filterContact, setFilterContact] = useState("all");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadLeads = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setLeads(JSON.parse(data));
      }
    } catch {
      console.error("Failed to load leads");
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadLeads();
  }, [loadLeads]);

  const deleteLead = (index: number) => {
    const newLeads = leads.filter((_, i) => i !== index);
    setLeads(newLeads);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLeads));
  };

  const clearAllLeads = () => {
    if (confirm("Hapus semua lead? Tindakan ini tidak bisa dibatalkan.")) {
      setLeads([]);
      localStorage.removeItem(STORAGE_KEY);
    }
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
    wa: <MessageCircle className="w-4 h-4 text-green-500" />,
    telegram: <Send className="w-4 h-4 text-blue-500" />,
    email: <Mail className="w-4 h-4 text-gold-500" />,
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-[var(--font-heading)] text-2xl font-bold">                   Lead Dashboard
                </h1>
                <p className="text-gray-400 text-sm">
                  Komunitas Semakin Pede
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadLeads}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={copyJSON}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Copy JSON"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-5 h-5 text-blue-400" />}
            label="Total Leads"
            value={stats.total}
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-green-400" />}
            label="Hari Ini"
            value={stats.today}
          />
          <StatCard
            icon={<MessageCircle className="w-5 h-5 text-green-500" />}
            label="WhatsApp"
            value={stats.byContact.wa}
          />
          <StatCard
            icon={<Send className="w-5 h-5 text-blue-500" />}
            label="Telegram"
            value={stats.byContact.telegram}
          />
        </div>

        {/* Breakdown Row */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* By Source */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-navy-900 text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gold-500" />
              Leads per Sumber
            </h3>
            {Object.keys(stats.bySource).length === 0 ? (
              <p className="text-gray-400 text-xs">Belum ada data</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.bySource)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => (
                    <div key={source} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-28 truncate">
                        {source}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-gold-400 h-full rounded-full transition-all"
                          style={{
                            width: `${(count / stats.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-navy-900 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* By Level */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-navy-900 text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-500" />
              Leads per Level
            </h3>
            {Object.keys(stats.byLevel).length === 0 ? (
              <p className="text-gray-400 text-xs">Belum ada data</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.byLevel)
                  .sort(([, a], [, b]) => b - a)
                  .map(([level, count]) => (
                    <div key={level} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-28 truncate">
                        {level}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-navy-900 h-full rounded-full transition-all"
                          style={{
                            width: `${(count / stats.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-navy-900 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau kontak..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:border-gold-400 transition-colors"
              />
            </div>

            {/* Source Filter */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm appearance-none"
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
              className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm appearance-none"
            >
              <option value="all">Semua Kontak</option>
              <option value="wa">WhatsApp</option>
              <option value="telegram">Telegram</option>
              <option value="email">Email</option>
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400 mr-1">
              {filtered.length} lead ditampilkan
            </span>
            <button
              onClick={exportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            {leads.length > 0 && (
              <button
                onClick={clearAllLeads}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Semua
              </button>
            )}
          </div>
        </div>

        {/* Leads Table */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-navy-900 mb-1">
              {leads.length === 0
                ? "Belum ada lead"
                : "Tidak ada hasil yang cocok"}
            </h3>
            <p className="text-gray-400 text-sm">
              {leads.length === 0
                ? "Lead akan muncul di sini setelah ada yang mengisi form."
                : "Coba ubah filter atau kata kunci pencarian."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Kontak
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sumber
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((lead, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {leads.indexOf(lead) + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-navy-900 text-sm">
                          {lead.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {contactIcons[lead.contactType]}
                          <span className="text-sm text-gray-600">
                            {lead.contact}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                          {lead.level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {new Date(lead.timestamp).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteLead(leads.indexOf(lead))}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
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
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((lead, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-navy-900 text-sm">
                      {lead.name}
                    </div>
                    <button
                      onClick={() => deleteLead(leads.indexOf(lead))}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {contactIcons[lead.contactType]}
                    <span className="text-sm text-gray-600">
                      {lead.contact}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                      {lead.level}
                    </span>
                    <span>{lead.source}</span>
                    <span>
                      {new Date(lead.timestamp).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-gray-400 text-xs mt-8">
          ⓘ Data disimpan di browser ini (localStorage). Untuk dashboard
          server-side, hubungi developer.
        </p>
      </div>
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
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-navy-900/5 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-navy-900">{value}</div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}
