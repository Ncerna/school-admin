import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { SchoolInfo, PortalPublication } from "@/types/portal";

export const portalService = {
  getSchoolInfo: () =>
    apiClient.get<SchoolInfo>(`${ENDPOINTS.school}/info`),

  getPublications: (params?: { section?: string; page?: number; limit?: number }) =>
    apiClient.get<PortalPublication[]>(
      `${ENDPOINTS.publications}/info`,
      params as Record<string, unknown>,
      { requiresAuth: false }
    ),
};
