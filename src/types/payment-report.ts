// Types for Payments Report module (RF-HU-022.6)

export interface PaymentReportRow {
  id: string;
  paymentId: number;
  paidAt: string;
  amount: number;
  paymentAmount: number;
  method: string;
  collectedBy: string;
  reference: string | null;
  student: string;
  enrollmentId: number;
  chargeType: string;
  period: string | null;
  installmentNumber: number | null;
}

export interface PaymentReportFilters {
  dateFrom?: string;
  dateTo?: string;
  paymentMethodId?: number;
  chargeTypeId?: number;
  studentSearch?: string;
}

export interface PaymentReportSummary {
  totalAmount: number;
}

export interface PaymentReportResponse {
  items: PaymentReportRow[];
  pagination: { currentPage: number; limit: number; total: number; totalPage: number };
  summary: PaymentReportSummary;
}