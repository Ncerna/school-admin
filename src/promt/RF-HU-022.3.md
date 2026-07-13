RF-HU-022.3 frontend: Generic payment screen (cashier), supporting split
payment across multiple methods (e.g. part cash, part Yape) in a single
submission. Follow every instruction below in order — this project
already has an established structure, so most steps are "locate and
reuse", not "create from zero".

EN EL MÓDULO DE TIPOS (src/types/):
- Si no existe el archivo src/types/payment.ts, créalo. Si ya existe
  (de un intento anterior), ábrelo y reemplaza su contenido por el
  siguiente, sin dejar tipos antiguos con forma distinta:

  export interface Charge {
    id: number;
    chargeType: string;
    installmentNumber: number | null;
    period: string | null;
    amount: number;
    balance: number;
    status: string;
    dueDate: string;
  }

  export interface PaymentMethodEntry {
    paymentMethodCode: string;
    amount: number;
    reference: string | null;
  }

  export interface RegisterPaymentPayload {
    payableType: "enrollment";
    payableId: number;
    methods: PaymentMethodEntry[];
    chargeIds: number[] | null;
    chargeTypeCode?: string | null;
  }

  export interface PaymentAllocation {
    chargeId: number;
    chargeType: string;
    period: string | null;
    amountApplied: number;
    chargeStatus: string;
  }

  export interface PaymentResult {
    id: number;
    method: string;
    amount: number;
    reference: string | null;
    paidAt: string;
    allocations: PaymentAllocation[];
  }

  export interface PaymentBatchResult {
    payments: PaymentResult[];
    unappliedAmount: number;
  }

EN EL MÓDULO DE ENDPOINTS (src/lib/endpoints.ts):
- Abre el archivo. Si las siguientes claves NO existen dentro del
  objeto ENDPOINTS, agrégalas (no reestructures las claves existentes):
  payments: "/payments",
  enrollmentCharges: (id: number) => `/enrollments/${id}/charges`,
  paymentMethods: "/payment-methods/options",

EN EL MÓDULO DE SERVICIOS (src/services/):
- Si no existe src/services/payments.service.ts, créalo. Usa apiClient
  directamente (NO createCrudService, porque este recurso no es un
  CRUD estándar de listar/crear/editar/eliminar):

  export const paymentsService = {
    getCharges: (enrollmentId: number, chargeType?: string) =>
      apiClient.get<Charge[]>(
        ENDPOINTS.enrollmentCharges(enrollmentId),
        chargeType ? { chargeType } : undefined
      ),
    register: (endpoint: string, payload: RegisterPaymentPayload) =>
      apiClient.post<PaymentBatchResult>(endpoint, payload),
  };

  (register recibe el endpoint como parámetro a propósito: esta misma
  función la van a reutilizar 022.4 con "/enrollments/{id}/pay-enrollment"
  y 022.5 con "/enrollments/{id}/pay-tuition" — no dupliques esta
  función en esas historias, impórtala de aquí.)

- Si no existe src/services/payment-methods.service.ts, créalo con
  createCrudService (este sí es un catálogo simple de solo lectura
  desde esta pantalla):

  export const paymentMethodsService = createCrudService<PaymentMethod>(
    ENDPOINTS.paymentMethods
  );

EN EL MÓDULO DE COMPONENTES (src/components/payments/):
- Si no existe la carpeta src/components/payments/, créala.
- Dentro, crea el archivo ChargesPaymentPanel.tsx. Este componente NO
  es una página — es un panel reutilizable que va a recibir estas
  props:

  interface ChargesPaymentPanelProps {
    payableId: number;
    chargeTypeFilter?: string;
    submitEndpoint: string;
  }

- Dentro del componente, sigue estos pasos EN ORDEN:

  1. Al montar el componente, llama a
     paymentsService.getCharges(payableId, chargeTypeFilter) y guarda
     el resultado en estado local. Mientras carga, muestra un spinner
     (reutiliza el componente de loading que ya existe en el proyecto).

  2. Renderiza un DataTable con las columnas: checkbox (deshabilitado
     si el cargo ya está "Paid"), Tipo (mapea chargeType: ENROLLMENT ->
     "Matrícula", TUITION -> "Pensión", SUPPLIES -> "Útiles"), Cuota/
     Periodo (installmentNumber o period, "-" si ambos son null),
     Monto, Saldo (balance), Estado (usa el componente StatusBadge que
     ya existe en el proyecto), Vencimiento.

  3. Selecciona los cargos: al marcar/desmarcar un checkbox, guarda los
     ids seleccionados en un arreglo de estado (selectedChargeIds).
     Calcula automáticamente totalSelected = suma de balance de los
     cargos seleccionados. Este total se usa en el paso 5.

  4. Debajo de la tabla, renderiza la sección "Métodos de pago" así:
     a. Empieza SIEMPRE con una fila de método visible por defecto
        (no vacía la lista — el cajero casi siempre usa un solo
        método).
     b. Cada fila de método tiene: SelectField de método (opciones
        desde paymentMethodsService.list()), Input numérico de monto,
        Input de texto "Referencia" (solo visible/habilitado si el
        método seleccionado en esa fila no es "CASH").
     c. Debajo de la última fila, un botón de texto "+ Agregar otro
        método de pago" que agrega una fila nueva vacía al arreglo de
        métodos en estado.
     d. Cada fila agregada (excepto si es la única) debe tener un
        ícono de eliminar (X) para quitarla del arreglo.
     e. Debajo de todas las filas, muestra en tiempo real:
        "Total ingresado: S/{suma de amount de todas las filas}" y,
        si selectedChargeIds no está vacío, también
        "Total seleccionado: S/{totalSelected}" — si ambos números no
        coinciden, muestra el texto en amarillo/advertencia (no
        bloquea el envío, es informativo, ya que el backend acepta
        pagos parciales o con excedente).

  5. Botón "Registrar pago" (usa el componente LoadingButton que ya
     existe en el proyecto):
     a. Deshabilitado si: no hay al menos un método con amount > 0, o
        algún método distinto de CASH tiene reference vacío.
     b. Al hacer clic, llama a:
        paymentsService.register(submitEndpoint, {
          payableType: "enrollment",
          payableId,
          methods: metodosConAmountMayorACero,
          chargeIds: selectedChargeIds.length ? selectedChargeIds : null,
          chargeTypeCode: chargeTypeFilter ?? null,
        })

  6. Al recibir la respuesta (PaymentBatchResult):
     a. Muestra una lista de confirmación: por cada payment en
        payments[], renderiza "S/{amount} vía {method}" seguido de sus
        allocations (chargeType/period/amountApplied/chargeStatus).
     b. Si unappliedAmount > 0, muestra un mensaje de advertencia
        visible: "S/{unappliedAmount} no se pudo aplicar a ningún
        cargo pendiente."
     c. Vuelve a llamar a paymentsService.getCharges(...) para
        refrescar la tabla del paso 2 con los saldos/estados reales
        (no edites el estado local manualmente — confía en lo que
        regresa el servidor).
     d. Limpia selectedChargeIds y vuelve a dejar una sola fila de
        método vacía, lista para un nuevo pago.

  7. Si la llamada del paso 5 falla, muestra el mensaje de error del
     backend en la parte superior del panel (reutiliza el patrón de
     manejo de errores que ya usan los demás formularios del proyecto,
     ej. StudentFormPage), sin perder lo que el cajero ya había
     seleccionado o escrito.

EN EL MÓDULO DE PÁGINAS (src/pages/payments/):
- Si no existe la carpeta src/pages/payments/, créala.
- Crea el archivo RegisterPaymentPage.tsx:
  1. Lee :enrollmentId de la URL (route param).
  2. Obtén los datos del encabezado (estudiante/grado/año) — si ya
     existe un endpoint GET /enrollments/{id} o similar reutilízalo; si
     no, omite el encabezado detallado y muestra solo el ID por ahora.
  3. Renderiza:
     <ChargesPaymentPanel payableId={enrollmentId}
       submitEndpoint={ENDPOINTS.payments} />
     (sin chargeTypeFilter — esta pantalla cobra cualquier tipo de
     cargo pendiente, a diferencia de 022.4/022.5 que sí filtran).

EN EL MÓDULO DE NAVEGACIÓN (src/components/layout/nav-items.ts):
- Si no existe una sección "Pagos", créala con un ícono Receipt de
  lucide-react.
- Dentro, si no existe la entrada "Registrar pago", agrégala apuntando
  a /pagos/registrar.

EN EL MÓDULO DE RUTAS (src/App.tsx):
- Si no existe la ruta /pagos/registrar/:enrollmentId, regístrala
  dentro del árbol ProtectedRoute + DashboardLayout, siguiendo el mismo
  patrón que las rutas de /estudiantes o /matricula.

TODO el código (nombres de variables, funciones, comentarios) en
inglés; los textos visibles al usuario (labels, botones, mensajes) en
español. No dupliques ChargesPaymentPanel — 022.4 y 022.5 deben
importarlo desde src/components/payments/ChargesPaymentPanel.tsx, no
copiarlo.