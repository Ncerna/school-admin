// Types for Payment module (RF-HU-022.3)

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

export interface PaymentMethodEntry {
  paymentMethodCode: string;
  amount: number;
  reference: string | null;
}

export interface RegisterPaymentPayload {
  payableType: "enrollment";
  payableId: number;
  methods: PaymentMethodEntry[];
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