import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type {
  TeacherAssignmentTree,
  TeacherAssignmentPayload,
  TeacherAssignmentReport,
  ReportFilters,
  TeacherOption,
  AcademicYearOption,
  GradeOption,
  CourseOption,
} from "@/types/teacher-assignment";

const base = "/teacher-assignments";
const reportBase = "/teacher-assignment-report";

export const teacherAssignmentsService = {
  // Get the full tree for a teacher
  getTree: (academicYearId: number, teacherId: number) =>
    apiClient.get<TeacherAssignmentTree>(base, { academicYearId, teacherId }),

  // Save all assignments (PUT)
  save: (payload: TeacherAssignmentPayload) =>
    apiClient.put<{ success: boolean; message: string }>(base, payload),

  // Get academic years options
  getAcademicYears: () =>
    apiClient.get<AcademicYearOption[]>(`${ENDPOINTS.AcademicYears}/options`),

  // Get teachers options
  getTeachers: (search?: string, status?: string) =>
    apiClient.get<TeacherOption[]>(`${ENDPOINTS.teachers}/options`, { search, status }),

  // Get grades options
  getGrades: () =>
    apiClient.get<GradeOption[]>(`${ENDPOINTS.grades}/options`),

  // Get courses options
  getCourses: () =>
    apiClient.get<CourseOption[]>(`${ENDPOINTS.courses}/options`),

  // Search report
  searchReport: (filters: ReportFilters) =>
    apiClient.post<TeacherAssignmentReport>(`${reportBase}/search`, filters),
};