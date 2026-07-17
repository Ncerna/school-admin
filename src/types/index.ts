import type { ReactNode } from "react";

// School and Publication types
import type { School, SchoolPayload } from "./school";
import type { Publication, PublicationPayload, PublicationStatus, PublicationSection } from "./publication";

// Domain types for the school system.
// Centralizing types here makes it easy to scale the project: any
// new module (e.g., "Enrollments" or "Attendance") can
// reuse these same conventions.

export type Status = "Activo" | "Inactivo";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Administrador" | "Secretaría" | "Director";
  avatarUrl?: string;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  status: Status;
}

export interface Grade {
  id: string;
  name: string;
  levelId: string;
  section: string;
  classroomId: string;
  vacancies: number;
  status: Status;
  
  levelName?: string;
  classroomName?: string;
}

export interface Classroom {
  id: string;
  name: string;
  status: Status;
}

export interface Course {
  id: string;
  name: string;
  code?: string;
  status: Status;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  status: Status;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: Status;
  enrollmentStatus: Status;
  shiftIds: number[];
  periodCount?: number;
}

export interface EvaluationType {
  id: string;
  name: string;

  status: Status;
  inUse?: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface MenuAccess {
  id: string;
  name: string;
  assigned: boolean;
}

export interface Teacher {
  id: string;
  // Using firstName and lastName to match API expected keys
  firstName: string;
  lastName: string;
  dni: string;
  specialty: string;
  email: string;
  phone: string;
  status: Status;
  // Optional laboral and bank information
  bank?: string;
  accountNumber?: string;
  accountHolder?: string;
  pensionEntity?: "AFP Integra" | "Prima AFP" | "Profuturo AFP" | "Habitat AFP" | "ONP" | "Otros";
  onPayroll?: boolean;
  paymentFrequency?: "Mensual" | "Quincenal" | "Semanal" | "Diario" | "Por hora";
}

export type Gender = "male" | "female";
export type RelationshipType = "Father" | "Mother" | "Tutor" | "Grandparent" | "Other";

export interface Guardian {
  names: string;
  last_name: string;
  dni: string;
  phone: string;
  relationshipType: RelationshipType | "";
}

export interface Student {
  id: string;
  // Required fields
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  gender: Gender | "";
  // Optional fields
  country?: string;
  address?: string;
  birthDate?: string;
  emergencyContact?: string;
  // Status returned by API
  status?: Status;
  // Guardian information
  guardian: Guardian;
  // Lives with parents
  livesWithParents?: boolean;
}

// Payload type for creating/updating students (matches API expected keys)
export type StudentPayload = Omit<Student, "id" | "status">;

// Payload type for creating/updating teachers (matches API expected keys)
export type TeacherPayload = Omit<Teacher, "id" | "status">;

// Generic table column definition, reused by all modules.
export interface ColumnDef<T> {
  header: string;
  accessor: keyof T;
  render?: (item: T) => ReactNode;
  className?: string;
  /** Enables click-to-sort on this column header (server-side sorting). */
  sortable?: boolean;
}

// Generic form field definition, used in create/edit modals.
export type FieldType = "text" | "email" | "number" | "select" | "textarea";

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldDef<T> {
  name: keyof T;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: SelectOption[];
  required?: boolean;
}

// Re-export School and Publication types
export { School, SchoolPayload, Publication, PublicationPayload, PublicationStatus, PublicationSection };

// Re-export API types
export type { PaginatedData, PaginationMeta, ListParams } from "./api";

// Re-export Evaluation Period types
export type { EvaluationPeriod, EvaluationPeriodPayload, EvaluationPeriodFormState, AcademicYearOption, EvaluationTypeOption } from "./evaluation-period";

// Re-export Grade Course types
export type { GradeCourse, GradeCoursePayload, AcademicYearOption as GradeCourseAcademicYearOption, GradeOption, CourseOption } from "./grade-course";

// Re-export Fee Schedule types
export type { FeeSchedule, FeeSchedulePayload } from "./fee-schedule";

// Re-export Enrollment types
export type { EnrollmentListItem, GeneratedCharge, EnrollmentPreview, EnrollmentConfirmed, EnrollmentPayload } from "./enrollment";

// Re-export Payment types
export type { Charge, ChargeApiResponse, PaymentMethodEntry, PaymentMethodEntryPayload, RegisterPaymentPayload, PaymentAllocation, PaymentResult, PaymentBatchResult, PaymentMethod, ChargeTypeOption } from "./payment";

// Re-export Payment Report types
export type { PaymentReportRow, PaymentReportFilters, PaymentReportSummary, PaymentReportResponse } from "./payment-report";

// Type aliases for backward compatibility (Spanish names)
export type { Level as Nivel, Grade as Grado, Classroom as Aula, Course as Curso, Shift as Turno, AcademicYear as AnioAcademico, EvaluationType as TipoEvaluacion, Role as Rol, MenuAccess as MenuAcceso, Teacher as Docente, Student as Estudiante, Guardian as Apoderado, School as Colegio, Publication as Publicacion };
export type { EvaluationPeriod as PeriodoEvaluacion, EvaluationPeriodPayload as PeriodoEvaluacionPayload } from "./evaluation-period";
