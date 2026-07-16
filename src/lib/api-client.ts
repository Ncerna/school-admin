import { API_BASE_URL, ENDPOINTS } from "./endpoints";
import { tokenStorage } from "./token-storage";
import { ApiError, type ApiResponse, type ListParams } from "@/types/api";
import type { RefreshResult } from "@/types/auth";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: ListParams | Record<string, unknown>;
  /** Most endpoints require the Access Token; only auth endpoints don't. */
  requiresAuth?: boolean;
  /** Internal flag to avoid infinite refresh loops. */
  isRetry?: boolean;
  signal?: AbortSignal;
}

interface FormRequestOptions {
  method?: HttpMethod;
  body: FormData;
  params?: ListParams | Record<string, unknown>;
  /** Most endpoints require the Access Token; only auth endpoints don't. */
  requiresAuth?: boolean;
  /** Internal flag to avoid infinite refresh loops. */
  isRetry?: boolean;
  signal?: AbortSignal;
}

function buildQueryString(params?: Record<string, unknown>) {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

/**
 * Dispatched whenever the refresh token is invalid/expired so the AuthContext
 * (which owns navigation) can clear the session and redirect to /login,
 * without this module needing to depend on react-router.
 */
function emitSessionExpired() {
  window.dispatchEvent(new CustomEvent("auth:session-expired"));
}

let refreshPromise: Promise<RefreshResult> | null = null;

/** Ensures concurrent 401s trigger a single refresh call instead of a stampede. */
async function refreshAccessToken(): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) throw new ApiError("No refresh token available.", 401);

      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.auth.refresh}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token:refreshToken }),
      });

      const payload = (await response.json()) as ApiResponse<RefreshResult>;
      if (!response.ok || !payload.success) {
        throw new ApiError(payload.message ?? "Session expired.", response.status);
      }

      tokenStorage.updateTokens(payload.data);
      return payload.data;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params, requiresAuth = true, isRetry = false, signal } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (requiresAuth) {
    // "verificacion si existe token" before attaching the Authorization header.
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(params)}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  // 204 No Content or empty bodies still need a consistent return shape.
  const text = await response.text();
  const payload = (text ? JSON.parse(text) : {}) as ApiResponse<T>;

  if (response.status === 401 && requiresAuth && !isRetry) {
    try {
      await refreshAccessToken();
      return request<T>(path, { ...options, isRetry: true });
    } catch {
      tokenStorage.clear();
      emitSessionExpired();
      throw new ApiError("Your session has expired. Please sign in again.", 401);
    }
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(payload.message ?? "Unexpected error.", response.status, payload.errors ?? null);
  }

  return payload.data;
}

async function requestForm<T>(path: string, options: FormRequestOptions): Promise<T> {
  const { method = "POST", body, params, requiresAuth = true, isRetry = false, signal } = options;

  const headers: Record<string, string> = {};

  if (requiresAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(params)}`, {
    method,
    headers,
    body,
    signal,
  });

  // 204 No Content or empty bodies still need a consistent return shape.
  const text = await response.text();
  const payload = (text ? JSON.parse(text) : {}) as ApiResponse<T>;

  if (response.status === 401 && requiresAuth && !isRetry) {
    try {
      await refreshAccessToken();
      return requestForm<T>(path, { ...options, isRetry: true });
    } catch {
      tokenStorage.clear();
      emitSessionExpired();
      throw new ApiError("Your session has expired. Please sign in again.", 401);
    }
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(payload.message ?? "Unexpected error.", response.status, payload.errors ?? null);
  }

  return payload.data;
}

/**
 * Request that returns the full response including data even on error.
 * Useful for endpoints that return special data in error responses.
 */
async function requestWithData<T>(path: string, options: RequestOptions = {}): Promise<{
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]> | null;
}> {
  const { method = "GET", body, params, requiresAuth = true, isRetry = false, signal } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (requiresAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(params)}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const text = await response.text();
  const payload = (text ? JSON.parse(text) : {}) as ApiResponse<T>;

  if (response.status === 401 && requiresAuth && !isRetry) {
    try {
      await refreshAccessToken();
      return requestWithData<T>(path, { ...options, isRetry: true });
    } catch {
      tokenStorage.clear();
      emitSessionExpired();
      throw new ApiError("Your session has expired. Please sign in again.", 401);
    }
  }

  return {
    success: payload.success,
    message: payload.message,
    data: payload.data,
    errors: payload.errors,
  };
}

/** Single, centralized API client used by every service in the app. */
export const apiClient = {
  get: <T>(path: string, params?: Record<string, unknown>, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET", params }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),

  postForm: <T>(path: string, body: FormData, options?: FormRequestOptions) =>
    requestForm<T>(path, { ...options, method: "POST", body }),

  putForm: <T>(path: string, body: FormData, options?: FormRequestOptions) =>
    requestForm<T>(path, { ...options, method: "PUT", body }),

  /** Request that returns full response including data on error */
  requestWithData: <T>(path: string, options?: RequestOptions) =>
    requestWithData<T>(path, options),

  /** Request that returns raw data without { success, data } wrapper */
  getDirect: async <T>(path: string, params?: Record<string, unknown>): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(params)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenStorage.getAccessToken() || ""}`,
      },
    });

    if (!response.ok) {
      throw new ApiError(`Error ${response.status}: ${response.statusText}`, response.status);
    }

    return response.json();
  },
};
