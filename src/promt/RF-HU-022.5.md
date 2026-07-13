RF-HU-022.5 frontend: Pay TUITION charges — thin screen that reuses
ChargesPaymentPanel from RF-HU-022.3, plus a "seleccionar todo lo
pendiente" convenience feature (small addition to the shared panel,
benefits 022.3/022.4 too).

EN EL MÓDULO DE TIPOS (src/types/payment.ts):
- No se crean tipos nuevos. Debe existir ya desde 022.3.

EN EL MÓDULO DE ENDPOINTS (src/lib/endpoints.ts):
- Abre el archivo. Si la siguiente clave NO existe dentro del objeto
  ENDPOINTS, agrégala:
  payTuition: (id: number) => `/enrollments/${id}/pay-tuition`,

EN EL MÓDULO DE SERVICIOS (src/services/payments.service.ts):
- No se crean funciones nuevas. Reutiliza register(endpoint, payload)
  de 022.3, pasando ENDPOINTS.payTuition(id).

EN EL MÓDULO DE COMPONENTES (src/components/payments/ChargesPaymentPanel.tsx):
- Este es el ÚNICO archivo de componente que se modifica en esta
  historia (no se crea uno nuevo). Localiza la sección de la tabla de
  cargos (paso 2-3 del prompt de 022.3) y agrega, justo encima del
  encabezado de la tabla, un checkbox nuevo:
  "Seleccionar todo lo pendiente"
  - Al marcarlo: selectedChargeIds pasa a contener los ids de TODOS
    los cargos visibles con status "Pending" o "Partial" (no toca los
    "Paid", que ya tienen su checkbox deshabilitado).
  - Al desmarcarlo: selectedChargeIds vuelve a un arreglo vacío.
  - Si el usuario desmarca manualmente un checkbox individual mientras
    "Seleccionar todo" está marcado, el checkbox general debe pasar a
    estado indeterminado (no marcado, no vacío) — usa la prop
    indeterminate del checkbox si el componente ui/checkbox del
    proyecto la soporta; si no la soporta, simplemente desmarca el
    checkbox general en ese caso.
  Este cambio es genérico y queda disponible también para 022.3 y
  022.4 — no se condiciona a chargeTypeFilter, aunque es en pensiones
  donde más se va a usar (adelantar varios meses de una vez).

EN EL MÓDULO DE PÁGINAS (src/pages/payments/):
- Crea el archivo PayTuitionPage.tsx:
  1. Lee :enrollmentId de la URL (route param).
  2. Obtén los datos del encabezado igual que en PayEnrollmentPage.tsx
     (022.4) — mismo patrón, no dupliques la llamada, reutilízala si
     ya está extraída en un hook común; si no lo está, cópiala tal cual
     está en esa página (no la reinventes distinto).
  3. Muestra un título fijo: "Pagar pensiones".
  4. Renderiza:
     <ChargesPaymentPanel payableId={enrollmentId}
       chargeTypeFilter="TUITION"
       submitEndpoint={ENDPOINTS.payTuition(enrollmentId)} />
  5. Si el resultado de un pago (PaymentBatchResult) trae
     unappliedAmount > 0, NO ocultes el mensaje de advertencia del
     panel automáticamente — déjalo visible hasta que el usuario haga
     otra acción, ya que un excedente en pensiones puede necesitar
     revisión manual del contador después.

EN EL MÓDULO DE BÚSQUEDA PREVIA (src/pages/payments/PaymentSearchPage.tsx):
- Ya existe desde 022.4 y recibe targetRoute como prop/parámetro — NO
  la dupliques. Reutilízala pasando targetRoute="/pagos/pensiones".

EN EL MÓDULO DE NAVEGACIÓN (src/components/layout/nav-items.ts):
- Dentro de la sección "Pagos", si no existe la entrada "Pagar
  pensiones", agrégala apuntando a /pagos/pensiones.

EN EL MÓDULO DE RUTAS (src/App.tsx):
- Si no existen, registra:
  /pagos/pensiones -> PaymentSearchPage (con targetRoute="/pagos/pensiones")
  /pagos/pensiones/:enrollmentId -> PayTuitionPage

TODO el código (nombres, comentarios) en inglés; textos visibles en
español. No dupliques ChargesPaymentPanel ni PaymentSearchPage —
ambos se importan desde su ubicación original.