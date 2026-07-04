import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import type { AnioAcademico } from "@/types";

const base = createCrudService<AnioAcademico>(ENDPOINTS.academicYears);

export const academicYearsService = {
  ...base,
  activate: (id: string) => apiClient.patch<AnioAcademico>(`${ENDPOINTS.academicYears}/${id}/activate`),
};
