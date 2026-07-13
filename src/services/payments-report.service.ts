import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { ListParams } from "@/types/api";
import type { PaymentReportResponse, PaymentReportFilters } from "@/types/payment-report";

export const paymentsReportService = {
  get: (params: ListParams & PaymentReportFilters) =>
    apiClient.get<PaymentReportResponse>(ENDPOINTS.paymentsReport, params),
};