import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type {
  AccountActivationStatus,
  ActivateAccountPayload,
  LoginPayload,
  LoginResult,
  RefreshResult,
} from "@/types/auth";
import type { PaginatedData, ListParams } from "@/types/api";

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResult>(ENDPOINTS.auth.login, payload, { requiresAuth: false }),

  refresh: (refreshToken: string) =>
    apiClient.post<RefreshResult>(ENDPOINTS.auth.refresh, { refreshToken }, { requiresAuth: false }),

  logout: () => apiClient.post<null>(ENDPOINTS.auth.logout),

  activateAccount: (payload: ActivateAccountPayload) =>
    apiClient.post<null>(ENDPOINTS.auth.activate, payload, { requiresAuth: false }),

  getActivationStatusList: (params?: ListParams) =>
    apiClient.get<PaginatedData<AccountActivationStatus>>(ENDPOINTS.accounts.activationStatus, params),
};
