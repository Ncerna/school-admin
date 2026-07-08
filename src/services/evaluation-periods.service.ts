import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { EvaluationPeriod, EvaluationPeriodPayload, AcademicYearOption, EvaluationTypeOption } from "@/types";

// Custom service for evaluation periods (not using generic CRUD due to special endpoints)
export const evaluationPeriodsService = {
  // List evaluation periods with filters
  list: (params?: { yearId?: string; evaluationTypeId?: string }) =>
    apiClient.get<EvaluationPeriod[]>(ENDPOINTS.evaluationPeriods, params),

  // Get by ID
  getById: (id: string) =>
    apiClient.get<EvaluationPeriod>(`${ENDPOINTS.evaluationPeriods}/${id}`),

  // Create evaluation periods
  create: (payload: EvaluationPeriodPayload) =>
    apiClient.post<EvaluationPeriod>(ENDPOINTS.evaluationPeriods, payload),

  // Update evaluation periods
  update: (id: string, payload: EvaluationPeriodPayload) =>
    apiClient.put<EvaluationPeriod>(`${ENDPOINTS.evaluationPeriods}/${id}`, payload),

  // Delete (soft delete)
  remove: (id: string) =>
    apiClient.delete<null>(`${ENDPOINTS.evaluationPeriods}/${id}`),

  // Get academic years options
  getAcademicYearsOptions: () =>
    apiClient.get<AcademicYearOption[]>(`${ENDPOINTS.AcademicYears}/options`),

  // Get evaluation types options
  getEvaluationTypesOptions: () =>
    apiClient.get<EvaluationTypeOption[]>(`${ENDPOINTS.evaluationTypes}/options`),
};