import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import type { AnioAcademico } from "@/types";

const base = createCrudService<AnioAcademico>(ENDPOINTS.AcademicYears);

export const AcademicYearsService = {
  ...base,
  activate: (id: string) => apiClient.patch<AnioAcademico>(`${ENDPOINTS.AcademicYears}/${id}/activate`),
};
