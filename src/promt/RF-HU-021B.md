# PROMPT PARA DESARROLLO — FRONTEND
## Extensión puntual: manejo del diálogo de confirmación de dependencias en el modal de cursos por grado

 El modal de configuración de cursos por grado (RF-HU-021) **ya está desarrollado**. Esta es una extensión puntual: agregar el manejo de la respuesta `requires_confirmation` que ahora devuelve el backend al guardar. No modifiques el resto del componente, no cambies nombres de endpoints ni de servicios existentes — solo agrega la lógica descrita aquí. reusa mis componete , para que no hay redundancia de codigo

---

## 1. Qué cambia, en una frase

Hoy, al presionar "Guardar" en el modal, se envía `PUT /api/grade-courses/{yearId}/{gradeId}` y se asume que siempre responde éxito. Ahora esa misma petición puede responder pidiendo confirmación (`requires_confirmation: true`) cuando el usuario está quitando cursos que ya tienen criterios de evaluación o docentes asignados. Cuando eso pase, en vez de mostrar error, se debe abrir un **diálogo de confirmación** con el detalle de lo que se perdería, y solo si el usuario confirma, se reenvía la misma petición con un flag adicional para completar el guardado.

---

## 2. Flujo paso a paso (esto es lo que debes implementar)

```
Usuario abre el modal de "1° Primaria" (año 2026)
      │
      ▼
Modal carga los cursos ya asignados (marcados) y el catálogo completo (checkboxes)
      │
      ▼
Usuario desmarca uno o varios cursos que ya estaban marcados
      │
      ▼
Usuario presiona "Guardar"
      │
      ▼
Frontend envía: PUT /api/grade-courses/2026/1  { courseIds: [...], force: false }
      │
      ├── Respuesta normal de éxito
      │         │
      │         ▼
      │   Cerrar modal, refrescar la vista principal, mostrar toast de éxito
      │
      └── Respuesta con requires_confirmation: true
                │
                ▼
          Abrir DIÁLOGO DE CONFIRMACIÓN (ver sección 3)
          mostrando el detalle de affected_courses
                │
          ┌─────┴─────┐
          ▼           ▼
     "Cancelar"   "Sí, continuar"
          │           │
          ▼           ▼
   Cerrar diálogo   Reenviar: PUT /api/grade-courses/2026/1
   Volver al modal        { courseIds: [...], force: true }
   (checkboxes            │
    intactos,              ▼
    nada se guardó)   Respuesta de éxito
                            │
                            ▼
                  Cerrar diálogo Y modal,
                  refrescar vista principal,
                  mostrar toast de éxito
```

---

## 3. El diálogo de confirmación — diseño exacto

Este diálogo aparece **encima del modal de configuración** (no lo reemplaza, no lo cierra — el modal de cursos sigue abierto detrás, con la selección del usuario intacta, por si cancela).

```
┌───────────────────────────────────────────────────┐
│ ⚠ Esta acción eliminará información asociada       │
├───────────────────────────────────────────────────┤
│ Los siguientes cursos que estás quitando tienen    │
│ información configurada que se perderá:            │
│                                                     │
│  • Arte — 4 criterios de evaluación, 1 docente     │
│    asignado                                        │
│  • Comunicación — 2 criterios de evaluación         │
│                                                     │
│ ¿Deseas continuar de todas formas?                 │
├───────────────────────────────────────────────────┤
│           [ Cancelar ]     [ Sí, continuar ]       │
└───────────────────────────────────────────────────┘
```

**Reglas exactas de armado del texto por cada curso listado:**

- Si `criteriaCount > 0` y `teacherAssignmentsCount > 0`:
  `"{courseName} — {criteriaCount} criterios de evaluación, {teacherAssignmentsCount} docente(s) asignado(s)"`
- Si solo `criteriaCount > 0` (sin docentes):
  `"{courseName} — {criteriaCount} criterios de evaluación"`
- Si solo `teacherAssignmentsCount > 0` (sin criterios):
  `"{courseName} — {teacherAssignmentsCount} docente(s) asignado(s)"`
- El plural/singular de "docente(s)" debe ajustarse según el número (1 docente asignado / 2 docentes asignados).

**Botones:**
- `[ Cancelar ]`: cierra solo este diálogo. El modal de configuración de cursos permanece abierto, con los checkboxes exactamente como el usuario los había dejado (no se revierte nada, no se vuelve a marcar lo que había desmarcado — el usuario decide si ajusta su selección o vuelve a intentar).
- `[ Sí, continuar ]`: dispara la petición de confirmación (sección 4) y muestra estado de carga en este mismo botón mientras se procesa (deshabilitado + spinner), sin cerrar el diálogo hasta tener la respuesta.

---

## 4. Contrato de datos exacto

### 4.1 Primera petición (intento normal)

```json
PUT /api/grade-courses/{yearId}/{gradeId}
{ "courseIds": [1, 2], "force": false }
```

### 4.2 Respuesta que dispara el diálogo

```json
{
  "success": false,
  "requires_confirmation": true,
  "message": "Some courses being removed have dependent data.",
  "affected_courses": [
    { "courseId": 4, "courseName": "Arte", "criteriaCount": 4, "teacherAssignmentsCount": 1 },
    { "courseId": 2, "courseName": "Comunicación", "criteriaCount": 2, "teacherAssignmentsCount": 0 }
  ]
}
```

El frontend debe detectar esta respuesta específicamente por el campo `requires_confirmation: true` (no por el código de estado HTTP genéricamente, ya que este caso no es un error real de validación, es un flujo esperado del negocio). Guarda `affected_courses` en el estado local del componente para pintarlo en el diálogo.

### 4.3 Segunda petición (tras confirmar)

Exactamente el mismo body que la primera, cambiando solo `force`:
```json
PUT /api/grade-courses/{yearId}/{gradeId}
{ "courseIds": [1, 2], "force": true }
```

### 4.4 Respuesta de éxito (en cualquiera de los dos intentos)

```json
{ "success": true, "message": "2 courses assigned successfully." }
```

---

## 5. Estados y detalles que debes cuidar

1. **El botón "Guardar" del modal principal** debe pasar a estado de carga apenas se presiona, y permanecer así durante ambos intentos si hay confirmación de por medio (el usuario no debe ver el botón "libre" mientras se resuelve el diálogo).
2. **Si la segunda petición (`force: true`) falla** por cualquier otro motivo (error de red, error de validación distinto), el diálogo de confirmación debe cerrarse y mostrar el error en el modal principal (no dejar al usuario atascado en el diálogo).
3. **El diálogo nunca debe abrirse solo con el mensaje genérico** (`"Some courses being removed have dependent data."`) sin el detalle de `affected_courses` — el mensaje genérico es un respaldo/título, pero el detalle curso por curso es obligatorio para que el usuario sepa exactamente qué se perderá.
4. **No se debe volver a llamar a `GET /api/grade-courses`** para armar el diálogo — toda la información necesaria (`affected_courses`) ya viene en la respuesta del propio `PUT`, sin peticiones adicionales.
5. Al confirmar exitosamente (`force: true` con éxito), se cierran **ambos** — el diálogo y el modal de configuración de cursos —, se refresca la vista principal (conteo de cursos por grado) y se muestra el toast de éxito ya definido en el resto del flujo (`"Cursos actualizados correctamente."` o el mensaje que ya uses).

---

## 6. Entregable esperado

Agrega el estado y la lógica necesaria (bandera de "mostrar diálogo de confirmación", almacenamiento de `affected_courses`, función de reintento con `force: true`) a la función que ya envía el `PUT` de guardado en el modal de cursos por grado, y el componente de diálogo con el diseño y las reglas de texto de la sección 3. Si algo no está especificado aquí, elige la opción más simple y consistente con el resto del comportamiento descrito, y decláralo explícitamente en tu respuesta antes de implementarlo.