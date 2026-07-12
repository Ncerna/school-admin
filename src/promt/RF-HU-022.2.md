Prompt — RF-HU-022.2 Frontend (Matrícula)
Flujo de usuario: el cajero/secretaria entra a "Matricular estudiante". Llena un formulario simple (buscar estudiante, elegir grado, elegir año académico, fecha de matrícula) y decide si la matrícula se paga completa o en cuotas — un checkbox "¿Matrícula en cuotas?" que, al marcarse, revela un campo numérico para indicar en cuántas partes. Al enviar, el formulario llama una sola vez a POST /enrollments/confirm — no hay pantalla de previsualización (eso ya se decidió que lo resuelve el servidor). La respuesta trae la matrícula creada, todos los cargos generados (matrícula, útiles, pensiones) y la URL del PDF. Se muestra un resumen de esos cargos en pantalla y un botón para abrir/descargar el PDF — y desde ahí, un botón directo a "Ir a registrar pago" que lleva al cajero a la pantalla de 022.4/022.5 con ese enrollmentId ya cargado.

RF-HU-022.2 frontend: Enrollment form — one-step confirm, no preview
round-trip, shows generated charges + PDF link on success.

1. Types (src/types/enrollment.ts):
   - GeneratedCharge { id, chargeType, installmentNumber, period,
     amount, dueDate, status }
   - Enrollment { id, studentName, gradeName, yearName, enrolledAt,
     status, pdfUrl, charges: GeneratedCharge[] }
   - ConfirmEnrollmentPayload { studentId, gradeId, yearId, enrolledAt,
     enrollmentInstallments?: number }

2. Endpoints (extend ENDPOINTS):
   enrollments: "/enrollments",
   enrollmentConfirm: "/enrollments/confirm",

3. Service (src/services/enrollments.service.ts) — plain apiClient
   calls, not createCrudService (this isn't a list/CRUD resource):
   confirm: (payload: ConfirmEnrollmentPayload) =>
     apiClient.post<Enrollment>(ENDPOINTS.enrollmentConfirm, payload)
   getPdfUrl: (id: number) => `${API_BASE_URL}/enrollments/${id}/pdf`

4. Page (src/pages/enrollment/EnrollmentFormPage.tsx):

   Step 1 — form (all in one screen, no wizard):
   - Student: SearchInput + async lookup (reuse the search pattern
     from StudentPage's search, hitting GET /students?search=...) —
     selecting one stores studentId + display name.
   - Grade: SelectField from /grades/options.
   - Academic Year: SelectField from /years/options.
   - Fecha de matrícula: date Input, defaulting to today, but must stay
     within the selected year's start/end (client-side hint only —
     the backend is the source of truth for that validation, just
     surface its error message if it comes back).
   - Checkbox "Matrícula en cuotas" (shadcn Checkbox). When checked,
     reveal a number Input "Número de cuotas" (min 2, max e.g. 12).
     When unchecked, enrollmentInstallments is omitted from the payload
     entirely (not sent as 1 — omit the key, per the backend contract).
   - Submit button using LoadingButton, disabled until student/grade/
     year/date are all set.

   Step 2 — on submit:
   - Call enrollmentsService.confirm(payload) directly. No preview
     call exists in this flow — the button says "Matricular" (not
     "Continuar" or "Revisar"), setting the right expectation that this
     is the final action.
   - On success, replace the form with a summary view (do not navigate
     away yet): student/grade/year/enrolledAt as a header, then a
     DataTable of the returned charges (columns: Tipo de cargo — map
     ENROLLMENT/TUITION/SUPPLIES to "Matrícula"/"Pensión"/"Útiles",
     Cuota (installmentNumber, "-" if null), Periodo (period, "-" if
     null), Monto, Vencimiento, Estado via StatusBadge — all Pending at
     this point).
   - Below the table, two buttons: "Ver / descargar PDF" (opens
     enrollmentsService.getPdfUrl(enrollment.id) in a new tab — if
     pdfUrl was null in the response, show a small notice "El PDF se
     está generando, puedes descargarlo en unos segundos" and still
     link to the same URL, since the backend regenerates on demand) and
     "Registrar pago ahora" (navigates to /pagos/matricula/:enrollmentId
     or /pagos/pensiones/:enrollmentId — whichever screen from 022.4/
     022.5 you build first; wire both once they exist).
   - On error, surface backend validation messages inline (e.g.
     "Ya existe una matrícula para este estudiante en este año",
     "La fecha de matrícula debe estar dentro del año académico") using
     the same error-display pattern as StudentFormPage.

5. Navigation: add "Matricular estudiante" under the existing
   "Estudiantes" section in nav-items.ts (icon: UserPlus), pointing to
   /matricula.

6. Routes: register in App.tsx inside ProtectedRoute + DashboardLayout.

All code (names, comments) in English; UI copy in Spanish. This page
does not touch students.service.ts, StudentPage.tsx, or any existing
CRUD service — only adds new files plus the two nav/route entries.