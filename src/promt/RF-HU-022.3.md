Flujo de usuario: esta es la pantalla base que va a reutilizar el cajero para cualquier tipo de cobro. Se llega a ella desde "Registrar pago" (botón de la matrícula recién creada, o buscando un estudiante matriculado desde un buscador). Muestra el estado de deuda del estudiante — todos sus cargos con su saldo pendiente — y permite seleccionar uno o varios para cobrar. Como 022.4 y 022.5 son casos particulares de esta misma pantalla (matrícula en cuotas / pensiones), construyo aquí un componente reutilizable que esas dos historias solo van a parametrizar (filtro de tipo de cargo + endpoint a llamar), en vez de duplicar la pantalla tres veces.

RF-HU-022.3 frontend: Cashier screen — charges list + generic payment
registration. Built as a reusable component so 022.4/022.5 wrap it
instead of duplicating it.

1. Types (src/types/payment.ts):
   - Charge { id, chargeType, installmentNumber, period, amount,
     balance, status, dueDate }
   - RegisterPaymentPayload { paymentMethodCode, cashPointId, amount,
     reference: string | null, chargeIds: number[] | null }
   - PaymentAllocation { chargeId, chargeType, period, amountApplied,
     chargeStatus }
   - PaymentResult { id, enrollmentId, amount, paidAt, method,
     reference, unappliedAmount, allocations: PaymentAllocation[] }

2. Endpoints (extend ENDPOINTS):
   payments: "/payments",
   enrollmentCharges: (id: number) => `/enrollments/${id}/charges`,

3. Service (src/services/payments.service.ts), plain apiClient calls:
   getCharges: (enrollmentId: number, chargeType?: string) =>
     apiClient.get<Charge[]>(ENDPOINTS.enrollmentCharges(enrollmentId),
       chargeType ? { chargeType } : undefined)
   register: (endpoint: string, payload: RegisterPaymentPayload) =>
     apiClient.post<PaymentResult>(endpoint, payload)
   (register takes the endpoint as a parameter on purpose — 022.3 posts
   to "/payments", 022.4 will post to "/enrollments/{id}/pay-enrollment",
   022.5 to "/enrollments/{id}/pay-tuition"; same payload shape, same
   response shape, only the URL changes.)

4. Component (src/components/payments/ChargesPaymentPanel.tsx) —
   props: { enrollmentId: number, chargeTypeFilter?: string,
   submitEndpoint: string, methodLocked?: string }. This is NOT a page,
   it's the shared panel both this history and 022.4/022.5 render
   inside their own page shell.

   Flow inside the component:
   a. On mount, call paymentsService.getCharges(enrollmentId,
      chargeTypeFilter) and render a DataTable: checkbox column,
      Tipo (mapped label), Cuota/Periodo, Monto, Saldo (balance),
      Vencimiento, Estado (StatusBadge — Pending/Partial in default
      colors, Paid rows rendered but their checkbox disabled since
      balance is 0).
   b. Selecting checkboxes accumulates selected charge ids in local
      state and auto-fills the amount Input with the sum of their
      balance — the amount stays editable afterward (the cashier may
      receive less than the full balance, that's a valid partial
      payment; the backend handles it, this screen just proposes a
      sensible default).
   c. SelectField for payment method (from /payment-methods, unless
      methodLocked is passed — skip rendering the field and use that
      fixed code, not needed yet but keeps the component ready) and
      cash point (from /cash-points).
   d. Reference Input, required only when the selected method's code
      is not CASH (client-side hint; backend is the source of truth).
   e. Submit button (LoadingButton) calls
      paymentsService.register(submitEndpoint, {
        paymentMethodCode, cashPointId, amount, reference,
        chargeIds: selectedIds.length ? selectedIds : null
      }).
      If the cashier typed an amount without selecting any checkbox,
      chargeIds goes as null — this is the intentional "auto-allocate,
      I don't want to pick months" path the backend already supports.
   f. On success, show the returned PaymentResult: list of
      allocations applied (chargeType/period/amountApplied/newStatus),
      and if unappliedAmount > 0, an inline warning: "S/{amount} no se
      pudo aplicar, no hay más cargos pendientes de este tipo." Then
      re-fetch getCharges to refresh balances/status in the table
      (don't just patch local state — trust the server's recalculated
      truth).
   g. On error, surface backend validation messages inline (e.g.
      "Todos los cargos deben pertenecer a esta matrícula").

5. Page (src/pages/payments/RegisterPaymentPage.tsx) — the concrete
   page for this history (022.4/022.5 will have their own thin pages):
   - Route param :enrollmentId (or a student search step first if
     arriving without one — reuse the SearchInput pattern from
     EnrollmentFormPage to find the enrollment by student name/dni,
     hitting a simple GET /enrollments?studentSearch=... if available,
     otherwise route here only from the "Registrar pago" button on
     022.2's success screen for now).
   - Header showing student/grade/year (from the enrollment, fetched
     once).
   - Renders <ChargesPaymentPanel enrollmentId={id}
     submitEndpoint={ENDPOINTS.payments} /> with no chargeTypeFilter —
     this is the "cobrar cualquier cosa pendiente" screen, distinct
     from the type-locked screens in 022.4/022.5.

6. Navigation: add "Registrar pago" under "Pagos" in nav-items.ts
   (icon: Receipt), pointing to /pagos/registrar (search-first entry
   point) — separate from the direct-link flow reached via 022.2's
   success screen.

7. Routes: register in App.tsx, same pattern as prior histories.

All code (names, comments) in English; UI copy in Spanish. Do not
duplicate ChargesPaymentPanel's logic in future histories — 022.4 and
022.5 must import and reuse it.