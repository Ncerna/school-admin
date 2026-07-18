import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type {
  EvaluationCriteriaResponse,
  EvaluationCriteriaPayload,
  EvaluationCriteriaSummaryItem,
  AcademicYearOption,
  EvaluationPeriodOption,
  GradeOption,
  GradeCourseOption,
} from "@/types/evaluation-criteria";

export const evaluationCriteriaService = {
  // Get academic years options
  getAcademicYears: () =>
    apiClient.get<AcademicYearOption[]>(`${ENDPOINTS.AcademicYears}/options`),

  // Get evaluation periods for an academic year
  getEvaluationPeriods: (academicYearId: number) =>
    apiClient.get<EvaluationPeriodOption[]>(`${ENDPOINTS.evaluationPeriods}/options`, { academicYearId }),

  // Get grades for an academic year
  getGrades: (academicYearId: number) =>
    apiClient.get<GradeOption[]>(`${ENDPOINTS.grades}/options`, { academicYearId }),

  // Get courses for a grade in an academic year
  getGradeCourses: (academicYearId: number, gradeId: number) =>
    apiClient.get<GradeCourseOption[]>(`${ENDPOINTS.gradeCourses}/options`, { academicYearId, gradeId }),

  // Get criteria for a specific combination
  getCriteria: (evaluationPeriodId: number, gradeCourseId: number) =>
    apiClient.get<EvaluationCriteriaResponse>(`${ENDPOINTS.evaluationCriteria}`, { evaluationPeriodId, gradeCourseId }),

  // Save all criteria for a combination
  saveCriteria: (payload: EvaluationCriteriaPayload) =>
    apiClient.put<EvaluationCriteriaResponse>(ENDPOINTS.evaluationCriteria, payload),

  // Get summary of all grade-course combinations for an academic year and period
  getSummary: (academicYearId: number, evaluationPeriodId: number) =>
    apiClient.get<EvaluationCriteriaSummaryItem[]>(`${ENDPOINTS.evaluationCriteria}/summary`, { academicYearId, evaluationPeriodId }),
};