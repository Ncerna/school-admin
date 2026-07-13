import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS, API_BASE_URL } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import type { EnrollmentListItem, EnrollmentPreview, EnrollmentConfirmed, EnrollmentPayload, PaginatedData, ListParams } from "@/types";

const base = createCrudService<EnrollmentListItem>(ENDPOINTS.enrollments);

export const enrollmentsService = {
  ...base,
  // List with filters
  list: (params?: ListParams & { yearId?: string; gradeId?: string }) =>
    apiClient.get<PaginatedData<EnrollmentListItem>>(ENDPOINTS.enrollments, params),
  // Preview enrollment
  preview: (payload: EnrollmentPayload) =>
    apiClient.post<EnrollmentPreview>(ENDPOINTS.enrollmentPreview, payload),
  // Confirm enrollment
  confirm: (payload: EnrollmentPayload) =>
    apiClient.post<EnrollmentConfirmed>(ENDPOINTS.enrollmentConfirm, payload),
  // Get PDF URL
  getPdfUrl: (id: string) => `${API_BASE_URL}/enrollments/${id}/pdf`,
};