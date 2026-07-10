import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { GradeCourse, GradeCoursePayload, AcademicYearOption, GradeOption, CourseOption } from "@/types/grade-course";
import type { PaginatedData, ListParams } from "@/types/api";

const base = ENDPOINTS.gradeCourses;

export const gradeCoursesService = {
  // Get assigned courses with filters
  list: (params?: ListParams & { yearId?: number; gradeId?: number }) =>
    apiClient.get<PaginatedData<GradeCourse>>(base, params),

  // Assign courses to a grade
  assign: (payload: GradeCoursePayload) =>
    apiClient.post<{ success: boolean; message: string }>(base, payload),

  // Remove a course assignment
  remove: (id: string) =>
    apiClient.delete<null>(`${base}/${id}`),

  // Get academic years options
  getAcademicYears: () =>
    apiClient.get<AcademicYearOption[]>(`${ENDPOINTS.AcademicYears}/options`),

  // Get grades options
  getGrades: () =>
    apiClient.get<GradeOption[]>(`${ENDPOINTS.grades}/options`),

  // Get courses options
  getCourses: () =>
    apiClient.get<CourseOption[]>(`${ENDPOINTS.courses}/options`),
};
