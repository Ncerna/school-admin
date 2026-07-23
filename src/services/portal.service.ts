import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { SchoolInfo, PortalPublication } from "@/types/portal";

export const portalService = {
  getSchoolInfo: () =>
    apiClient.getDirect<SchoolInfo>(`${ENDPOINTS.school}/info`),

  getPublications: (params?: { section?: string; page?: number; limit?: number }) =>
    apiClient.getDirect<PortalPublication[]>(
      `${ENDPOINTS.publications}/info`,
      params as Record<string, unknown>
    ),
};