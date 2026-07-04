import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { ListParams, PaginatedData } from "@/types/api";
import type { MenuAcceso, Rol } from "@/types";

export const rolesService = {
  list: (params?: ListParams) => apiClient.get<PaginatedData<Rol>>(ENDPOINTS.roles, params),

  getAccessList: (roleId: string) => apiClient.get<MenuAcceso[]>(`${ENDPOINTS.roles}/${roleId}/menus`),

  updateAccessList: (roleId: string, menuIds: string[]) =>
    apiClient.put<MenuAcceso[]>(`${ENDPOINTS.roles}/${roleId}/menus`, { menuIds }),
};
