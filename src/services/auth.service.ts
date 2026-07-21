import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import { ApiError } from "@/types/api";
import type {
  AccountActivationStatus,
  ActivateAccountPayload,
  LoginPayload,
  LoginResult,
  LoginStatus,
  RefreshResult,
  ApiLoginResponse,
  ApiLoginStepResponse,
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
    try {
      const response = await apiClient.requestWithData<ApiLoginResponse>(
        ENDPOINTS.auth.login,
        { method: "POST", body: payload, requiresAuth: false }
      );
      
      // Handle response (both success and error cases with auth_step)
      if (response.data) {
        const data = response.data;
        
        // Check if this is the new format with auth_step
        if ('auth_step' in data) {
          const authStep = (data as any).auth_step as LoginStatus;
          
          // If COMPLETE, the backend should also return tokens
          if (authStep === "COMPLETE") {
            return {
              status: "COMPLETE",
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              expiresAt: data.access_token_expires_at,
              user: mapApiUser(data.user),
              menu: mapApiMenu(data.menus),
            };
          }
          
          // Other auth steps (USER_NOT_FOUND, INVALID_CREDENTIALS, ACCOUNT_NOT_ACTIVATED, PASSWORD_CHANGE_REQUIRED)
          return { status: authStep, message: response.message };
        }
        
        // Old format - complete login
        return {
          status: "COMPLETE",
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: data.access_token_expires_at,
          user: mapApiUser(data.user),
          menu: mapApiMenu(data.menus),
        };
      }
      
      return { status: "USER_NOT_FOUND", message: response.message ?? "Error desconocido" };
    } catch (err: unknown) {
      // Handle HTTP status codes from ApiError
      if (err instanceof ApiError) {
        if (err.status === 401) {
          return { status: "INVALID_PASSWORD", message: "Credenciales incorrectas" };
        }
        if (err.status === 403) {
          return { status: "ACCOUNT_INACTIVE", message: "Esta cuenta está inactiva" };
        }
      }
      return { status: "USER_NOT_FOUND", message: "Error de conexión" };
    }
  },
  
  verifyActivationCode: (payload: { identifier: string; code: string }) =>
    apiClient.post<{ success: boolean; message: string }>(ENDPOINTS.auth.verifyCode, payload, { requiresAuth: false }),
  
  changePassword: (payload: { identifier: string; currentPassword: string; newPassword: string }) =>
    apiClient.post<null>(ENDPOINTS.auth.changePassword, payload, { requiresAuth: false }),

  refresh: (refreshToken: string) =>
    apiClient.post<RefreshResult>(ENDPOINTS.auth.refresh, { refreshToken }, { requiresAuth: false }),

  logout: () => apiClient.post<null>(ENDPOINTS.auth.logout),

  activateAccount: (payload: ActivateAccountPayload) =>
    apiClient.post<null>(ENDPOINTS.auth.activate, payload, { requiresAuth: false }),

  getActivationStatusList: (params?: ListParams) =>
    apiClient.get<PaginatedData<AccountActivationStatus>>(ENDPOINTS.accounts.activationStatus, params),

  resendCredentials: (userId: string) =>
    apiClient.post(ENDPOINTS.users.resendCredentials(userId)),

  manualActivate: (userId: string) =>
    apiClient.post(ENDPOINTS.users.activateByAdmin(userId)),
};
