import type { AuthUser, MenuPermission } from "@/types/auth";

// All authentication state lives under these well-known keys so that any
// part of the app (API client, guards, session monitor) reads/writes the
// same source of truth instead of scattering localStorage calls around.
const STORAGE_KEYS = {
  accessToken: "school_admin.access_token",
  refreshToken: "school_admin.refresh_token",
  expiresAt: "school_admin.expires_at",
  user: "school_admin.user",
  menu: "school_admin.menu",
} as const;

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  },

  getExpiresAt(): Date | null {
    const value = localStorage.getItem(STORAGE_KEYS.expiresAt);
    return value ? new Date(value) : null;
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  getMenu(): MenuPermission[] {
    const raw = localStorage.getItem(STORAGE_KEYS.menu);
    return raw ? (JSON.parse(raw) as MenuPermission[]) : [];
  },

  /** Used across the app (and the API client) to check "verificacion si existe token". */
  hasToken(): boolean {
    return Boolean(this.getAccessToken());
  },

  save(session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: AuthUser;
    menu: MenuPermission[];
  }) {
    localStorage.setItem(STORAGE_KEYS.accessToken, session.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, session.refreshToken);
    localStorage.setItem(STORAGE_KEYS.expiresAt, session.expiresAt);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(session.user));
    localStorage.setItem(STORAGE_KEYS.menu, JSON.stringify(session.menu));
  },

  updateTokens(tokens: { accessToken: string; refreshToken: string; expiresAt: string }) {
    localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
    localStorage.setItem(STORAGE_KEYS.expiresAt, tokens.expiresAt);
  },

  clear() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
