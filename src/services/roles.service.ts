import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { ListParams, PaginatedData } from "@/types/api";
import type { MenuAcceso, Rol } from "@/types";

export interface RoleOption {
  id: number;
  name: string;
  code: string;
}

export const rolesService = {
  list: (params?: ListParams) => apiClient.get<PaginatedData<Rol>>(ENDPOINTS.roles, params),

  getOptions: () => apiClient.get<RoleOption[]>(ENDPOINTS.rolesOptions),

  getAccessList: (roleId: string) => apiClient.get<MenuAcceso[]>(`${ENDPOINTS.roles}/${roleId}/menus`),

  updateAccessList: (roleId: string, menuIds: string[]) =>
    apiClient.put<MenuAcceso[]>(`${ENDPOINTS.roles}/${roleId}/menus`, { menuIds }),
};
