import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Menu } from "@/types";

export const menusService = {
  getMenus: () => apiClient.get<Menu[]>(ENDPOINTS.menus),
};