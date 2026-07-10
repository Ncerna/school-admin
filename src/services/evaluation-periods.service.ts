import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import type { EvaluationPeriod, EvaluationPeriodPayload, EvaluationPeriodFormState, AcademicYearOption, EvaluationTypeOption, PaginatedData, ListParams } from "@/types";

const base = createCrudService<EvaluationPeriod, EvaluationPeriodPayload>(ENDPOINTS.evaluationPeriods);

export const evaluationPeriodsService = {
  ...base,
  // List evaluation periods with filters
  list: (params?: ListParams & { yearId?: string; evaluationTypeId?: string }) =>
    apiClient.get<PaginatedData<EvaluationPeriod>>(ENDPOINTS.evaluationPeriods, params),
  // Get by ID - returns form state for editing
  getById: (id: string) =>
    apiClient.get<EvaluationPeriodFormState>(`${ENDPOINTS.evaluationPeriods}/${id}`),
  // Get academic years options
  getAcademicYearsOptions: () =>
    apiClient.get<AcademicYearOption[]>(`${ENDPOINTS.AcademicYears}/options`),

  // Get evaluation types options
  getEvaluationTypesOptions: () =>
    apiClient.get<EvaluationTypeOption[]>(`${ENDPOINTS.evaluationTypes}/options`),
};
