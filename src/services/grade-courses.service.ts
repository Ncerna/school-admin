import { apiClient } from "@/lib/api-client";
import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { GradeCourse, GradeCoursePayload, AcademicYearOption, GradeOption, CourseOption } from "@/types/grade-course";

const base = ENDPOINTS.gradeCourses;

// CRUD service for the main entity
const crudService = createCrudService<GradeCourse, GradeCoursePayload>(base);

export const gradeCoursesService = {
  // Inherit list, getById, update, remove from crudService
  list: crudService.list,
  getById: crudService.getById,
  update: crudService.update,
  remove: crudService.remove,

  // Override create to use assign endpoint (returns GradeCourse on success)
  create: (payload: GradeCoursePayload) =>
    apiClient.post<GradeCourse>(base, payload),

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