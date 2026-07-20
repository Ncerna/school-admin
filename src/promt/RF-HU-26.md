## FRONTEND

### Regla general — reutilización de componentes

Antes de crear cualquier componente nuevo, el frontend debe revisar qué ya
existe en el proyecto (formularios, tablas paginadas, modales, selectores,
botones de acción, badges de estado, confirmaciones) y reutilizarlo tal cual,
siguiendo el mismo patrón visual y de código que ya usan las pantallas de
Estudiantes y Docentes. Solo se crea un componente nuevo si genuinamente no
existe un equivalente reutilizable. No se debe reinventar tabla paginada,
modal de confirmación, selector de catálogo (rol, estado), ni estructura de
formulario si el proyecto ya tiene uno funcionando en otro módulo.

Ejemplos de qué reutilizar en vez de crear de nuevo:
- Tabla paginada con filtros → la misma que usan Estudiantes/Docentes.
- Modal de crear/editar → el mismo componente base de formulario modal.
- Selector de catálogo (dropdown poblado por API) → el que ya se usa para
  Año Académico, Grado, etc.
- Modal de confirmación (dar de baja, acciones destructivas) → el mismo que
  ya usa, por ejemplo, la eliminación de Docentes o Grado-Curso.
- Badges de estado (Activo/Inactivo/Pendiente) → el mismo componente visual
  ya usado en otras listas de estado.
- Manejo de errores de formulario y mensajes de éxito/error → el mismo
  patrón (toast, alert, etc.) ya usado en el resto del sistema.

Lo único nuevo a construir, si no existe ya algo equivalente, es la
composición específica de esta pantalla (qué campos van en el formulario de
Staff, qué columnas van en su tabla) — no la infraestructura de UI en sí.

### Pantalla "Personal administrativo"

Ruta: `/personal-administrativo`. Reutiliza el layout, estilos y
componentes ya usados en las pantallas de Estudiantes y Docentes.

### Listado

Llama a `GET /api/staff`. Filtros: buscador de texto, selector de Rol,
selector de Estado — reutilizando el componente de tabla paginada con
filtros ya existente. Columnas: Nombre completo, Rol, Cargo, Correo,
Teléfono, Estado. Acciones por fila: Editar, Dar de baja.

### Crear (modal o página)

Botón **Agregar** reutiliza el componente de modal/formulario ya existente
en el proyecto. Campos: Nombres, Apellidos, DNI, Correo, Teléfono, Cargo, y
selector de **Rol** poblado desde `GET /roles` (reutilizando el componente
de selector de catálogo ya usado en otros módulos), excluyendo en el
frontend los códigos `ALUM` y `DOC`.

Envía a `POST /api/staff` con el body descrito en el bloque de Backend.

Respuesta exitosa: cierra modal (mismo comportamiento ya estándar en el
proyecto), muestra mensaje de éxito reutilizando el componente de
notificación existente ("Personal creado. Se enviaron las credenciales de
acceso al correo registrado."), refresca el listado.

Manejo de errores (reutilizando el mismo patrón de mensajes de error ya
usado en otros formularios):
- `DUPLICATE_DNI` → "Ya existe un registro con este DNI."
- `DUPLICATE_EMAIL` → "Ya existe un registro con este correo."
- `ROLE_NOT_ALLOWED` → "Este rol no puede asignarse desde este módulo."
- `ROLE_NOT_FOUND` → "El rol seleccionado no es válido."

### Editar

Reutiliza el mismo componente de formulario modal que Crear, precargado con
los datos de `GET /api/staff/{id}`. No incluye campo de Rol ni cuenta de
usuario (no editables desde aquí). Envía a `PUT /api/staff/{id}`.

### Dar de baja

Reutiliza el componente de modal de confirmación ya existente en el
proyecto (el mismo usado, por ejemplo, en la baja de Docentes): "¿Confirmas
dar de baja a este personal? Su cuenta de acceso también será desactivada."
Al confirmar, llama a `DELETE /api/staff/{id}`. Refresca el listado al
completar.

### Nota de integración

No se agrega ninguna acción de activación de cuenta en esta pantalla — el
Staff recién creado aparece automáticamente en "Estado de activación de
cuentas" (pantalla ya existente), desde donde el admin gestiona activación
manual o reenvío de credenciales, sin volver a este módulo.