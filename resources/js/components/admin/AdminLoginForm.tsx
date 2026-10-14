"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Clock,
  KeyRound,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Link } from "@inertiajs/react";
import {
  authenticateSuperadmin,
  getSecuritySettings,
  DEFAULT_USERNAME,
  DEFAULT_PASSWORD_PLAIN,
} from "@/lib/authStorage";

interface AdminLoginFormProps {
  onSuccess: () => void;
}

export default function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockRemainingSeconds, setLockRemainingSeconds] = useState<number>(0);
  const [showDefaultHint, setShowDefaultHint] = useState(false);
  const [copiedHint, setCopiedHint] = useState<string | null>(null);

  // Periksa apakah sedang dalam status lockout
  useEffect(() => {
    const checkLockStatus = () => {
      const settings = getSecuritySettings();
      if (settings.lockedUntil && settings.lockedUntil > Date.now()) {
        const remaining = Math.ceil((settings.lockedUntil - Date.now()) / 1000);
        setLockRemainingSeconds(remaining);
      } else {
        setLockRemainingSeconds(0);
      }
    };

    checkLockStatus();
    const interval = setInterval(checkLockStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage("Silakan lengkapi nama pengguna dan kata sandi.");
      return;
    }

    if (lockRemainingSeconds > 0) {
      setErrorMessage(
        `Portal terkunci sementara. Silakan tunggu ${lockRemainingSeconds} detik lagi.`
      );
      return;
    }

    setIsLoading(true);

    try {
      // Delay halus 250ms untuk feel keamanan dan mencegah brute-force instan
      await new Promise((r) => setTimeout(r, 250));

      const res = await authenticateSuperadmin(username, password, rememberMe);

      if (res.success) {
        onSuccess();
      } else {
        setErrorMessage(
          res.error || "Gagal masuk. Periksa kembali kredensial superadmin Anda."
        );
        if (res.lockedUntil) {
          const remaining = Math.ceil((res.lockedUntil - Date.now()) / 1000);
          setLockRemainingSeconds(remaining);
        }
      }
    } catch {
      setErrorMessage("Terjadi kesalahan teknis saat memproses autentikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setUsername(DEFAULT_USERNAME);
    setPassword(DEFAULT_PASSWORD_PLAIN);
    setCopiedHint("Kredensial bawaan berhasil diisikan ke form.");
    setTimeout(() => setCopiedHint(null), 3000);
  };

  const isLocked = lockRemainingSeconds > 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-amber-500 selection:text-navy-950">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Navigasi Balik ke Website */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Semakin Pede</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-400 border border-slate-800 px-2 py-0.5 rounded-md bg-slate-900/60">
            PROD GUARD
          </span>
        </div>

        {/* Card Header & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-[var(--font-heading)]">
            Akses Portal Superadmin
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Halaman ini dilindungi secara khusus untuk mengelola event,
            kemitraan pialang, dan konfigurasi landing page Semakin Pede.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Banner Peringatan Lockout */}
          {isLocked && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-3">
              <Clock className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="font-semibold text-rose-100 mb-0.5">
                  Akses Terkunci Sementara
                </p>
                <p className="text-rose-300 leading-relaxed">
                  Terlalu banyak percobaan gagal. Silakan tunggu selama{" "}
                  <span className="font-mono font-bold text-white">
                    {Math.floor(lockRemainingSeconds / 60)}m{" "}
                    {lockRemainingSeconds % 60}s
                  </span>{" "}
                  sebelum mencoba kembali.
                </p>
              </div>
            </div>
          )}

          {/* Banner Pesan Error Biasa */}
          {errorMessage && !isLocked && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-950/50 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field Username */}
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
              >
                Nama Pengguna Superadmin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  disabled={isLocked || isLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="superadmin"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Field Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                >
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => setShowDefaultHint(!showDefaultHint)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-medium"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Kredensial Awal?</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isLocked || isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Checkbox Ingat Sesi */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={isLocked || isLoading}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 transition-colors"
                />
                <span className="text-xs text-slate-300">
                  Ingat sesi di perangkat ini (7 hari)
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLocked || isLoading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Masuk ke Dashboard Superadmin</span>
                </>
              )}
            </button>
          </form>

          {/* Drawer Kredensial Awal Bawaan */}
          {showDefaultHint && (
            <div className="mt-6 pt-5 border-t border-slate-800 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 space-y-2">
                <div className="flex items-center justify-between text-amber-400 font-semibold text-[11px] uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Kredensial Default Sistem
                  </span>
                  <button
                    type="button"
                    onClick={fillDefaultCredentials}
                    className="text-amber-400 hover:text-amber-300 underline text-[11px] font-bold"
                  >
                    Gunakan Otomatis
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-sans">
                      Username:
                    </span>
                    <span className="text-white font-bold">{DEFAULT_USERNAME}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-sans">
                      Password:
                    </span>
                    <span className="text-white font-bold">{DEFAULT_PASSWORD_PLAIN}</span>
                  </div>
                </div>
                {copiedHint && (
                  <p className="text-emerald-400 text-[11px] flex items-center gap-1 mt-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    {copiedHint}
                  </p>
                )}
                <p className="text-slate-400 text-[10px] leading-relaxed pt-1">
                  Catatan: Setelah berhasil masuk, Anda dapat memperbarui kata
                  sandi melalui menu pengaturan keamanan di header dashboard.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="mt-8 text-center text-[11px] text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Autentikasi Terenkripsi Lokal & Dilindungi Pembatas Frekuensi</span>
          </p>
          <p className="text-slate-400">
            Hak Cipta © 2026 Semakin Pede. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}
