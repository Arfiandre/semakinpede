"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, Head } from "@inertiajs/react";
import {
  ArrowLeft,
  Trophy,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from "lucide-react";
import CompetitionParticipantsManager, {
  ParticipantItem,
} from "@/components/admin/CompetitionParticipantsManager";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import {
  isSuperadminAuthenticated,
  logoutSuperadmin,
  getActiveSession,
  touchSession,
  AUTH_EVENT_NAME,
} from "@/lib/authStorage";

interface ParticipantsPageProps {
  initialParticipants?: any[];
}

export default function ParticipantsPage({
  initialParticipants = [],
}: ParticipantsPageProps) {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [adminUsername, setAdminUsername] = useState<string>("superadmin");

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

  useEffect(() => {
    setMounted(true);
    checkAuth();

    const handleAuthEvent = () => {
      checkAuth();
    };

    window.addEventListener(AUTH_EVENT_NAME, handleAuthEvent);
    window.addEventListener("storage", handleAuthEvent);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handleAuthEvent);
      window.removeEventListener("storage", handleAuthEvent);
    };
  }, [checkAuth]);

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

  if (!isAuthenticated) {
    return (
      <AdminLoginForm
        onSuccess={() => {
          checkAuth();
        }}
      />
    );
  }

  // Format initial participants from Laravel if provided
  const formattedInitial: ParticipantItem[] = initialParticipants.map((l) => ({
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
  }));

  return (
    <div className="min-h-screen bg-slate-100/70">
      <Head title="Data Partisipan Lomba - Superadmin Semakin Pede" />

      {/* Top Navbar */}
      <header className="bg-navy-950 text-white border-b border-navy-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Link
                href="/admin"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors"
                title="Kembali ke Superadmin Dashboard"
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
                  Data Partisipan Trading Competition
                </h1>
              </div>
            </div>

            {/* Quick Actions & Auth Control */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                <span>Dashboard Utama</span>
              </Link>

              <Link
                href="/#event"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
                <span>Lihat Web</span>
              </Link>

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
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CompetitionParticipantsManager initialData={formattedInitial} />
      </main>
    </div>
  );
}
