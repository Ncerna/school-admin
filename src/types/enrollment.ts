// Types for Enrollment module (RF-HU-022.2)

import { ChargeApiResponse } from "./payment";

// List item for the enrollment table
export interface EnrollmentListItem {
  id: string;
  studentName: string;
  gradeName: string;
  yearName: string;
  enrolledAt: string;
  status: "Activo" | "Inactivo";
}

// Generated charge (preview/confirm)
export interface GeneratedCharge {
  id: number;
  chargeType: "ENROLLMENT" | "TUITION" | "SUPPLIES";
  installmentNumber?: number;
  period?: string;
  amount: number;
  dueDate: string;
  status?: "Pendiente" | "Pagado" | "Vencido";
  // API returns snake_case
  charge_type?: "ENROLLMENT" | "TUITION" | "SUPPLIES";
  installment_number?: number;
  due_date?: string;
  quota?: string;
}

// Preview response
export interface EnrollmentPreview {
  studentName: string;
  gradeName: string;
  yearName: string;
  charges: GeneratedCharge[];
  // API returns snake_case
  student_name?: string;
  grade_name?: string;
  year_name?: string;
}

// Confirmed enrollment response
export interface EnrollmentConfirmed {
  id: string | null;
  studentName: string;
  gradeName: string;
  yearName: string;
  enrolledAt: string;
  status: "Activo" | "Inactivo";
  pdfUrl: string;
  charges: GeneratedCharge[];
  // API returns snake_case
  student_name?: string;
  grade_name?: string;
  year_name?: string;
  pdf_url?: string;
}

// Payload for preview/confirm
export interface EnrollmentPayload {
  studentId: string;
  gradeId: string;
  yearId: string;
  enrolledAt: string;
  enrollmentInstallments?: number;
  willPayTuition: boolean;
}

// ─── Withdraw types ──────────────────────────────────────────────────────────

export interface WithdrawCharge {
  id: number;
  type: string;
  label: string;
  amount: number;
  due_date: string;
  status: string;
}

export interface WithdrawSummary {
  total_pending: number;
  total_paid: number;
  total_charges: number;
  cancelled_count: number;
  paid_count: number;
}

export interface WithdrawPreview {
  enrollment_id: number;
  previous_status: string;
  new_status: string;
  student_name: string;
  grade_name: string;
  year_name: string;
  vacancies_restored: number;
  charges_cancelled: WithdrawCharge[];
  charges_paid: WithdrawCharge[];
  summary: WithdrawSummary;
}

export interface WithdrawConfirmResponse {
  enrollment_id: number;
  previous_status: string;
  new_status: string;
  student_name: string;
  grade_name: string;
  year_name: string;
  vacancies_restored: number;
  charges_cancelled: WithdrawCharge[];
  charges_paid: WithdrawCharge[];
  summary: WithdrawSummary;
}