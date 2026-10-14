"use client";

import { useState } from "react";
import {
  ShieldCheck,
  X,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import {
  getSecuritySettings,
  changeSuperadminPassword,
  resetSuperadminSecurityToDefault,
  DEFAULT_USERNAME,
  DEFAULT_PASSWORD_PLAIN,
} from "@/lib/authStorage";

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function SecuritySettingsModal({
  isOpen,
  onClose,
  onUpdated,
}: SecuritySettingsModalProps) {
  const [currentUsername, setCurrentUsername] = useState(
    () => getSecuritySettings().username
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState(
    () => getSecuritySettings().username
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg("Masukkan kata sandi saat ini untuk konfirmasi.");
      return;
    }

    if (!newPassword) {
      setErrorMsg("Masukkan kata sandi baru.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("Kata sandi baru minimal harus 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      if (typeof window !== "undefined" && (window as any).axios) {
        await (window as any).axios.post("/api/admin/security/password", {
          current_password: currentPassword,
          new_password: newPassword,
          new_username: newUsername,
        });
      }

      await changeSuperadminPassword(
        currentPassword,
        newPassword,
        newUsername
      );

      setSuccessMsg("Kredensial superadmin berhasil diperbarui di database server.");
      setCurrentUsername(newUsername);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (onUpdated) onUpdated();
    } catch (err: any) {
      if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg("Gagal memperbarui kredensial di server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefault = () => {
    if (
      confirm(
        `Reset kredensial ke default sistem?\nUsername: ${DEFAULT_USERNAME}\nPassword: ${DEFAULT_PASSWORD_PLAIN}`
      )
    ) {
      resetSuperadminSecurityToDefault();
      setNewUsername(DEFAULT_USERNAME);
      setCurrentUsername(DEFAULT_USERNAME);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg(
        `Kredensial berhasil dikembalikan ke default: ${DEFAULT_USERNAME} / ${DEFAULT_PASSWORD_PLAIN}`
      );
      if (onUpdated) onUpdated();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Pengaturan Akses Superadmin
              </h2>
              <p className="text-xs text-slate-400">
                Ubah nama pengguna atau kata sandi portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
            <span className="text-slate-600">Akun Saat Ini:</span>
            <span className="font-mono font-bold text-slate-900">
              {currentUsername}
            </span>
          </div>

          {/* New Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Nama Pengguna Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Kata Sandi Saat Ini
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showCurrentPass ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama"
                required
                className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showCurrentPass ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Kata Sandi Baru (Min. 8 Karakter)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showNewPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kata sandi baru yang kuat"
                required
                className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showNewPass ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Ulangi Kata Sandi Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi baru"
                required
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {isLoading ? "Menyimpan..." : "Simpan Kredensial Baru"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
