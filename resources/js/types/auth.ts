export interface AdminSession {
  token: string;
  username: string;
  loginAt: string;
  expiresAt: number;
  rememberMe: boolean;
  lastActiveAt: number;
}

export interface AdminSecuritySettings {
  username: string;
  passwordHash: string;
  salt: string;
  updatedAt: string;
  failedAttempts: number;
  lockedUntil: number | null;
  lastLoginAt: string | null;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  lockedUntil?: number;
  remainingAttempts?: number;
}
