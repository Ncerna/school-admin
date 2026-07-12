Prompt — RF-HU-022.4 Frontend (Completar pago de matrícula en cuotas)Flujo: el cajero llega aquí desde la matrícula recién creada (si eligió cuotas) o buscando un estudiante con matrícula pendiente. Ve solo las cuotas de matrícula (no pensiones, no útiles) y paga una o varias. Es la misma pantalla base de 022.3, solo que pre-filtrada a ENROLLMENT y apuntando al endpoint específico.

RF-HU-022.4 frontend: Complete enrollment installments — thin wrapper
around ChargesPaymentPanel from 022.3, scoped to ENROLLMENT.

1. No new types beyond payment.ts from 022.3.

2. Endpoint (extend ENDPOINTS):
   payEnrollment: (id: number) => `/enrollments/${id}/pay-enrollment`,

3. No new service functions — payments.service.ts's register() already
   accepts the endpoint as a parameter; this history just passes a
   different one.

4. Page (src/pages/payments/PayEnrollmentPage.tsx):
   - Route param :enrollmentId.
   - Header with student/grade/year (same fetch as 022.3's page).
   - Renders <ChargesPaymentPanel enrollmentId={id}
     chargeTypeFilter="ENROLLMENT"
     submitEndpoint={ENDPOINTS.payEnrollment(id)} /> — the panel
     already filters getCharges by chargeType and posts to the given
     endpoint, no panel changes needed.
   - Nothing else — this page is intentionally thin.

5. Navigation: add "Completar matrícula" under "Pagos" in nav-items.ts
   (icon: ReceiptText), pointing to /pagos/matricula/:enrollmentId is
   not a nav-friendly URL (needs a param), so instead make the nav
   entry point to a small search screen /pagos/matricula that looks up
   the student (reuse SearchInput hitting the same enrollment search
   used in 022.3) and redirects to /pagos/matricula/:enrollmentId on
   selection. Also wire EnrollmentFormPage's "Registrar pago ahora"
   button (022.2) to link directly here when the enrollment used
   installments.

6. Routes: register both /pagos/matricula and
   /pagos/matricula/:enrollmentId in App.tsx.

All code in English; UI copy in Spanish.