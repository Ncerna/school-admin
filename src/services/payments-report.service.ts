import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { PaymentReportResponse, PaymentReportFilters, ListParams } from "@/types";

export const paymentsReportService = {
  get: (params: ListParams & PaymentReportFilters) =>
    apiClient.get<PaymentReportResponse>(ENDPOINTS.paymentsReport, params),
};