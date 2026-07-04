import { apiClient } from "./api-client";
import type { ListParams, PaginatedData } from "@/types/api";

/**
 * Creates a fully typed CRUD service for a REST resource.
 * Every catalog module (shifts, classrooms, grades, courses, ...) reuses this
 * factory instead of duplicating fetch/create/update/delete boilerplate.
 */
export function createCrudService<TEntity, TPayload = Partial<TEntity>>(resourcePath: string) {
  return {
    list: (params?: ListParams) => apiClient.get<PaginatedData<TEntity>>(resourcePath, params),

    getById: (id: string) => apiClient.get<TEntity>(`${resourcePath}/${id}`),

    create: (payload: TPayload) => apiClient.post<TEntity>(resourcePath, payload),

    update: (id: string, payload: TPayload) => apiClient.put<TEntity>(`${resourcePath}/${id}`, payload),

    remove: (id: string) => apiClient.delete<null>(`${resourcePath}/${id}`),
  };
}
