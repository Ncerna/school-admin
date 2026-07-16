import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Charge, ChargeApiResponse, RegisterPaymentPayload, PaymentBatchResult } from "@/types";

// Map API response to frontend type
function mapChargeApiResponse(apiCharge: ChargeApiResponse): Charge {
  return {
    id: apiCharge.id,
    chargeType: apiCharge.charge_type,
    installmentNumber: apiCharge.installment_number,
    period: apiCharge.period ?? apiCharge.quota,
    amount: apiCharge.amount,
    balance: apiCharge.amount, // If balance is not in API, use amount as balance
    status: apiCharge.status,
    dueDate: apiCharge.due_date,
  };
}

export const paymentsService = {
  // Use getDirect for endpoints that return data directly (not wrapped in { success, data })
  getCharges: async (enrollmentId: number, chargeType?: string): Promise<Charge[]> => {
    const data = await apiClient.getDirect<ChargeApiResponse[]>(
      ENDPOINTS.enrollmentCharges(enrollmentId),
      chargeType ? { chargeType } : undefined
    );
    return data.map(mapChargeApiResponse);
  },
  register: (endpoint: string, payload: RegisterPaymentPayload) =>
    apiClient.post<PaymentBatchResult>(endpoint, payload),
};
