// Types for Evaluation Periods module
import type { Status } from "./index";

// Option types for selects
export interface AcademicYearOption {
  id: string;
  name: string;
  periodsCount: number;
}

export interface EvaluationTypeOption {
  id: string;
  name: string;
  periodsCount: number;
}

// Evaluation Period type
export interface EvaluationPeriod {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  academicYear: string;
  typeName: string;
  status?: Status;
}

// Payload for creating/updating evaluation periods
export interface EvaluationPeriodPayload {
  yearId: string;
  evaluationTypeId: string;
  periods: {
    id?: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }[];
}

// Form state for the modal
export interface EvaluationPeriodFormState {
  yearId: string;
  yearName: string;
  evaluationTypeId: string;
  evaluationTypeName: string;
  periodsCount: number;
  periods: {
    id?: string;
    code: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }[];
}