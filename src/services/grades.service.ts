import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import type { Grade } from "@/types";

export const gradesService = {
  ...createCrudService<Grade>(ENDPOINTS.grades),
  removeForce: (id: string) => apiClient.delete<null>(`${ENDPOINTS.grades}/${id}`, { body: { force: true } }),
};
