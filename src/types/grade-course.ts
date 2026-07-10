// Types for Grade Courses module (RF-HU-021)
import type { Status } from "./index";

// Grade Course type - represents a course assigned to a grade
export interface GradeCourse {
  id: string;
  courseName: string;
  gradeName: string;
  levelName: string;
  section: string;
  date: string;
  status: Status;
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
}

export interface CourseOption {
  id: number;
  name: string;
}