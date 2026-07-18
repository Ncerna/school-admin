// Types for Evaluation Criteria module (RF-HU-025)

// Evaluation criterion
export interface EvaluationCriterion {
  id: number | null;
  name: string;
  maxScore: number;
  order: number;
}

// Response from GET /api/evaluation-criteria
export interface EvaluationCriteriaResponse {
  evaluationPeriodId: number;
  gradeCourseId: number;
  criteria: EvaluationCriterion[];
}

// Payload for PUT /api/evaluation-criteria
export interface EvaluationCriteriaPayload {
  evaluationPeriodId: number;
  gradeCourseId: number;
  criteria: EvaluationCriterion[];
}

// Summary item for the overview view
export interface EvaluationCriteriaSummaryItem {
  gradeId: number;
  gradeName: string;
  gradeCourseId: number;
  courseId: number;
  courseName: string;
  criteriaCount: number;
}

// Academic year option (reused from other modules)
export interface AcademicYearOption {
  id: number;
  name: string;
  active: boolean;
}

// Evaluation period option
export interface EvaluationPeriodOption {
  id: number;
  name: string;
}

// Grade option
export interface GradeOption {
  id: number;
  name: string;
}

// Grade course option (for course selector)
export interface GradeCourseOption {
  gradeCourseId: number;
  courseId: number;
  courseName: string;
}