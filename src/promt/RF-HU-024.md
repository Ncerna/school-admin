# PROMPT PARA DESARROLLO — FRONTEND
## RF-HU-024: Asignación de Grados y Cursos a Docentes

##importante  todo codigo en ingles y usa los compontes  que ya tenemos
## y el mismo patron de del componte  /page/grade-course deb tenr estrictamete este modelo.

Actúa como desarrollador frontend senior. Debes construir la interfaz completa de la funcionalidad descrita a continuación. Lee todo el prompt antes de empezar a generar código. No propongas ni asumas stack tecnológico, framework, librería de estado ni arquitectura: eso ya está decidido fuera de este prompt. Enfócate únicamente en la lógica de UI, el flujo de pantallas, el manejo de estado local y el consumo de los endpoints indicados, respetando exactamente los nombres de campos y formatos de datos que se detallan aquí.

---

## 1. Objetivo funcional

Construir una pantalla que permita a un Director o Administrador Académico:

1. Asignar uno o varios grados a un docente, dentro de un año académico.
2. Definir, para cada grado asignado, qué cursos impartirá ese docente (todos o algunos).
3. Consultar, en una vista de reporte separada, qué docentes dictan qué grados y cursos, con filtros opcionales.

Existen entonces **dos pantallas**:

- **Pantalla A — Asignación docente** (crear/editar): vista de árbol expandible.
- **Pantalla B — Reporte de asignaciones** (solo consulta): vista jerárquica de solo lectura.

---

## 2. Contexto de negocio (léelo antes de diseñar cualquier componente)

- La aplicación ya tiene un catálogo de "cursos por grado" (por ejemplo, "1° Secundaria" tiene Matemática, Comunicación, Ciencia, etc.). Este catálogo no se edita en esta funcionalidad: solo se usa para saber qué cursos puede tener disponibles cada grado.
- Un docente puede tener varios grados asignados.
- Un grado puede tener varios docentes distintos (por especialidad).
- Cuando un grado está asignado a un docente, el usuario decide si el docente dicta **todos los cursos del grado** o **solo algunos**.
- Si el usuario desasigna un grado completo, se entiende que también se pierden todos los cursos que tenía marcados dentro de ese grado (debe confirmarse antes con el usuario).
- Si en el catálogo se agrega un curso nuevo a un grado, ese curso **no** debe aparecer marcado automáticamente para ningún docente que ya tuviera ese grado asignado; debe aparecer disponible pero sin marcar.
- Toda la asignación depende de un año académico: la misma pantalla, con el mismo docente, puede mostrar información distinta según el año seleccionado.

---

## 3. PANTALLA A — Asignación docente (árbol expandible)

### 3.1 Estructura visual esperada

Selector superior:

```
Año Académico: [ 2026 ▼ ]     Docente: [ Juan Pérez ▼ ]
```

Debajo, un árbol expandible de dos niveles (Grado → Cursos):

```
▼ ☑ 1° Primaria                    (grado asignado, expandido)
      ☑ Matemática
      ☑ Comunicación
      ☑ Ciencia
      ☐ Arte
      ☐ Inglés
      [ Seleccionar todos ]  [ Quitar todos ]

► ☑ 2° Primaria                    (grado asignado, colapsado)

► ☐ 3° Primaria                    (grado no asignado, colapsado)

► ☐ 4° Primaria
► ☐ 5° Primaria
```

Al final de la pantalla:

```
[ Cancelar ]   [ Guardar cambios ]
```

### 3.2 Comportamiento obligatorio del árbol

1. **Un solo endpoint carga todo el árbol.** Al elegir año académico y docente, se hace una única llamada que trae todos los grados (asignados y no asignados) junto con todos sus cursos y el estado de cada uno. No se debe hacer una llamada adicional al expandir un grado: esa información ya vino en la carga inicial.

2. **Expandir/colapsar un grado** es una acción puramente visual, sin llamadas a servidor.

3. **Marcar el checkbox de un grado** (pasar de no asignado a asignado):
   - Lo marca como asignado en el estado local.
   - Expande automáticamente el grado para que el usuario vea los cursos y decida cuáles marcar.
   - Todos los checkboxes de curso dentro de ese grado se habilitan (antes estaban deshabilitados).

4. **Desmarcar el checkbox de un grado** (pasar de asignado a no asignado):
   - Si el grado tenía al menos un curso marcado, se debe mostrar una confirmación: *"¿Desea quitar este grado y todos sus cursos asignados?"*. Solo si el usuario confirma, se desmarca el grado y se limpian (desmarcan) todos sus cursos en el estado local.
   - Si el grado no tenía ningún curso marcado, se desmarca directo sin confirmación.
   - Los checkboxes de curso de ese grado vuelven a quedar deshabilitados.

5. **Un checkbox de curso solo puede interactuarse si su grado padre está marcado como asignado.** Si el grado no está asignado, todos sus cursos se muestran deshabilitados (atenuados), aunque el árbol esté expandido.

6. **"Seleccionar todos" dentro de un grado**: marca todos los cursos de ese grado como asignados. **"Quitar todos"**: los desmarca todos. No existe un campo especial de "modo todos"; es simplemente el resultado de marcar/desmarcar cada curso individualmente. Si tras usar "Seleccionar todos" el usuario desmarca un solo curso, el resto debe permanecer marcado sin ningún efecto colateral.

7. **Mostrar un contador junto al nombre de cada grado**, por ejemplo `"3/6 cursos"`, para dar contexto sin necesidad de expandir el nodo.

8. **Nada se guarda automáticamente.** Todas las interacciones (marcar/desmarcar grado, marcar/desmarcar curso, seleccionar todos) solo modifican el estado local de la pantalla. El envío al servidor ocurre únicamente al presionar "Guardar cambios".

9. **Botón "Cancelar"**: descarta todos los cambios locales no guardados y vuelve a pintar el árbol con la última información conocida del servidor.

10. **Botón "Guardar cambios"**: arma un único payload con el estado completo del árbol (todos los grados, asignados o no, y todos sus cursos) y lo envía en una sola petición.

11. **Tras guardar exitosamente**, se debe refrescar el árbol con la respuesta más reciente del servidor (o volver a consultar), de modo que los grados recién asignados queden con su identificador real de asignación.

12. **Si el guardado falla**, no se debe perder el estado local marcado por el usuario: se muestra el error y se permite reintentar sin que el usuario tenga que volver a marcar todo.

13. **Si el usuario intenta cambiar de docente o de año académico teniendo cambios sin guardar**, se debe preguntar antes de descartar esos cambios.

### 3.3 Estados especiales de la Pantalla A

- **Sin año académico o sin docente seleccionado:** no se pinta el árbol; se muestra un mensaje invitando a seleccionar ambos.
- **Docente sin ningún grado asignado:** el árbol se pinta igual, todos los grados en estado no asignado y colapsados, con un texto guía indicando que debe marcar uno o varios grados para comenzar.
- **Cargando información:** mostrar un estado de carga mientras se obtiene el árbol.
- **Vista en pantallas pequeñas (móvil):** el mismo árbol debe comportarse como un acordeón, donde idealmente solo un grado permanece expandido a la vez para no saturar la pantalla. No es un componente distinto: es el mismo árbol con distinto comportamiento de expansión.

### 3.4 Contrato de datos — Pantalla A

**Cargar catálogo de años académicos**

`GET /api/academic-years/options`

Respuesta:
```json
[
  { "id": 1, "name": "2026", "active": true },
  { "id": 2, "name": "2027", "active": false }
]
```

**Cargar catálogo de docentes**

`GET /api/teachers/options`

Parámetros opcionales: `search`, `status`.

Respuesta:
```json
[
  { "id": 8, "fullName": "Juan Pérez", "document": "71234567" },
  { "id": 15, "fullName": "María Gómez", "document": "45896521" }
]
```

**Cargar el árbol completo de un docente**

`GET /api/teacher-assignments?academicYearId=1&teacherId=8`

Respuesta (así de completa debe venir, para pintar todo sin llamadas extra):
```json
{
  "academicYearId": 1,
  "teacher": { "id": 8, "fullName": "Juan Pérez" },
  "grades": [
    {
      "assignmentId": 12,
      "gradeId": 1,
      "gradeName": "1° Primaria",
      "assigned": true,
      "courses": [
        { "gradeCourseId": 5, "courseId": 1, "courseName": "Matemática", "assigned": true },
        { "gradeCourseId": 6, "courseId": 2, "courseName": "Comunicación", "assigned": true },
        { "gradeCourseId": 7, "courseId": 3, "courseName": "Arte", "assigned": false }
      ]
    },
    {
      "assignmentId": null,
      "gradeId": 2,
      "gradeName": "2° Primaria",
      "assigned": false,
      "courses": [
        { "gradeCourseId": 10, "courseId": 4, "courseName": "Matemática", "assigned": false },
        { "gradeCourseId": 11, "courseId": 5, "courseName": "Comunicación", "assigned": false }
      ]
    }
  ]
}
```

**Guardar todos los cambios del árbol**

`PUT /api/teacher-assignments`

Body a enviar (debe construirse exactamente con estos nombres de campo, a partir del estado local del árbol):
```json
{
  "academicYearId": 1,
  "teacherId": 8,
  "grades": [
    {
      "gradeId": 1,
      "assigned": true,
      "courses": [
        { "gradeCourseId": 5, "assigned": true },
        { "gradeCourseId": 6, "assigned": false },
        { "gradeCourseId": 7, "assigned": true }
      ]
    },
    {
      "gradeId": 2,
      "assigned": true,
      "courses": [
        { "gradeCourseId": 10, "assigned": true },
        { "gradeCourseId": 11, "assigned": true }
      ]
    },
    {
      "gradeId": 3,
      "assigned": false
    }
  ]
}
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "Teacher assignment 8 gados y 12 cursos updated successfully."
}
```

Importante: el campo `expanded` (si lo usas para controlar la UI del árbol) es puramente de interfaz y **no debe incluirse** en el payload enviado al servidor.

---

## 4. PANTALLA B — Reporte de asignaciones (consulta jerárquica, solo lectura)

### 4.1 Descripción funcional

Esta pantalla permite al administrador visualizar la distribución de docentes por año académico, para responder rápidamente preguntas como "¿quién dicta 3° Primaria?" o "¿qué cursos dicta Juan Pérez?".

Flujo:

1. Al ingresar al módulo, el usuario selecciona el **Año Académico** (obligatorio).
2. Opcionalmente, puede filtrar por **Docente**, **Grado** y/o **Curso**.
3. Al presionar **Buscar**, se envían los filtros seleccionados al servidor.
4. El resultado se muestra de forma **jerárquica**: Docente → Grados asignados → Cursos que dicta en cada grado.
5. Esta pantalla es de **solo consulta**: no permite editar ni marcar/desmarcar nada. No comparte estado ni componentes editables con la Pantalla A.

### 4.2 Estructura visual esperada

```
Año Académico: [ 2026 ▼ ]
Docente (opcional): [ Todos ▼ ]
Grado (opcional):   [ Todos ▼ ]
Curso (opcional):   [ Todos ▼ ]

                [ Buscar ]

────────────────────────────────────────
▼ Juan Pérez
      ▼ 1° Primaria
            • Matemática
            • Comunicación
            • Arte
      ▼ 2° Primaria
            • Matemática
            • Comunicación

▼ María Gómez
      ▼ 1° Primaria
            • Matemática
            • Comunicación
            • Ciencia
            • Personal Social
            • Arte
            • Inglés
────────────────────────────────────────
```

- El primer nivel es el docente, el segundo nivel son los grados que dicta, el tercer nivel son los cursos que dicta dentro de ese grado.
- Si se aplica el filtro de grado o curso, solo deben mostrarse los docentes (y dentro de ellos, los grados/cursos) que cumplen ese filtro; no se debe mostrar el árbol completo del docente si no tiene coincidencias.
- Si no hay resultados para los filtros seleccionados, se debe mostrar un mensaje claro de "sin resultados", no una pantalla vacía sin explicación.
- Igual que la Pantalla A, esta vista debe funcionar en pantallas pequeñas mostrando los niveles como un árbol/acordeón colapsable.

### 4.3 Contrato de datos — Pantalla B

`POST /api/teacher-assignment-report/search`

Body de la petición (todos los filtros excepto `academicYearId` son opcionales; si no se envían o van en `null`, no filtran):
```json
{
  "academicYearId": 1,
  "teacherId": null,
  "gradeId": null,
  "courseId": null
}
```

Respuesta esperada:
```json
{
  "academicYearId": 1,
  "teachers": [
    {
      "teacherId": 8,
      "teacherName": "Juan Pérez",
      "grades": [
        {
          "gradeId": 1,
          "gradeName": "1° Primaria",
          "courses": [
            { "courseId": 1, "courseName": "Matemática" },
            { "courseId": 2, "courseName": "Comunicación" },
            { "courseId": 3, "courseName": "Arte" }
          ]
        },
        {
          "gradeId": 2,
          "gradeName": "2° Primaria",
          "courses": [
            { "courseId": 4, "courseName": "Matemática" },
            { "courseId": 5, "courseName": "Comunicación" }
          ]
        }
      ]
    },
    {
      "teacherId": 15,
      "teacherName": "María Gómez",
      "grades": [
        {
          "gradeId": 1,
          "gradeName": "1° Primaria",
          "courses": [
            { "courseId": 1, "courseName": "Matemática" },
            { "courseId": 2, "courseName": "Comunicación" },
            { "courseId": 3, "courseName": "Ciencia" },
            { "courseId": 4, "courseName": "Personal Social" },
            { "courseId": 5, "courseName": "Arte" },
            { "courseId": 6, "courseName": "Inglés" }
          ]
        }
      ]
    }
  ]
}
```

Si `teachers` viene como arreglo vacío, mostrar el mensaje de "sin resultados" descrito arriba.

Para llenar los selectores de filtro de la Pantalla B (Docente, Grado, Curso), reutiliza `GET /api/teachers` para docentes; los catálogos de grado y curso deben poblarse desde los endpoints de catálogo existentes en el sistema (no forman parte de esta funcionalidad, solo se consumen).

---

## 5. Reglas transversales que debes respetar en ambas pantallas

- No inventes campos que no estén en los JSON de ejemplo; usa exactamente esos nombres.
- No agregues un campo booleano de "todos los cursos": el estado "todos" siempre se representa como cada curso individualmente marcado.
- La Pantalla A es editable; la Pantalla B es de solo lectura. No mezcles su lógica ni sus componentes.
- Todo el árbol de la Pantalla A debe poder construirse con una sola llamada de carga (`GET /api/teacher-assignments`) y guardarse con una sola llamada de guardado (`PUT /api/teacher-assignments`).
- Todo el reporte de la Pantalla B debe construirse con una sola llamada (`POST /api/teacher-assignment-report/search`).

---

## 6. Entregable esperado

Implementa ambas pantallas completas (componentes de UI, manejo de estado local, llamadas a los endpoints indicados, validaciones de interacción descritas en la sección 3.2, y los estados especiales de las secciones 3.3 y 4.2) siguiendo fielmente este prompt. Si algo no está especificado aquí, elige la opción más simple y consistente con el resto del comportamiento descrito, y decláralo explícitamente en tu respuesta antes de implementarlo.
