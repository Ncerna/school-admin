# PROMPT PARA DESARROLLO — FRONTEND
## RF-HU-025: Configuración de Criterios de Evaluación

 Debes construir la interfaz completa de la funcionalidad descrita a continuación. Lee todo el prompt antes de empezar a generar código. Enfócate únicamente en la lógica de UI, el flujo de pantalla, el manejo de estado local y el consumo de los endpoints indicados, respetando exactamente los nombres de campos y formatos de datos que se detallan aquí.

Todo codigo debe ser escrito en ingles , y lo que ve o va vizualizar el ususrio en  español.
usaralos componetes que ya estan definido delos demas modulos y si es propio para esto lo amnejas aqui mimo.
---

## 1. Objetivo funcional

Construir una pantalla que permita a un Director o Coordinador Académico configurar los criterios de evaluación (por ejemplo: Participación, Prácticas, Proyecto, Examen) que se usarán para calificar un curso **dentro de un grado específico**, en un año académico y período de evaluación determinados.

Esta pantalla **solo configura criterios**. No registra notas de estudiantes: eso es otra funcionalidad que consumirá esta configuración más adelante.

---

## 2. Contexto de negocio (léelo antes de diseñar cualquier componente)

- Un mismo curso (ej. "Matemática") puede dictarse en varios grados distintos, y **cada grado puede tener criterios de evaluación diferentes** para el mismo curso. Por eso la configuración siempre se hace sobre la combinación **Grado + Curso**, nunca sobre el curso solo.
- En esta primera versión, todos los criterios usan **puntaje numérico obligatorio** (`maxScore`). No existe todavía un modo "sin puntaje" ni escalas cualitativas (AD/A/B/C) — eso queda fuera de alcance por ahora.
- No hace falta que los puntajes máximos sumen 100. El sistema no valida ni exige eso.
- El nombre de un criterio no puede repetirse dentro de la misma combinación Grado+Curso+Período.
- Esta pantalla **no involucra docentes**: la configuración de criterios es independiente de quién dicte el curso.

---

## 3. Estructura visual esperada

```
Año Académico: [ 2026 ▼ ]
Período de Evaluación: [ Primer Bimestre ▼ ]
Grado: [ 3° Primaria ▼ ]
Curso: [ Matemática ▼ ]

──────────────────────────────────────────
Criterios de evaluación

  Participación          [ 20 ]   [🗑]
  Prácticas               [ 20 ]   [🗑]
  Proyecto                 [ 30 ]   [🗑]
  Examen                    [ 30 ]   [🗑]

  [ + Agregar criterio ]
──────────────────────────────────────────
                          [ Cancelar ]  [ Guardar ]
```

---

## 4. Flujo de la pantalla

1. El usuario selecciona **Año Académico**.
2. El usuario selecciona **Período de Evaluación** (la lista depende del año seleccionado).
3. El usuario selecciona **Grado** (catálogo general, no depende de nada más).
4. El usuario selecciona **Curso**, pero la lista de cursos disponibles depende del grado elegido (solo deben aparecer los cursos que ese grado tiene en su catálogo `grado+curso`).
5. Al tener seleccionados los 4 filtros (año, período, grado, curso), el sistema consulta los criterios ya configurados para esa combinación exacta y los pinta en la lista.
6. Si no hay criterios configurados aún, la lista aparece vacía con un mensaje del tipo "Aún no hay criterios configurados para este curso en este período. Agrega el primero."
7. El usuario puede:
   - Agregar un criterio nuevo (nombre + puntaje máximo).
   - Editar el nombre o el puntaje máximo de un criterio existente.
   - Eliminar un criterio.
   - Reordenar los criterios (el orden se conserva y se envía al guardar).
8. Nada se guarda automáticamente. Todos los cambios (agregar, editar, eliminar, reordenar) solo modifican el estado local de la pantalla.
9. El botón **Guardar** envía el estado completo de la lista de criterios de esa combinación en una sola petición.
10. El botón **Cancelar** descarta los cambios locales y vuelve a pintar la lista con la última información conocida del servidor.
11. Si el usuario cambia cualquiera de los 4 filtros (año, período, grado o curso) teniendo cambios sin guardar, se debe preguntar antes de descartar esos cambios.

---

## 5. Validaciones de UI obligatorias

1. El nombre del criterio es obligatorio y no puede quedar vacío.
2. El puntaje máximo es obligatorio, debe ser numérico y mayor a 0.
3. No se puede guardar si hay dos criterios con el mismo nombre dentro de la misma lista (validar en el cliente antes de enviar, además de que el backend también lo valida).
4. El botón "Guardar" debe estar deshabilitado si la lista de criterios está vacía (no se permite guardar una configuración sin ningún criterio) o si algún criterio tiene datos inválidos.

---

## 6. Estados especiales de la pantalla

- **Sin los 4 filtros completos:** no se consulta ni se pinta la lista de criterios; se muestra un mensaje invitando a completar la selección.
- **Curso sin criterios configurados:** lista vacía con mensaje guía (ver punto 6 del flujo).
- **Cargando información:** mostrar estado de carga mientras se obtiene la lista de criterios.
- **Guardado exitoso:** mostrar confirmación y refrescar la lista con la respuesta del servidor (para obtener los `id` reales de los criterios recién creados).
- **Error al guardar:** no perder los cambios locales del usuario; mostrar el error y permitir reintentar.

---

## 7. Contrato de datos

### 7.1 Cargar años académicos (ya existente, se reutiliza)

`GET /api/academic-years`

```json
[
  { "id": 1, "name": "2026", "status": "ACTIVO", "active": true }
]
```

### 7.2 Cargar períodos de evaluación de un año

`GET /api/evaluation-periods?academicYearId=1`

```json
[
  { "id": 2, "name": "Primer Bimestre" },
  { "id": 3, "name": "Segundo Bimestre" }
]
```

Este endpoint puede responder con un error explícito si el año académico seleccionado no tiene un grupo de evaluación activo configurado (o tiene más de uno, caso de inconsistencia de datos):

```json
{
  "success": false,
  "message": "El año académico seleccionado no tiene un grupo de evaluación activo configurado."
}
```

Cuando esto ocurra, el selector de "Período de Evaluación" debe quedar deshabilitado y debe mostrarse el mensaje de error recibido del servidor tal cual, en vez de un mensaje genérico. No se debe interpretar como "lista vacía" — es un estado de error distinto, que debe comunicarse claramente al usuario.

### 7.3 Cargar grados (catálogo existente, se reutiliza)

`GET /api/grades?academicYearId=1`

```json
[
  { "id": 3, "name": "3° Primaria" },
  { "id": 4, "name": "4° Primaria" }
]
```

### 7.4 Cargar cursos disponibles para un grado (resuelve el `gradeCourseId`)

`GET /api/grade-courses?academicYearId=1&gradeId=3`

```json
[
  { "gradeCourseId": 15, "courseId": 1, "courseName": "Matemática" },
  { "gradeCourseId": 16, "courseId": 2, "courseName": "Comunicación" }
]
```

Usa el `gradeCourseId` de este resultado (según lo que el usuario elija en el selector de Curso) para las siguientes dos llamadas.

### 7.5 Consultar los criterios configurados de una combinación

`GET /api/evaluation-criteria?evaluationPeriodId=2&gradeCourseId=15`

```json
{
  "evaluationPeriodId": 2,
  "gradeCourseId": 15,
  "criteria": [
    { "id": 101, "name": "Participación", "maxScore": 20, "order": 1 },
    { "id": 102, "name": "Prácticas", "maxScore": 20, "order": 2 },
    { "id": 103, "name": "Proyecto", "maxScore": 30, "order": 3 },
    { "id": 104, "name": "Examen", "maxScore": 30, "order": 4 }
  ]
}
```

Si no hay criterios configurados aún, `criteria` viene como arreglo vacío.

### 7.6 Guardar todos los criterios de una combinación

`PUT /api/evaluation-criteria`

Body a enviar (arma el estado local completo con exactamente estos nombres de campo):

```json
{
  "evaluationPeriodId": 2,
  "gradeCourseId": 15,
  "criteria": [
    { "id": 101, "name": "Participación", "maxScore": 20, "order": 1 },
    { "id": 102, "name": "Prácticas", "maxScore": 20, "order": 2 },
    { "id": null, "name": "Exposición", "maxScore": 15, "order": 3 }
  ]
}
```

Reglas para construir este payload desde el estado local:
- Un criterio existente (que ya tenía `id` al cargarlo) se envía con su `id` real.
- Un criterio agregado nuevo en esta sesión se envía con `id: null`.
- Un criterio que el usuario eliminó en esta sesión **no se incluye** en el arreglo `criteria` — el backend interpreta que todo lo que no viene en la lista fue eliminado.
- El campo `order` debe reflejar el orden final tal como quedó en pantalla.

Respuesta esperada:
```json
{
  "success": true,
  "message": "Evaluation criteria updated successfully.",
  "criteria": [
    { "id": 101, "name": "Participación", "maxScore": 20, "order": 1 },
    { "id": 102, "name": "Prácticas", "maxScore": 20, "order": 2 },
    { "id": 105, "name": "Exposición", "maxScore": 15, "order": 3 }
  ]
}
```

Usa la lista `criteria` de esta respuesta para refrescar el estado local con los `id` reales asignados a los criterios nuevos.

---

## 8. Reglas transversales que debes respetar

- No inventes campos que no estén en los JSON de ejemplo; usa exactamente esos nombres.
- No incluyas en el payload de guardado ningún campo que sea puramente de interfaz (por ejemplo, banderas internas de edición o de validación en pantalla).
- Toda la pantalla debe poder construirse con las llamadas de catálogo (7.1 a 7.4) más una sola llamada de consulta (7.5), y guardarse con una sola llamada (7.6).

---

## 9. Entregable esperado

Implementa la pantalla completa (selectores encadenados de año/período/grado/curso, lista editable de criterios, validaciones de la sección 5, estados especiales de la sección 6, y el consumo de los endpoints de la sección 7) siguiendo fielmente este prompt. Si algo no está especificado aquí, elige la opción más simple y consistente con el resto del comportamiento descrito, y decláralo explícitamente en tu respuesta antes de implementarlo.

##10.

La pantalla que diseñamos en /criterios-evaluacion es una vista de detalle: muestra los criterios de una sola combinación Grado+Curso+Período a la vez, después de seleccionar los 4 filtros. Es la pantalla correcta para configurar, pero no sirve para tener una vista general de "¿qué cursos ya tienen criterios configurados y cuáles no?" — eso obligaría al administrador a ir combinación por combinación, probando cada grado y curso, sin saber de antemano cuáles están completos.
Eso es un hueco real de UX si el colegio tiene, por ejemplo, 6 grados × 8 cursos = 48 combinaciones posibles por período. El administrador necesita un panorama antes de entrar al detalle.
Propuesta: agregar una vista de listado previa (resumen)
Año Académico: [ 2026 ▼ ]
Período de Evaluación: [ Primer Bimestre ▼ ]

──────────────────────────────────────────────────────────
Grado           Curso              Criterios configurados
──────────────────────────────────────────────────────────
1° Primaria     Matemática         ✓ 4 criterios
1° Primaria     Comunicación       ✓ 3 criterios
1° Primaria     Arte               ⚠ Sin configurar
2° Primaria     Matemática         ✓ 5 criterios
2° Primaria     Comunicación       ⚠ Sin configurar
3° Primaria     Matemática         ✓ 4 criterios
──────────────────────────────────────────────────────────

Al elegir Año + Período (solo 2 filtros, no los 4), se lista todo el catálogo de grado+curso de ese año, con un indicador de cuántos criterios tiene cada uno (o "Sin configurar" si no tiene ninguno).
Cada fila es un enlace/botón que lleva a la vista de detalle que ya diseñamos (con Grado y Curso ya preseleccionados), para editar esa combinación puntual.
Esto le da al administrador el panorama completo de un vistazo, y la vista de detalle sigue siendo la misma que ya construimos — no se duplica lógica de edición, solo se agrega una puerta de entrada más amigable.

Contrato de datos necesario para esta vista nueva
Necesitaría un endpoint adicional tipo:
GET /api/evaluation-criteria/summary?academicYearId=1&evaluationPeriodId=2
json[
  { "gradeId": 1, "gradeName": "1° Primaria", "gradeCourseId": 15, "courseId": 1, "courseName": "Matemática", "criteriaCount": 4 },
  { "gradeId": 1, "gradeName": "1° Primaria", "gradeCourseId": 16, "courseId": 2, "courseName": "Comunicación", "criteriaCount": 3 },
  { "gradeId": 1, "gradeName": "1° Primaria", "gradeCourseId": 17, "courseId": 3, "courseName": "Arte", "criteriaCount": 0 }
]
criteriaCount: 0 es lo que dispara el indicador "⚠ Sin configurar" en la UI.