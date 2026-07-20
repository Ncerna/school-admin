import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/common/PublicOnlyRoute";
import { PendingRoute } from "@/components/common/PendingRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense, lazy } from "react";

// Lazy load pages for code splitting
const PortalPage = lazy(() => import("@/pages/portal/PortalPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ActivateAccountPage = lazy(() => import("@/pages/auth/ActivateAccountPage"));
const ChangePasswordPage = lazy(() => import("@/pages/auth/ChangePasswordPage"));
const ActivationStatusPage = lazy(() => import("@/pages/auth/ActivationStatusPage"));

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const StudentsPage = lazy(() => import("@/pages/students/StudentPage"));
const StudentFormPage = lazy(() => import("@/pages/students/StudentFormPage"));
const TeachersPage = lazy(() => import("@/pages/teachers/Teacher"));
const TeacherFormPage = lazy(() => import("@/pages/teachers/TeacherFormPage"));
const LevelsPage = lazy(() => import("@/pages/levels/LevelPage"));
const ClassroomsPage = lazy(() => import("@/pages/classrooms/ClassroomPage"));
const GradesPage = lazy(() => import("@/pages/grades/GradePage"));
const GradesListPage = lazy(() => import("@/pages/grades/GradesPage"));
const CoursesPage = lazy(() => import("@/pages/courses/CoursePage"));
const GradeCoursePage = lazy(() => import("@/pages/grade-courses/GradeCoursePage"));
const FeeSchedulePage = lazy(() => import("@/pages/fee-schedules/FeeSchedulePage"));
const EnrollmentFormPage = lazy(() => import("@/pages/enrollment/EnrollmentFormPage"));
const ShiftsPage = lazy(() => import("@/pages/shifts/ShiftPage"));
const AcademicYearPage = lazy(() => import("@/pages/academicYear/AcademicYearPage"));
const EvaluationTypePage = lazy(() => import("@/pages/evaluationType/EvaluationTypePage"));
const EvaluationPeriodPage = lazy(() => import("@/pages/evaluationPeriod/EvaluationPeriodPage"));
const AccessPage = lazy(() => import("@/pages/access/AccessPage"));
const SchoolPage = lazy(() => import("@/pages/school/SchoolPage"));
const PublicationPage = lazy(() => import("@/pages/publications/PublicationPage"));
const PublicationFormPage = lazy(() => import("@/pages/publications/PublicationFormPage"));
const RegisterPaymentPage = lazy(() => import("@/pages/payments/RegisterPaymentPage"));
const PaymentSearchPage = lazy(() => import("@/pages/payments/PaymentSearchPage"));
const PaymentsReportPage = lazy(() => import("@/pages/payments/PaymentsReportPage"));
const TeacherAssignmentPage = lazy(() => import("@/pages/teacher-assignments/TeacherAssignmentPage"));
const EvaluationCriteriaPage = lazy(() => import("@/pages/evaluation-criteria/EvaluationCriteriaPage"));
const GuardiansPage = lazy(() => import("@/pages/guardians/GuardiansPage"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const PreferencesPage = lazy(() => import("@/pages/preferences/PreferencesPage"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
          {/* Rutas públicas: portal institucional y autenticación (RF-HU-008, RF-HU-007, RF-HU-004) */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/" element={
              <Suspense fallback={<PageLoader />}>
                <PortalPage />
              </Suspense>
            } />
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <LoginPage />
              </Suspense>
            } />
          </Route>

          {/* Rutas con pending username: activar cuenta y cambiar contraseña */}
          <Route element={<PendingRoute />}>
            <Route path="/activar-cuenta" element={
              <Suspense fallback={<PageLoader />}>
                <ActivateAccountPage />
              </Suspense>
            } />
            <Route path="/cambiar-contrasena" element={
              <Suspense fallback={<PageLoader />}>
                <ChangePasswordPage />
              </Suspense>
            } />
          </Route>

          {/* Rutas protegidas: requieren sesión activa */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              } />

              <Route path="/estudiantes" element={
                <Suspense fallback={<PageLoader />}>
                  <StudentsPage />
                </Suspense>
              } />
              <Route path="/estudiantes/nuevo" element={
                <Suspense fallback={<PageLoader />}>
                  <StudentFormPage />
                </Suspense>
              } />
              <Route path="/estudiantes/editar" element={
                <Suspense fallback={<PageLoader />}>
                  <StudentFormPage />
                </Suspense>
              } />

              <Route path="/docentes" element={
                <Suspense fallback={<PageLoader />}>
                  <TeachersPage />
                </Suspense>
              } />
              <Route path="/docentes/nuevo" element={
                <Suspense fallback={<PageLoader />}>
                  <TeacherFormPage />
                </Suspense>
              } />
              <Route path="/docentes/editar" element={
                <Suspense fallback={<PageLoader />}>
                  <TeacherFormPage />
                </Suspense>
              } />

              <Route path="/niveles" element={
                <Suspense fallback={<PageLoader />}>
                  <LevelsPage />
                </Suspense>
              } />
              <Route path="/aulas" element={
                <Suspense fallback={<PageLoader />}>
                  <ClassroomsPage />
                </Suspense>
              } />
              <Route path="/grados" element={
                <Suspense fallback={<PageLoader />}>
                  <GradesPage />
                </Suspense>
              } />
              <Route path="/cursos" element={
                <Suspense fallback={<PageLoader />}>
                  <CoursesPage />
                </Suspense>
              } />
              <Route path="/grade-courses" element={
                <Suspense fallback={<PageLoader />}>
                  <GradeCoursePage />
                </Suspense>
              } />
              <Route path="/turnos" element={
                <Suspense fallback={<PageLoader />}>
                  <ShiftsPage />
                </Suspense>
              } />
              <Route path="/anio-academico" element={
                <Suspense fallback={<PageLoader />}>
                  <AcademicYearPage />
                </Suspense>
              } />
              <Route path="/tipos-evaluacion" element={
                <Suspense fallback={<PageLoader />}>
                  <EvaluationTypePage />
                </Suspense>
              } />
              <Route path="/periodos-evaluacion" element={
                <Suspense fallback={<PageLoader />}>
                  <EvaluationPeriodPage />
                </Suspense>
              } />
              <Route path="/accesos" element={
                <Suspense fallback={<PageLoader />}>
                  <AccessPage />
                </Suspense>
              } />
              <Route path="/activacion-cuentas" element={
                <Suspense fallback={<PageLoader />}>
                  <ActivationStatusPage />
                </Suspense>
              } />

              <Route path="/colegio" element={
                <Suspense fallback={<PageLoader />}>
                  <SchoolPage />
                </Suspense>
              } />

              <Route path="/publicaciones" element={
                <Suspense fallback={<PageLoader />}>
                  <PublicationPage />
                </Suspense>
              } />
              <Route path="/publicaciones/nuevo" element={
                <Suspense fallback={<PageLoader />}>
                  <PublicationFormPage />
                </Suspense>
              } />
              <Route path="/publicaciones/:id/editar" element={
                <Suspense fallback={<PageLoader />}>
                  <PublicationFormPage />
                </Suspense>
              } />

              {/* Fee Schedules (RF-HU-022.1) */}
              <Route path="/fee-schedules" element={
                <Suspense fallback={<PageLoader />}>
                  <FeeSchedulePage />
                </Suspense>
              } />

              {/* Enrollment (RF-HU-022.2) */}
              <Route path="/matricula" element={
                <Suspense fallback={<PageLoader />}>
                  <EnrollmentFormPage />
                </Suspense>
              } />
              <Route path="/matricula/nuevo" element={
                <Suspense fallback={<PageLoader />}>
                  <EnrollmentFormPage />
                </Suspense>
              } />
              
              {/* Payments (RF-HU-022.3) - Single unified flow */}
              <Route path="/pagos/registrar" element={
                <Suspense fallback={<PageLoader />}>
                  <PaymentSearchPage targetRoute="/pagos/registrar" />
                </Suspense>
              } />
              <Route path="/pagos/registrar/:enrollmentId" element={
                <Suspense fallback={<PageLoader />}>
                  <RegisterPaymentPage />
                </Suspense>
              } />

              {/* Payments Report (RF-HU-022.6) */}
              <Route path="/pagos/reporte" element={
                <Suspense fallback={<PageLoader />}>
                  <PaymentsReportPage />
                </Suspense>
              } />

{/* Teacher Assignments (RF-HU-024) */}
              <Route path="/asignaciones-docente" element={
                <Suspense fallback={<PageLoader />}>
                  <TeacherAssignmentPage />
                </Suspense>
              } />

              {/* Evaluation Criteria (RF-HU-025) */}
              <Route path="/criterios-evaluacion" element={
                <Suspense fallback={<PageLoader />}>
                  <EvaluationCriteriaPage />
                </Suspense>
              } />

              {/* Guardians (RF-HU-026) */}
              <Route path="/apoderados" element={
                <Suspense fallback={<PageLoader />}>
                  <GuardiansPage />
                </Suspense>
              } />

{/* Grades/Scores (en desarrollo) */}
              <Route path="/notas" element={
                <Suspense fallback={<PageLoader />}>
                  <GradesListPage />
                </Suspense>
              } />

              {/* Configuración (en desarrollo) */}
              <Route path="/perfil" element={
                <Suspense fallback={<PageLoader />}>
                  <ProfilePage />
                </Suspense>
              } />
              <Route path="/preferencias" element={
                <Suspense fallback={<PageLoader />}>
                  <PreferencesPage />
                </Suspense>
              } />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
