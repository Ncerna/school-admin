RF-HU-022.6 frontend: Payments report — read-only, filterable, paginated
table for accounting. This screen exists specifically so you can verify
that payments from 022.3/022.4/022.5 are being recorded correctly — no
create/edit/delete actions, purely a verification/audit view.

EN EL MÓDULO DE TIPOS (src/types/payment-report.ts):
- Si no existe, créalo con exactamente este contenido:

  export interface PaymentReportRow {
    paymentId: number;
    paidAt: string;
    amount: number;
    paymentAmount: number;
    method: string;
    collectedBy: string;
    reference: string | null;
    student: string;
    enrollmentId: number;
    chargeType: string;
    period: string | null;
    installmentNumber: number | null;
  }

  export interface PaymentReportFilters {
    dateFrom?: string;
    dateTo?: string;
    paymentMethodId?: number;
    chargeTypeId?: number;
    studentSearch?: string;
  }

  export interface PaymentReportSummary {
    totalAmount: number;
  }

  export interface PaymentReportResponse {
    items: PaymentReportRow[];
    pagination: { currentPage: number; limit: number; total: number; totalPage: number };
    summary: PaymentReportSummary;
  }

EN EL MÓDULO DE ENDPOINTS (src/lib/endpoints.ts):
- Agrega, si no existe:
  paymentsReport: "/payments/report",

EN EL MÓDULO DE SERVICIOS (src/services/payments-report.service.ts):
- Créalo con una llamada directa a apiClient (NO createCrudService,
  porque la respuesta trae `summary`, un campo que el factory genérico
  no conoce):

  export const paymentsReportService = {
    get: (params: ListParams & PaymentReportFilters) =>
      apiClient.get<PaymentReportResponse>(ENDPOINTS.paymentsReport, params),
  };

EXTENSIÓN NECESARIA A src/hooks/useCrudResource.ts (ya decidida
anteriormente, hazla ahora si no está hecha):
- Agrega un tercer parámetro genérico opcional TExtra (default
  undefined) al hook, que capture un campo `summary` de nivel superior
  en la respuesta y lo devuelva junto con items/pagination/loading. Esto
  es aditivo — ningún módulo existente (StudentPage, LevelPage, etc.) se
  ve afectado porque nunca leen ese campo.

EN EL MÓDULO DE FILTROS — esta es la parte central de la pantalla,
constrúyela así (cada filtro con su propósito explicado):

  1. Rango de fechas (dateFrom / dateTo): dos Input tipo date, en una
     fila. Filtra por paid_at — "¿qué se cobró entre estas fechas?".
     Sin esto seleccionado, trae todo el historial (puede ser mucho,
     así que considera un default razonable: últimos 30 días
     preseleccionados al entrar a la pantalla).

  2. Método de pago (paymentMethodId): SelectField poblado desde
     paymentMethodsService.list() (ya existe desde 022.3). Responde
     "¿cuánto entró en efectivo vs. Yape vs. transferencia?" — el uso
     típico es que el contador cuadre el efectivo físico contra este
     filtro puesto en CASH.

  3. Tipo de cargo (chargeTypeId): SelectField poblado desde
     chargeTypesService.list() (ya existe desde 022.1). Responde
     "¿cuánto se cobró específicamente de matrícula / pensión / útiles?"
     — separa ingresos por concepto, no por método.

  4. Buscador de estudiante (studentSearch): un SearchInput de texto
     libre (reutiliza el mismo patrón de debounce que ya usan los demás
     buscadores del proyecto, ej. StudentPage). Este es el filtro más
     importante para TU caso de uso puntual: si acabas de registrar un
     pago para "Ana García" en 022.3/022.4/022.5, escribe su nombre
     aquí y verifica que aparezca la fila correspondiente con el monto,
     método y cargo correctos — es la forma más rápida de confirmar que
     el pago se guardó bien sin entrar a la base de datos directamente.

  5. Todos los filtros se combinan con AND (fecha Y método Y tipo Y
     estudiante, todos los que estén activos al mismo tiempo) y se
     pasan como extraParams al hook de listado — cualquier cambio en
     un filtro debe resetear la página actual a 1 (no te quedes en la
     página 3 de un filtro anterior que ya no aplica).

EN EL MÓDULO DE PÁGINAS (src/pages/payments/PaymentsReportPage.tsx):
- Créalo:
  1. Barra de filtros arriba, con los 5 elementos descritos.
  2. Debajo, una tarjeta pequeña mostrando "Total del periodo filtrado:
     S/{summary.totalAmount}" — formateada como moneda, y que se
     actualice cada vez que cambian los filtros (no solo al cambiar de
     página).
  3. DataTable con columnas: Fecha (paidAt, formateada legible),
     Estudiante (student), Concepto (combina chargeType mapeado a
     etiqueta + period/installmentNumber si existen, ej.
     "Pensión — Mayo 2026" o "Matrícula — Cuota 2"), Monto aplicado
     (amount), Método (method), Cobrado por (collectedBy), Referencia
     (reference, "-" si es null).
  4. Nota importante para verificar pagos mixtos: si dos filas
     comparten el mismo paymentId, significa que ese pago se dividió
     entre esos cargos (o entre métodos, si viene de 022.4/022.5 con
     split) — no es un error ni una duplicación, agrega una pequeña
     indicación visual (ej. agrupar visualmente filas con el mismo
     paymentId con un borde compartido o un color de fondo alterno por
     grupo) para que se entienda de un vistazo que son parte del mismo
     pago.
  5. Sin botones de crear/editar/eliminar — es una pantalla 100%
     de lectura.
  6. Paginación estándar del proyecto (mismo componente que usan las
     demás listas).

EN EL MÓDULO DE NAVEGACIÓN (src/components/layout/nav-items.ts):
- Dentro de la sección "Pagos", agrega "Reporte de pagos" (icono
  FileBarChart de lucide-react) apuntando a /pagos/reporte.

EN EL MÓDULO DE RUTAS (src/App.tsx):
- Registra /pagos/reporte dentro del árbol ProtectedRoute +
  DashboardLayout.

CÓMO USAR ESTA PANTALLA PARA VALIDAR TUS PRUEBAS (no es código, es la
razón de ser de esta historia): después de registrar cualquier pago en
022.3, 022.4 o 022.5, entra aquí, filtra por el nombre del estudiante
que acabas de usar, y confirma que: (a) aparece una fila por cada
combinación pago-cargo esperada, (b) la suma de `amount` de las filas
con el mismo paymentId coincide con lo que registraste, (c) el
`summary.totalAmount` del periodo sube exactamente en lo que pagaste.
Si algo no cuadra ahí, el problema está en el motor de asignación de
022.3, no en el reporte — el reporte solo refleja lo que ya se guardó.

TODO el código (nombres, comentarios) en inglés; textos visibles en
español.