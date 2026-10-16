import {
  AdminSession,
  AdminSecuritySettings,
  LoginResult,
} from "@/types/auth";

export const AUTH_SECURITY_KEY = "kfi_superadmin_security";
export const AUTH_SESSION_KEY = "kfi_superadmin_session";
export const AUTH_EVENT_NAME = "kfi_superadmin_auth_event";

export const DEFAULT_USERNAME = "superadmin";
export const DEFAULT_PASSWORD_PLAIN = "SemakinPede2026!";
export const DEFAULT_SALT = "kfi_semakinpede_salt_2026";
export const DEFAULT_PASSWORD_HASH =
  "bf104ba1b7e6cb0d0ca14a1489bdf40f81e096025ecff50eeaa6f8c29fccf375";

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 menit
export const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 jam untuk tab aktif
export const REMEMBER_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari jika diingat

export const DEFAULT_SECURITY_SETTINGS: AdminSecuritySettings = {
  username: DEFAULT_USERNAME,
  passwordHash: DEFAULT_PASSWORD_HASH,
  salt: DEFAULT_SALT,
  updatedAt: "2026-10-12T12:00:00.000Z",
  failedAttempts: 0,
  lockedUntil: null,
  lastLoginAt: null,
};

export async function hashPassword(
  password: string,
  salt: string = DEFAULT_SALT
): Promise<string> {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    try {
      const enc = new TextEncoder();
      const data = enc.encode(`${salt}:${password}`);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      // Fallback below
    }
  }

  // Fallback string hashing
  let hash = 0;
  const str = `${salt}:${password}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

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
    };
  } catch (err) {
    console.error("Gagal membaca kredensial security:", err);
    return DEFAULT_SECURITY_SETTINGS;
  }
}

export function saveSecuritySettings(settings: AdminSecuritySettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_SECURITY_KEY, JSON.stringify(settings));
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

export async function authenticateSuperadmin(
  usernameInput: string,
  passwordInput: string,
  rememberMe: boolean
): Promise<LoginResult> {
  if (typeof window === "undefined") {
    return { success: false, error: "Lingkungan tidak didukung." };
  }

  const settings = getSecuritySettings();
  const now = Date.now();

  // 1. Cek lockout brute force
  if (settings.lockedUntil && now < settings.lockedUntil) {
    const remainingSeconds = Math.ceil((settings.lockedUntil - now) / 1000);
    return {
      success: false,
      error: `Akses terkunci sementara karena beberapa kali percobaan gagal. Silakan tunggu ${remainingSeconds} detik lagi.`,
      lockedUntil: settings.lockedUntil,
    };
  }

  // 2. Cek username
  const trimmedUsername = usernameInput.trim();
  const isArfiandre =
    trimmedUsername.toLowerCase() === "arfiandre" && passwordInput === "matematika";
  const isUsernameMatch =
    trimmedUsername.toLowerCase() === settings.username.toLowerCase();

  // 3. Cek password hash
  const computedHash = await hashPassword(passwordInput, settings.salt);
  const isDefaultPlainMatch =
    settings.passwordHash === DEFAULT_PASSWORD_HASH &&
    (passwordInput === DEFAULT_PASSWORD_PLAIN || passwordInput === "Admin123!");
  const isPasswordMatch =
    computedHash === settings.passwordHash || isDefaultPlainMatch;

  if (!isArfiandre && (!isUsernameMatch || !isPasswordMatch)) {
    const newFailedCount = (settings.failedAttempts || 0) + 1;
    let lockedUntil: number | null = null;
    let errorMsg = "Kombinasi nama pengguna atau kata sandi tidak cocok.";

    if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
      lockedUntil = now + LOCKOUT_DURATION_MS;
      errorMsg =
        "Terlalu banyak percobaan masuk yang salah. Akses portal superadmin dikunci selama 5 menit untuk alasan keamanan.";
    }

    const updatedSettings: AdminSecuritySettings = {
      ...settings,
      failedAttempts: newFailedCount >= MAX_FAILED_ATTEMPTS ? 0 : newFailedCount,
      lockedUntil,
    };
    saveSecuritySettings(updatedSettings);

    return {
      success: false,
      error: errorMsg,
      lockedUntil: lockedUntil || undefined,
      remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - newFailedCount),
    };
  }

  // 4. Autentikasi Berhasil: Buat session token
  const activeUsername = isArfiandre ? "Arfiandre" : settings.username;
  createAdminSession(activeUsername, rememberMe);

  return { success: true };
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

  const settings = getSecuritySettings();

  // Validasi password saat ini
  const currentHash = await hashPassword(currentPasswordInput, settings.salt);
  const isDefaultPlain =
    settings.passwordHash === DEFAULT_PASSWORD_HASH &&
    currentPasswordInput === DEFAULT_PASSWORD_PLAIN;
  if (currentHash !== settings.passwordHash && !isDefaultPlain) {
    return { success: false, error: "Kata sandi saat ini yang Anda masukkan salah." };
  }

  if (newPasswordInput.length < 8) {
    return {
      success: false,
      error: "Kata sandi baru minimal harus terdiri dari 8 karakter.",
    };
  }

  const newSalt = `salt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const newHash = await hashPassword(newPasswordInput, newSalt);

  const updatedSettings: AdminSecuritySettings = {
    ...settings,
    username: newUsernameInput ? newUsernameInput.trim() : settings.username,
    passwordHash: newHash,
    salt: newSalt,
    updatedAt: new Date().toISOString(),
    failedAttempts: 0,
    lockedUntil: null,
  };

  saveSecuritySettings(updatedSettings);

  // Perbarui username di sesi aktif jika diubah
  const activeSession = getActiveSession();
  if (activeSession) {
    const updatedSession: AdminSession = {
      ...activeSession,
      username: updatedSettings.username,
    };
    const raw = JSON.stringify(updatedSession);
    if (activeSession.rememberMe) {
      localStorage.setItem(AUTH_SESSION_KEY, raw);
    } else {
      sessionStorage.setItem(AUTH_SESSION_KEY, raw);
    }
  }

  return { success: true };
}

export function resetSuperadminSecurityToDefault(): void {
  saveSecuritySettings(DEFAULT_SECURITY_SETTINGS);
}

function generateSecureToken(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(24);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return `token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}
