import {
  AdminSession,
  AdminSecuritySettings,
  LoginResult,
} from "@/types/auth";

export const AUTH_SECURITY_KEY = "kfi_superadmin_security";
export const AUTH_SESSION_KEY = "kfi_superadmin_session";
export const AUTH_EVENT_NAME = "kfi_superadmin_auth_event";

export const DEFAULT_USERNAME = "superadmin";
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 menit
export const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 jam untuk tab aktif
export const REMEMBER_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari jika diingat

export const DEFAULT_SECURITY_SETTINGS: AdminSecuritySettings = {
  username: DEFAULT_USERNAME,
  passwordHash: "",
  salt: "",
  updatedAt: "2026-10-12T12:00:00.000Z",
  failedAttempts: 0,
  lockedUntil: null,
  lastLoginAt: null,
};

export function getSecuritySettings(): AdminSecuritySettings {
  if (typeof window === "undefined") {
    return DEFAULT_SECURITY_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(AUTH_SECURITY_KEY);
    if (!raw) {
      localStorage.setItem(
        AUTH_SECURITY_KEY,
        JSON.stringify(DEFAULT_SECURITY_SETTINGS)
      );
      return DEFAULT_SECURITY_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SECURITY_SETTINGS,
      ...parsed,
      passwordHash: "",
      salt: "",
      username: getActiveSession()?.username || parsed.username || DEFAULT_USERNAME,
    };
  } catch (err) {
    console.error("Gagal membaca kredensial security:", err);
    return DEFAULT_SECURITY_SETTINGS;
  }
}

export function saveSecuritySettings(settings: AdminSecuritySettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_SECURITY_KEY, JSON.stringify({ ...settings, passwordHash: "", salt: "" }));
  } catch (err) {
    console.error("Gagal menyimpan kredensial security:", err);
  }
}

export function getActiveSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  try {
    // Cek sessionStorage terlebih dahulu
    let raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    // Jika tidak ada di sessionStorage, cek localStorage (untuk opsi Remember Me)
    if (!raw) {
      raw = localStorage.getItem(AUTH_SESSION_KEY);
    }
    if (!raw) return null;

    const session: AdminSession = JSON.parse(raw);
    const now = Date.now();

    // Verifikasi batas waktu kedaluwarsa
    if (now > session.expiresAt) {
      logoutSuperadmin();
      return null;
    }

    return session;
  } catch {
    logoutSuperadmin();
    return null;
  }
}

export function isSuperadminAuthenticated(): boolean {
  return getActiveSession() !== null;
}

export function touchSession(): void {
  if (typeof window === "undefined") return;
  const session = getActiveSession();
  if (!session) return;

  const now = Date.now();
  const updatedSession: AdminSession = {
    ...session,
    lastActiveAt: now,
  };

  const raw = JSON.stringify(updatedSession);
  if (session.rememberMe) {
    localStorage.setItem(AUTH_SESSION_KEY, raw);
  } else {
    sessionStorage.setItem(AUTH_SESSION_KEY, raw);
  }
}

export function createAdminSession(
  username: string,
  rememberMe: boolean = false
): AdminSession {
  const token = generateSecureToken();
  const now = Date.now();
  const ttl = rememberMe ? REMEMBER_SESSION_TTL_MS : SESSION_TTL_MS;
  const newSession: AdminSession = {
    token,
    username,
    loginAt: new Date().toISOString(),
    expiresAt: now + ttl,
    rememberMe,
    lastActiveAt: now,
  };

  const rawSession = JSON.stringify(newSession);
  if (rememberMe) {
    localStorage.setItem(AUTH_SESSION_KEY, rawSession);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  } else {
    sessionStorage.setItem(AUTH_SESSION_KEY, rawSession);
    localStorage.removeItem(AUTH_SESSION_KEY);
  }

  const settings = getSecuritySettings();
  const resetSettings: AdminSecuritySettings = {
    ...settings,
    failedAttempts: 0,
    lockedUntil: null,
    lastLoginAt: new Date().toISOString(),
  };
  saveSecuritySettings(resetSettings);

  window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: newSession }));
  return newSession;
}

async function postAdminRequest(path: string, data: Record<string, unknown>): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("Lingkungan tidak didukung.");
  }
  if ((window as any).axios) {
    return (await (window as any).axios.post(path, data)).data;
  }

  const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.message || "Permintaan ditolak server.") as Error & { status: number };
    error.status = response.status;
    throw error;
  }
  return result;
}

export async function authenticateSuperadmin(
  usernameInput: string,
  passwordInput: string,
  rememberMe: boolean
): Promise<LoginResult> {
  try {
    const response = await postAdminRequest("/admin/login", {
      username: usernameInput.trim(),
      password: passwordInput,
      remember: rememberMe,
    });
    if (!response.success) {
      return { success: false, error: response.message || "Login ditolak server." };
    }
    createAdminSession(response.user?.username || usernameInput.trim(), rememberMe);
    return { success: true };
  } catch (error: any) {
    const status = error.response?.status || error.status;
    return {
      success: false,
      error: status === 429
        ? "Terlalu banyak percobaan login. Coba lagi dalam satu menit."
        : error.response?.data?.message || "Gagal masuk ke server. Periksa koneksi dan kredensial Anda.",
      lockedUntil: status === 429 ? Date.now() + 60 * 1000 : undefined,
    };
  }
}

export function logoutSuperadmin(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(AUTH_SESSION_KEY);
    window.dispatchEvent(
      new CustomEvent(AUTH_EVENT_NAME, { detail: null })
    );
  } catch (err) {
    console.error("Gagal logout:", err);
  }
}

export async function changeSuperadminPassword(
  currentPasswordInput: string,
  newPasswordInput: string,
  newUsernameInput?: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window === "undefined") {
    return { success: false, error: "Lingkungan tidak didukung." };
  }

  try {
    const result = await postAdminRequest("/api/admin/security/password", {
      current_password: currentPasswordInput,
      new_password: newPasswordInput,
      new_username: newUsernameInput?.trim(),
    });
    if (!result.success) {
      return { success: false, error: result.message || "Gagal memperbarui kredensial di server." };
    }

    const username = result.username || result.user?.username || newUsernameInput?.trim() || getSecuritySettings().username;
    const activeSession = getActiveSession();
    if (activeSession) {
      const raw = JSON.stringify({ ...activeSession, username });
      if (activeSession.rememberMe) {
        localStorage.setItem(AUTH_SESSION_KEY, raw);
      } else {
        sessionStorage.setItem(AUTH_SESSION_KEY, raw);
      }
    }
    saveSecuritySettings({ ...getSecuritySettings(), username, updatedAt: new Date().toISOString() });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || "Gagal memperbarui kredensial di server." };
  }
}

function generateSecureToken(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(24);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return `token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}
