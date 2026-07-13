// Types for Enrollment module (RF-HU-022.2)

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
  id: string;
  chargeType: "ENROLLMENT" | "TUITION" | "SUPPLIES";
  installmentNumber?: number;
  period?: string;
  amount: number;
  dueDate: string;
  status?: "Pendiente" | "Pagado" | "Vencido";
}

// Preview response
export interface EnrollmentPreview {
  studentName: string;
  gradeName: string;
  yearName: string;
  charges: GeneratedCharge[];
}

// Confirmed enrollment response
export interface EnrollmentConfirmed {
  id: string;
  studentName: string;
  gradeName: string;
  yearName: string;
  enrolledAt: string;
  status: "Activo" | "Inactivo";
  pdfUrl: string;
  charges: GeneratedCharge[];
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