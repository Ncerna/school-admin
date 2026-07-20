// Types for Grade Courses module (RF-HU-021)
import type { Status } from "./index";

// Grade Course type - represents a course assigned to a grade
// Based on API response: GET /api/grade-courses?yearId=X&gradeId=Y
// Note: API returns couseName (typo in backend), secion (typo in backend), fecha (typo in backend), estado (typo in backend)
export interface GradeCourse {
  id: string;
  yearId: number;
  yearName: string;
  gradeId: number;
  gradeName: string;
  levelName: string;
  section: string;
  date: string;
  coursesCount: number;
  status: Status;
  // Course name for display in report (from API: couseName)
  courseName?: string;
}

// Response from GET /api/grade-courses?yearId=X&gradeId=Y
// This is the actual API response structure
export interface GradeCourseListItem {
  id: number;
  couseName: string;
  gradeName: string;
  levelName: string;
  secion: string;
  fecha: string;
  estado: string;
}

// Form state for editing - API returns { yearId, gradeId, courseIds: [...] }
export interface GradeCourseFormState {
  yearId: number;
  gradeId: number;
  courseIds: number[];
}

// Payload for assigning courses to a grade
export interface GradeCoursePayload {
  yearId: number;
  gradeId: number;
  courseIds: number[];
}

// Option types for selects
export interface AcademicYearOption {
  id: number;
  name: string;
}

export interface GradeOption {
  id: number;
  name: string;
  levelName?: string;
}

export interface CourseOption {
  id: number;
  name: string;
}

// Affected course for confirmation dialog
export interface AffectedCourse {
  courseId: number;
  courseName: string;
  criteriaCount: number;
  teacherAssignmentsCount: number;
}

// Response from PUT when confirmation is required (data field in transformed response)
export interface UpdateConfirmationResponse {
  success: boolean;
  requires_confirmation: boolean;
  message: string;
  affected_courses: AffectedCourse[];
}

// Error response structure for 409 conflict (nested in errors field)
export interface ConflictErrorResponse {
  success: boolean;
  requires_confirmation: boolean;
  message: string;
  affected_courses: AffectedCourse[];
}