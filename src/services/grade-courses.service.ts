import { apiClient } from "@/lib/api-client";
import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import { ApiError } from "@/types/api";
import type { GradeCourse, GradeCoursePayload, GradeCourseFormState, AcademicYearOption, GradeOption, CourseOption, UpdateConfirmationResponse, AffectedCourse, ConflictErrorResponse } from "@/types/grade-course";

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
  // Returns full response to handle requires_confirmation
  // Note: On 409 conflict, the response has data in `errors` field, not `data`
  updateByYearAndGrade: async (yearId: number, gradeId: number, courseIds: number[], force: boolean = false) => {
    const response = await apiClient.requestWithData<UpdateConfirmationResponse>(
      `${base}/${yearId}/${gradeId}`,
      { method: "PUT", body: { yearId, gradeId, courseIds, force } }
    );

    // Handle 409 conflict - data is in errors field (not in the standard format)
    // The backend returns: { success: false, message: "...", data: null, errors: { success: false, requires_confirmation: true, message: "...", affected_courses: [...] } }
    if (!response.success && response.errors && (response.errors as any).affected_courses) {
      const errorData = response.errors as unknown as ConflictErrorResponse;
      return {
        success: false,
        message: response.message,
        data: {
          success: false,
          requires_confirmation: errorData.requires_confirmation,
          message: errorData.message,
          affected_courses: errorData.affected_courses,
        },
        errors: response.errors,
      };
    }

    return response;
  },

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

  // Get tree view data (flat list of assignments grouped by level/grade)
  // API returns { data: { items: [...] } }
  getTree: (yearId: number) =>
    apiClient.get<GradeCourseTreeResponse>(`${base}`, { yearId }),
};

// Tree view item type
export interface GradeCourseTreeItem {
  id: number;
  gradeId: number;
  courseId: number;
  yearId: number;
  courseName: string;
  gradeName: string;
  levelName: string;
  section: string;
  date: string;
  status: string;
  deletedAt: string | null;
}

// Response from getTree API - contains items array
export interface GradeCourseTreeResponse {
  items: GradeCourseTreeItem[];
}

// Grade catalog item for tree view
export interface GradeCatalogItem {
  gradeId: number;
  gradeName: string;
  levelName: string;
}
