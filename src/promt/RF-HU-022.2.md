RF-HU-022.2 frontend: Enrollment — list, preview, confirm. No payment UI
of any kind belongs in this history.

1. Types (src/types/enrollment.ts):
   - EnrollmentListItem { id, studentName, gradeName, yearName,
     enrolledAt, status }
   - GeneratedCharge { id?, chargeType, installmentNumber, period,
     amount, dueDate, status? } (id/status absent in preview response,
     present in confirm response — make both optional)
   - EnrollmentPreview { studentName, gradeName, yearName,
     charges: GeneratedCharge[] }
   - EnrollmentConfirmed { id, studentName, gradeName, yearName,
     enrolledAt, status, pdfUrl, charges: GeneratedCharge[] }
   - EnrollmentPayload { studentId, gradeId, yearId, enrolledAt,
     enrollmentInstallments?: number, willPayTuition: boolean }
     (this exact same shape is sent to BOTH preview and confirm)

2. Endpoints (extend ENDPOINTS):
   enrollments: "/enrollments",
   enrollmentPreview: "/enrollments/preview",
   enrollmentConfirm: "/enrollments/confirm",

3. Service (src/services/enrollments.service.ts):
   list: createCrudService-style list() for the standard
     { items, pagination } shape, filterable by yearId/gradeId/search
     (this part CAN use createCrudService's list method since it's a
     plain paginated GET).
   preview: (payload: EnrollmentPayload) =>
     apiClient.post<EnrollmentPreview>(ENDPOINTS.enrollmentPreview, payload)
   confirm: (payload: EnrollmentPayload) =>
     apiClient.post<EnrollmentConfirmed>(ENDPOINTS.enrollmentConfirm, payload)
   getPdfUrl: (id: number) => `${API_BASE_URL}/enrollments/${id}/pdf`
   (preview/confirm are plain apiClient calls, not part of
   createCrudService — keep the payload object in local component
   state between the two calls, no server-side caching involved.)

4. Page — list (src/pages/enrollment/EnrollmentListPage.tsx):
   - ApiCrudPage-style screen using useCrudResource against
     enrollmentsService.list, filters: Academic Year SelectField, Grade
     SelectField, search Input (student name/dni) — same pattern as
     other list pages (e.g. FeeSchedulePage's year/grade filters).
   - DataTable columns: Estudiante, Grado, Año, Fecha de matrícula,
     Estado (StatusBadge).
   - "Nueva matrícula" button navigates to /matricula/nuevo (a route,
     NOT a modal/dialog — the form is too long for that pattern).

5. Page — form + review, both in ONE page component with two internal
   view states, not two routes (src/pages/enrollment/
   EnrollmentFormPage.tsx):

   View state "form":
   - Estudiante: SearchInput/async lookup (same pattern as elsewhere).
   - Grado: SelectField from /grades/options.
   - Año académico: SelectField from /years/options.
   - Fecha de matrícula: date Input, default today, must fall within
     the selected year (client-side hint only).
   - Checkbox "¿Matrícula en cuotas?" -> reveals number Input "Número
     de cuotas" (min 2) when checked; when unchecked,
     enrollmentInstallments is omitted from the payload entirely.
   - Select "¿Pagará pensiones mensuales?" (Sí/No) -> maps directly to
     willPayTuition: boolean.
   - Button "Continuar" (LoadingButton): calls
     enrollmentsService.preview(payload), stores both the payload AND
     the preview response in local state, switches view state to
     "review". On error (e.g. DuplicateEnrollmentException,
     DuplicateGradeEnrollmentException, NoVacanciesException), show the
     backend's message inline and stay on the form — do not switch view.

   View state "review":
   - Read-only header: studentName / gradeName / yearName.
   - Read-only DataTable of preview.charges — columns: Tipo (mapped
     label: ENROLLMENT->"Matrícula", TUITION->"Pensión",
     SUPPLIES->"Útiles"), Cuota (installmentNumber or "-"), Periodo
     (period or "-"), Monto, Vencimiento. NO checkboxes, NO payment
     method field, NO amount-editing — this table exists purely for
     the secretary to show the parent what will be charged.
   - Button "Volver a editar" -> switches back to view state "form"
     without losing the filled fields (payload stays in state).
   - Button "Confirmar matrícula" (LoadingButton): calls
     enrollmentsService.confirm(payload) — the SAME payload object used
     for preview, re-sent as-is, nothing added. On success, switch to
     view state "success" with the EnrollmentConfirmed response. On
     error, show the message inline (a vacancy could have been taken by
     someone else between preview and confirm — surface
     NoVacanciesException clearly if it happens here).

   View state "success":
   - Summary of the confirmed enrollment + its charges (same table
     shape as review, now with real ids/status, all "Pending").
   - Button "Descargar PDF" -> opens enrollmentsService.getPdfUrl(id) in
     a new tab (if pdfUrl was null, still link to the same URL, the
     backend regenerates on demand).
   - Button "Registrar pago" -> navigates to
     /pagos/registrar/{enrollmentId} (the cashier screen from a
     separate history — this page only links to it, it does not
     implement any part of that flow).

6. Navigation: "Matrícula" as its own top-level nav-items.ts entry
   (icon: GraduationCap), pointing to /matricula.

7. Routes: register /matricula and /matricula/nuevo in App.tsx.

All code (names, comments) in English; UI copy in Spanish. This history
must not create, import, or reference any payment-related type,
service, endpoint, or component — that boundary is intentional.