import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Charge, RegisterPaymentPayload, PaymentBatchResult } from "@/types";

export const paymentsService = {
  getCharges: (enrollmentId: number, chargeType?: string) =>
    apiClient.get<Charge[]>(
      ENDPOINTS.enrollmentCharges(enrollmentId),
      chargeType ? { chargeType } : undefined
    ),
  register: (endpoint: string, payload: RegisterPaymentPayload) =>
    apiClient.post<PaymentBatchResult>(endpoint, payload),
};