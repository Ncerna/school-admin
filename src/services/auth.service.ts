import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type {
  AccountActivationStatus,
  ActivateAccountPayload,
  LoginPayload,
  LoginResult,
  RefreshResult,
  ApiLoginResponse,
  ApiUser,
  ApiMenu,
} from "@/types/auth";
import type { PaginatedData, ListParams } from "@/types/api";

function mapApiUser(apiUser: ApiUser): LoginResult["user"] {
  return {
    id: String(apiUser.id),
    nombres: apiUser.username, // Use username as nombres since API doesn't provide it
    apellidos: "",
    correo: apiUser.email,
    usuario: apiUser.username,
    rol: apiUser.role,
  };
}

function mapApiMenu(apiMenus: ApiMenu[]): LoginResult["menu"] {
  return apiMenus.map((menu) => ({
    id: String(menu.id),
    nombre: menu.name,
    ruta: menu.route,
    icono: menu.icon,
    acciones: [], // API returns permissions separately, not per menu
  }));
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResult> => {
    const apiResponse = await apiClient.post<ApiLoginResponse>(
      ENDPOINTS.auth.login,
      payload,
      { requiresAuth: false }
    );
    
    return {
      accessToken: apiResponse.access_token,
      refreshToken: apiResponse.refresh_token,
      expiresAt: apiResponse.access_token_expires_at,
      user: mapApiUser(apiResponse.user),
      menu: mapApiMenu(apiResponse.menus),
    };
  },

  refresh: (refreshToken: string) =>
    apiClient.post<RefreshResult>(ENDPOINTS.auth.refresh, { refreshToken }, { requiresAuth: false }),

  logout: () => apiClient.post<null>(ENDPOINTS.auth.logout),

  activateAccount: (payload: ActivateAccountPayload) =>
    apiClient.post<null>(ENDPOINTS.auth.activate, payload, { requiresAuth: false }),

  getActivationStatusList: (params?: ListParams) =>
    apiClient.get<PaginatedData<AccountActivationStatus>>(ENDPOINTS.accounts.activationStatus, params),
};
