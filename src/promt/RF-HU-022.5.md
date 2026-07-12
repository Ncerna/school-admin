RF-HU-022.5 frontend: Pay tuition charges — thin wrapper around
ChargesPaymentPanel, scoped to TUITION.

1. No new types beyond payment.ts.

2. Endpoint (extend ENDPOINTS):
   payTuition: (id: number) => `/enrollments/${id}/pay-tuition`,

3. No new service functions — reuses register(endpoint, payload).

4. Component change (small addition to ChargesPaymentPanel from 022.3,
   not a new component): add an optional "Seleccionar todo lo
   pendiente" checkbox above the table header, visible always but most
   useful here — when toggled, it checks every row with status Pending
   or Partial in one click (covers "el padre quiere adelantar todo el
   año"). This is a generic addition to the shared panel, so 022.3's
   screen benefits too, not just this one.

5. Page (src/pages/payments/PayTuitionPage.tsx):
   - Route param :enrollmentId.
   - Same header pattern as 022.4's page.
   - Renders <ChargesPaymentPanel enrollmentId={id}
     chargeTypeFilter="TUITION"
     submitEndpoint={ENDPOINTS.payTuition(id)} />.
   - After a successful payment, if the response's unappliedAmount > 0,
     keep the warning message from the panel visible (don't auto-clear
     it) since overpayment on tuition is a case the accountant may want
     to reconcile manually.

6. Navigation: add "Pagar pensiones" under "Pagos" in nav-items.ts
   (icon: CalendarCheck), pointing to /pagos/pensiones, with the same
   search-first redirect pattern as 022.4 (/pagos/pensiones ->
   /pagos/pensiones/:enrollmentId).

7. Routes: register both in App.tsx.

All code in English; UI copy in Spanish.