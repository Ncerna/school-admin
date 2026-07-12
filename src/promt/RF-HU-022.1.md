Flujo de usuario: un administrador entra a un módulo nuevo "Pagos" en el sidebar, con 4 sub-pantallas tipo catálogo (igual que Niveles, Turnos, etc. que ya tienes). La única con algo de lógica extra es Tarifas, porque depende de año+grado: el admin selecciona un año académico y un grado, y ve/edita el monto de cada tipo de cargo (Matrícula, Pensión, Útiles) para esa combinación. Sin esto configurado, la matrícula (022.2) no puede calcular nada.

RF-HU-022.1 frontend: Fee schedules and payment catalogs.

Follow this project's exact conventions: createCrudService for simple
catalogs, useCrudResource for their list screens, ApiCrudPage/DataTable/
FormDialog/ConfirmDialog for the CRUD UI shell (same as LevelPage/
ShiftPage), SelectField for dropdowns, StatusBadge where a status column
exists.

1. Types (src/types/payment-catalog.ts):
   - ChargeType { id, code, name, isRecurring }
   - PaymentMethod { id, code, name }
   - CashPoint { id, name }
   - FeeSchedule { id, yearId, yearName, gradeId, gradeName,
     chargeTypeId, chargeTypeName, amount }
   - FeeSchedulePayload { yearId, gradeId, chargeTypeId, amount }

2. Endpoints (extend ENDPOINTS in src/lib/endpoints.ts):
   chargeTypes: "/charge-types",
   feeSchedules: "/fee-schedules",
   paymentMethods: "/payment-methods",
   cashPoints: "/cash-points",

3. Services — plain createCrudService for all four (they're standard
   CRUD, no custom logic needed):
   src/services/charge-types.service.ts
   src/services/fee-schedules.service.ts
   src/services/payment-methods.service.ts
   src/services/cash-points.service.ts
   Only fee-schedules.service.ts needs one extra function beyond the
   factory: list(params) must support yearId/gradeId as extra query
   params (already supported by ListParams' index signature, no new
   code needed beyond passing extraParams into useCrudResource).

4. Pages — three trivial catalog pages (ChargeTypePage.tsx,
   PaymentMethodPage.tsx, CashPointPage.tsx) built exactly like
   LevelPage.tsx: ApiCrudPage wrapping useCrudResource + DataTable +
   FormDialog with name/code fields.

   FeeSchedulePage.tsx is the one with real flow:
   - Two SelectField at the top: Academic Year (reuse
     useLookupOptions against /years/options) and Grade (against
     /grades/options).
   - Once both are selected, useCrudResource's list call passes
     { yearId, gradeId } as extraParams — the table below refreshes to
     show only that grade/year's fee schedules (one row per charge
     type: Matrícula, Pensión, Útiles).
   - "Nuevo" opens FormDialog pre-filled with the already-selected
     yearId/gradeId (hidden fields) and a SelectField for chargeTypeId
     (options from chargeTypesService.list()) + an amount Input.
   - Edit/Delete on each row work through the same FormDialog/
     ConfirmDialog as any other catalog page — no custom logic.

5. Navigation: add a new "Pagos" section to nav-items.ts (icon: Wallet
   from lucide-react), with a "Tarifas" item pointing to
   /pagos/tarifas, plus "Métodos de pago" and "Cajas" under it if you
   want them editable from the UI (otherwise seed-only is fine and you
   can skip their nav items).

6. Routes: register FeeSchedulePage (and the catalog pages you expose)
   in App.tsx inside ProtectedRoute + DashboardLayout, same pattern as
   /grade-courses.

All code (names, comments) in English; UI copy in Spanish.