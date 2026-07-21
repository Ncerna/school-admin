// Centralizing routes avoids "magic strings" scattered across services and
// makes it trivial to adjust a path if the backend contract changes.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    activate: "/auth/activate",
    verifyCode: "/auth/verify-code",
    changePassword: "/auth/change-password",
  },
  users: {
    resendCredentials: (id: string) => `/users/${id}/resend-credentials`,
    activateByAdmin: (id: string) => `/users/${id}/activate-by-admin`,
  },
  accounts: {
    activationStatus: "/users/pending-activation",
  },
  
  students: "/students",
  teachers: "/teachers",
  levels: "/levels",
  classrooms: "/classrooms",
  grades: "/grades",
  courses: "/courses",
  shifts: "/shifts",
  AcademicYears: "/years",
  evaluationTypes: "/evaluation-types",
  evaluationPeriods: "/evaluation-period",
  roles: "/roles",
  rolesOptions: "/roles/options",
  menus: "/menus",
  gradeCourses: "/grade-courses",
  publications: "/publications",
  school: "/school",
  feeSchedules: "/fee-schedules",
  chargeTypes: "/charge-types",
  enrollments: "/enrollments",
  enrollmentPreview: "/enrollments/preview",
  enrollmentConfirm: "/enrollments/confirm",
  payments: "/payments",
  enrollmentCharges: (id: number) => `/enrollments/${id}/charges`,
  paymentMethods: "/payment-methods",
 
  payEnrollment: (id: number) => `/enrollments/${id}/pay-enrollment`,
  payTuition: (id: number) => `/enrollments/${id}/pay-tuition`,
  paySupplies: (id: number) => `/enrollments/${id}/pay-supplies`,
  paymentsReport: "/payments/report",
  teacherAssignments: "/teacher-assignments",
  teacherAssignmentReport: "/teacher-assignment-report",
  evaluationCriteria: "/evaluation-criteria",
  guardians: "/guardians",
  staff: "/staff",
} as const;
