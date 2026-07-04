import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/common/PublicOnlyRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import PortalPage from "@/pages/portal/PortalPage";
import LoginPage from "@/pages/auth/LoginPage";
import ActivateAccountPage from "@/pages/auth/ActivateAccountPage";
import ActivationStatusPage from "@/pages/auth/ActivationStatusPage";

import Dashboard from "@/pages/Dashboard";
import EstudiantesPage from "@/pages/estudiantes/EstudiantesPage";
import EstudianteFormPage from "@/pages/estudiantes/EstudianteFormPage";
import DocentesPage from "@/pages/docentes/DocentesPage";
import NivelesPage from "@/pages/niveles/NivelesPage";
import AulasPage from "@/pages/aulas/AulasPage";
import GradosPage from "@/pages/grados/GradosPage";
import CursosPage from "@/pages/cursos/CursosPage";
import TurnosPage from "@/pages/turnos/TurnosPage";
import AnioAcademicoPage from "@/pages/anio-academico/AnioAcademicoPage";
import TiposEvaluacionPage from "@/pages/tipos-evaluacion/TiposEvaluacionPage";
import AccesosPage from "@/pages/accesos/AccesosPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas: portal institucional y autenticación (RF-HU-008, RF-HU-007, RF-HU-004) */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/" element={<PortalPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/activar-cuenta" element={<ActivateAccountPage />} />
          </Route>

          {/* Rutas protegidas: requieren sesión activa */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/estudiantes" element={<EstudiantesPage />} />
              <Route path="/estudiantes/nuevo" element={<EstudianteFormPage />} />
              <Route path="/estudiantes/:id/editar" element={<EstudianteFormPage />} />

              <Route path="/docentes" element={<DocentesPage />} />
              <Route path="/niveles" element={<NivelesPage />} />
              <Route path="/aulas" element={<AulasPage />} />
              <Route path="/grados" element={<GradosPage />} />
              <Route path="/cursos" element={<CursosPage />} />
              <Route path="/turnos" element={<TurnosPage />} />
              <Route path="/anio-academico" element={<AnioAcademicoPage />} />
              <Route path="/tipos-evaluacion" element={<TiposEvaluacionPage />} />
              <Route path="/accesos" element={<AccesosPage />} />
              <Route path="/activacion-cuentas" element={<ActivationStatusPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
