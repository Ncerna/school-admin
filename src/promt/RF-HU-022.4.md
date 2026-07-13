RF-HU-022.4 frontend: Pay ENROLLMENT installments — thin screen that
reuses ChargesPaymentPanel from RF-HU-022.3. No new panel logic, no new
types beyond what 022.3 already created.

EN EL MÓDULO DE TIPOS (src/types/payment.ts):
- No se crean tipos nuevos. Si el archivo no existe todavía (022.3 no
  se ejecutó antes que esta historia), créalo primero con exactamente
  el contenido especificado en el prompt de RF-HU-022.3 antes de
  continuar con esta historia.

EN EL MÓDULO DE ENDPOINTS (src/lib/endpoints.ts):
- Abre el archivo. Si la siguiente clave NO existe dentro del objeto
  ENDPOINTS, agrégala (no reestructures las claves existentes):
  payEnrollment: (id: number) => `/enrollments/${id}/pay-enrollment`,

EN EL MÓDULO DE SERVICIOS (src/services/payments.service.ts):
- No se crean funciones nuevas. La función register(endpoint, payload)
  ya definida en 022.3 acepta el endpoint como parámetro — en esta
  historia simplemente se le pasa ENDPOINTS.payEnrollment(id) en vez de
  ENDPOINTS.payments. Si el archivo no existe todavía, créalo primero
  siguiendo el prompt de 022.3.

EN EL MÓDULO DE COMPONENTES (src/components/payments/):
- NO crear un componente nuevo. Selecciona el componente existente
  ChargesPaymentPanel.tsx (creado en 022.3) y reutilízalo tal cual,
  pasándole props distintas (ver página abajo). Si intentas escribir
  lógica de selección de cargos, cálculo de totales, o filas de
  métodos de pago dentro de esta historia, deténte — esa lógica ya
  existe en ChargesPaymentPanel y duplicarla es un error.

EN EL MÓDULO DE PÁGINAS (src/pages/payments/):
- Si no existe la carpeta src/pages/payments/, créala (aunque ya
  debería existir por 022.3).
- Crea el archivo PayEnrollmentPage.tsx:
  1. Lee :enrollmentId de la URL (route param).
  2. Obtén los datos del encabezado (estudiante/grado/año) igual que en
     RegisterPaymentPage.tsx de 022.3 — reutiliza la misma llamada, no
     crees una nueva.
  3. Muestra un título fijo: "Completar pago de matrícula".
  4. Renderiza:
     <ChargesPaymentPanel payableId={enrollmentId}
       chargeTypeFilter="ENROLLMENT"
       submitEndpoint={ENDPOINTS.payEnrollment(enrollmentId)} />
     (chargeTypeFilter="ENROLLMENT" hace que el panel solo muestre y
     permita cobrar cuotas de matrícula — ninguna pensión ni útiles
     aparecerá en esta pantalla, eso ya lo filtra el panel internamente
     porque se lo pasamos como prop.)

EN EL MÓDULO DE BÚSQUEDA PREVIA (necesario porque esta pantalla necesita
un enrollmentId antes de poder mostrarse, y el usuario normalmente no
llega aquí con un ID en la mano):
- Si no existe src/pages/payments/PaymentSearchPage.tsx, créalo:
  1. Un solo campo SearchInput (reutiliza el mismo patrón de búsqueda
     de estudiante ya usado en EnrollmentFormPage de 022.2) para buscar
     por nombre/DNI del estudiante.
  2. Al seleccionar un resultado, si el estudiante tiene una matrícula
     activa (usa GET /enrollments?search=... ya existente de 022.2),
     navega a /pagos/matricula/:enrollmentId con el ID de esa matrícula.
  3. Si el estudiante no tiene matrícula activa, muestra un mensaje:
     "Este estudiante no tiene una matrícula activa."
  (Esta misma página de búsqueda la va a reutilizar 022.5 — constrúyela
  de forma que reciba el destino final como prop o parámetro, ej.
  targetRoute="/pagos/matricula" vs "/pagos/pensiones", en vez de
  duplicarla.)

EN EL MÓDULO DE NAVEGACIÓN (src/components/layout/nav-items.ts):
- Dentro de la sección "Pagos" (creada en 022.3), si no existe la
  entrada "Completar matrícula", agrégala apuntando a
  /pagos/matricula (la pantalla de búsqueda, no directo al ID).

EN EL MÓDULO DE RUTAS (src/App.tsx):
- Si no existen, registra ambas rutas dentro del árbol ProtectedRoute +
  DashboardLayout:
  /pagos/matricula -> PaymentSearchPage (con targetRoute="/pagos/matricula")
  /pagos/matricula/:enrollmentId -> PayEnrollmentPage

EN EL MÓDULO DE ENLACE DESDE MATRÍCULA (ajuste pequeño a un archivo ya
existente, no una historia nueva): en EnrollmentFormPage.tsx (022.2),
en la vista "success", si enrollmentInstallments > 0 en el payload
usado, cambia el botón "Registrar pago" para que navegue directamente a
/pagos/matricula/{enrollment.id} en vez de a la pantalla genérica de
022.3 — así el flujo natural post-matrícula-en-cuotas lleva
directamente a cobrar la primera cuota.

TODO el código (nombres, comentarios) en inglés; textos visibles en
español. No copies código de ChargesPaymentPanel a ningún archivo
nuevo — solo se importa.