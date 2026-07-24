// Types for Payment module (RF-HU-022.3)

// API response format (snake_case)
export interface ChargeApiResponse {
  id: number;
  charge_type: string;
  installment_number: number | null;
  period: string | null;
  quota: string | null;
  amount: number;
  due_date: string;
  status: string;
}

// Frontend type (camelCase)
export interface Charge {
  id: number;
  chargeType: string;
  installmentNumber: number | null;
  period: string | null;
  amount: number;
  balance: number;
  status: string;
  dueDate: string;
}

// Re-export for use in services
export type { ChargeApiResponse as ChargeApi };

// Frontend type (camelCase)
export interface PaymentMethodEntry {
  paymentMethodCode: string;
  amount: number;
  reference: string | null;
}

// API payload format (snake_case)
export interface PaymentMethodEntryPayload {
  payment_method_code: string;
  amount: number;
  reference: string | null;
}

// API payload for register
export interface RegisterPaymentPayload {
  payableType: "enrollment";
  payableId: number;
  methods: PaymentMethodEntryPayload[];
  chargeIds: number[] | null;
  chargeTypeCode?: string | null;
}

export interface PaymentAllocation {
  chargeId: number;
  chargeType: string;
  period: string | null;
  amountApplied: number;
  chargeStatus: string;
}

export interface PaymentResult {
  id: number;
  method: string;
  amount: number;
  reference: string | null;
  paidAt: string;
  allocations: PaymentAllocation[];
}

export interface PaymentBatchResult {
  payments: PaymentResult[];
  unappliedAmount: number;
}

// PaymentMethod type for the catalog
export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  status: "Activo" | "Inactivo";
}

// ChargeType option type for select dropdown
export interface ChargeTypeOption {
  id: number;
  code: string;
  name: string;
}


