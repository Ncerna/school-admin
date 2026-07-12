Prompt — RF-HU-022.6 Frontend (Reporte de pagos)
Flujo: el contador entra a "Reporte de pagos", filtra por rango de fechas / método / caja / tipo de cargo / estudiante, ve una tabla paginada con el detalle línea por línea (un pago que cubrió 3 meses aparece como 3 filas, cada una trazable a su cargo), y un total acumulado del filtro aplicado — no solo de la página visible.

RF-HU-022.6 frontend: Payments report — read-only, filterable,
paginated table for accounting.

1. Types (src/types/payment-report.ts):
   - PaymentReportRow { paymentId, paidAt, amount, paymentAmount,
     method, cashPoint, collectedBy, reference, student, chargeType,
     period, installmentNumber, enrollmentId }
   - PaymentReportFilters { dateFrom?, dateTo?, paymentMethodId?,
     cashPointId?, chargeTypeId?, studentSearch? }
   - PaymentReportSummary { totalAmount: number }
   - PaymentReportResponse extends PaginatedData<PaymentReportRow> but
     also carries `summary: PaymentReportSummary` (the backend returns
     it alongside items/pagination, not nested inside PaginatedData's
     generic shape — type this as its own interface, don't force it
     through the shared PaginatedData<T>).

2. Endpoint (extend ENDPOINTS):
   paymentsReport: "/payments/report",

3. Service (src/services/payments-report.service.ts), plain apiClient
   call (not createCrudService — the response shape includes `summary`
   which the generic factory doesn't know about):
   get: (params: ListParams & PaymentReportFilters) =>
     apiClient.get<PaymentReportResponse>(ENDPOINTS.paymentsReport, params)

4. Page (src/pages/payments/PaymentsReportPage.tsx):
   - Filter bar at top: date range (two date Inputs), SelectField for
     Payment Method (/payment-methods), Cash Point (/cash-points),
     Charge Type (/charge-types), and a SearchInput for student name/dni.
   - Below: reuse useCrudResource's pagination/loading state by passing
     paymentsReportService.get as the `list` function and the filter
     bar's current values as extraParams (same pattern as
     FeeSchedulePage's yearId/gradeId filtering in 022.1) — but note
     useCrudResource expects PaginatedData<T> back; since this endpoint
     also returns `summary`, either (a) extend useCrudResource minimally
     to optionally capture an extra top-level field from the raw
     response, or (b) skip useCrudResource here and write the
     page-level fetch/pagination state manually, matching its
     page/limit/debounced-search logic — prefer (a) if it's a small,
     backward-compatible addition; otherwise (b).
   - DataTable columns: Fecha (paidAt), Estudiante (student), Concepto
     (chargeType mapped to label + period/installmentNumber when
     present, e.g. "Pensión — Abril 2026" or "Matrícula — Cuota 2"),
     Monto aplicado (amount), Método (method), Caja (cashPoint),
     Cobrado por (collectedBy), Referencia (reference).
   - Footer row or a small card above the table showing
     summary.totalAmount for the current filter set, formatted as
     currency — must update whenever filters change, not just on page
     change.
   - No create/update/delete actions — this page is strictly
     read-only, no FormDialog/ConfirmDialog needed.

5. Navigation: add "Reporte de pagos" under "Pagos" in nav-items.ts
   (icon: FileBarChart), pointing to /pagos/reporte. Consider gating
   this nav item to an accountant/admin role if the project's
   role-based menu system (RoleController/AccessController) already
   supports per-item visibility — check AppSidebar.tsx/AccessPage.tsx
   before adding custom role logic here.

6. Routes: register in App.tsx.

All code in English; UI copy in Spanish.



RF-HU-022.6 frontend: ...

3.5. Extend src/hooks/useCrudResource.ts (do not create a parallel
     hook) to optionally capture a top-level `summary` field from the
     list response: add a third generic type param TExtra (default
     undefined), have CrudResourceApi.list return
     PaginatedData<TEntity> & { summary?: TExtra }, and store it in a
     new `summary` state field returned by the hook alongside items/
     pagination. This is additive only — every existing caller
     (StudentPage, LevelPage, etc.) keeps working unchanged since
     TExtra defaults to undefined and they never read `summary`.

4. Page (src/pages/payments/PaymentsReportPage.tsx):
   - Call useCrudResource<PaymentReportRow, never, PaymentReportSummary>(
       { list: paymentsReportService.get },
       { extraParams: currentFilters }
     ) and read `summary` from its return value for the totals card.
   - [resto del punto 4 igual que antes]