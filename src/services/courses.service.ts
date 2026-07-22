import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import type { Course } from "@/types";

export const coursesService = {
  ...createCrudService<Course>(ENDPOINTS.courses),
  removeForce: (id: string) => apiClient.delete<null>(`${ENDPOINTS.courses}/${id}`, { body: { force: true } }),
};