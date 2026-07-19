import { apiClient } from "@/lib/api-client";
import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import { ApiError } from "@/types/api";
import type { GradeCourse, GradeCoursePayload, GradeCourseFormState, AcademicYearOption, GradeOption, CourseOption } from "@/types/grade-course";

const base = ENDPOINTS.gradeCourses;

// CRUD service for the main entity
const crudService = createCrudService<GradeCourse, GradeCoursePayload>(base);

// Response type for delete confirmation
interface DeleteConfirmationResponse {
  requires_confirmation: boolean;
  courses_count: number;
}

export const gradeCoursesService = {
  // Inherit list, getById, update, remove from crudService
  list: crudService.list,
  getById: crudService.getById,
  update: crudService.update,
  remove: crudService.remove,

  // Override create to use assign endpoint (returns GradeCourse on success)
  create: (payload: GradeCoursePayload) =>
    apiClient.post<GradeCourse>(base, payload),

  // Get by year and grade - for editing
  getByYearAndGrade: (yearId: number, gradeId: number) =>
    apiClient.get<GradeCourseFormState>(`${base}/${yearId}/${gradeId}`),

  // Update by year and grade - for editing
  updateByYearAndGrade: (yearId: number, gradeId: number, courseIds: number[]) =>
    apiClient.put<GradeCourse>(`${base}/${yearId}/${gradeId}`, { yearId, gradeId, courseIds }),

  // Delete by year and grade - with confirmation support
  // Returns { requires_confirmation: true, courses_count: N } when confirmation is needed
  // Throws ApiError with data in errors for confirmation case
  deleteByYearAndGrade: async (yearId: number, gradeId: number, force: boolean = false): Promise<void> => {
    const response = await apiClient.requestWithData<DeleteConfirmationResponse>(
      `${base}/${yearId}/${gradeId}`,
      { method: "DELETE", params: { force } }
    );

    if (!response.success) {
      // Check if this is a confirmation-required response
      if (response.data?.requires_confirmation) {
        // Throw with the data in errors field for the frontend to handle
        throw new ApiError(
          response.message,
          400,
          {
            requires_confirmation: [String(response.data.requires_confirmation)],
            courses_count: [String(response.data.courses_count)],
          }
        );
      }
      throw new ApiError(response.message ?? "Unexpected error.", 400, response.errors ?? null);
    }

    // Success - no return value needed
  },

  // Get academic years options
  getAcademicYears: () =>
    apiClient.get<AcademicYearOption[]>(`${ENDPOINTS.AcademicYears}/options`),

  // Get grades options
  getGrades: () =>
    apiClient.get<GradeOption[]>(`${ENDPOINTS.grades}/options`),

  // Get courses options
  getCourses: () =>
    apiClient.get<CourseOption[]>(`${ENDPOINTS.courses}/options`),

  // Get courses assigned to a grade with their names
  getCoursesByYearAndGrade: (yearId: number, gradeId: number) =>
    apiClient.get<CourseOption[]>(`${base}/courses`, { yearId, gradeId }),
};
