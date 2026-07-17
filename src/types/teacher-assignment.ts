// Types for Teacher Assignments module (RF-HU-024)

// Course within a grade assignment
export interface GradeCourseAssignment {
  gradeCourseId: number;
  courseId: number;
  courseName: string;
  assigned: boolean;
}

// Grade with its courses in teacher assignment
export interface GradeAssignment {
  assignmentId: number | null;
  gradeId: number;
  gradeName: string;
  assigned: boolean;
  courses: GradeCourseAssignment[];
}

// Full tree response for a teacher
export interface TeacherAssignmentTree {
  academicYearId: number;
  teacher: {
    id: number;
    fullName: string;
  };
  grades: GradeAssignment[];
}

// Payload for saving teacher assignments
export interface TeacherAssignmentPayload {
  academicYearId: number;
  teacherId: number;
  grades: {
    gradeId: number;
    assigned: boolean;
    courses?: {
      gradeCourseId: number;
      assigned: boolean;
    }[];
  }[];
}

// Teacher option for selects
export interface TeacherOption {
  id: number;
  fullName: string;
  document: string;
}

// Academic year option
export interface AcademicYearOption {
  id: number;
  name: string;
  active: boolean;
}

// Grade option
export interface GradeOption {
  id: number;
  name: string;
}

// Course option
export interface CourseOption {
  id: number;
  name: string;
}

// Report types
export interface ReportCourse {
  courseId: number;
  courseName: string;
}

export interface ReportGrade {
  gradeId: number;
  gradeName: string;
  courses: ReportCourse[];
}

export interface ReportTeacher {
  teacherId: number;
  teacherName: string;
  grades: ReportGrade[];
}

export interface TeacherAssignmentReport {
  academicYearId: number;
  teachers: ReportTeacher[];
}

// Report search filters
export interface ReportFilters {
  academicYearId: number;
  teacherId: number | null;
  gradeId: number | null;
  courseId: number | null;
}