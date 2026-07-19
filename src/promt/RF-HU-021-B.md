# RF-HU-021-B - Asignación de Cursos a Grados

## Implementación

### Archivos Creados

1. **`src/pages/grade-courses/GradeCoursesPage.tsx`**
   - Página principal con tabs
   - Dos pestañas: "Asignación de cursos" y "Reporte de asignaciones"

2. **`src/pages/grade-courses/AssignmentTab.tsx`**
   - Tab de asignación de cursos
   - Selects para Año Académico y Grado
   - Botón "Asignar cursos" que abre modal
   - Modal con checkboxes para seleccionar cursos
   - Manejo de cambios no guardados con confirmación

3. **`src/pages/grade-courses/ReportTab.tsx`**
   - Tab de reporte de asignaciones
   - Tabla con filtros por Año Académico y Grado
   - Columnas: Año Académico, Grado, Curso, Sección, Fecha, Estado
   - Acción "Quitar" para eliminar asignaciones

### Servicios Utilizados

- **`gradeCoursesService`** (ya existente en `src/services/grade-courses.service.ts`)
  - `getByYearAndGrade(yearId, gradeId)` - Obtiene cursos asignados
  - `create(payload)` - Asigna cursos a un grado
  - `updateByYearAndGrade(yearId, gradeId, courseIds)` - Actualiza asignaciones
  - `remove(id)` - Elimina una asignación
  - `getAcademicYears()` - Opciones de años académicos
  - `getGrades()` - Opciones de grados
  - `getCourses()` - Opciones de cursos

### Tipos Utilizados

- **`GradeCourse`** - Representa una asignación grado-curso
- **`GradeCoursePayload`** - Payload para crear/actualizar
- **`GradeCourseFormState`** - Estado del formulario
- **`AcademicYearOption`**, **`GradeOption`**, **`CourseOption`** - Opciones para selects

### Endpoints API

- `GET /api/grade-courses?yearId=X&gradeId=Y` - Listar asignaciones
- `GET /api/grade-courses/{yearId}/{gradeId}` - Obtener cursos asignados
- `POST /api/grade-courses` - Asignar cursos
- `PUT /api/grade-courses/{yearId}/{gradeId}` - Actualizar asignaciones
- `DELETE /api/grade-courses/{id}` - Quitar asignación

### Regla de Negocio

- Si la combinación (yearId, gradeId, courseId) ya existe, no se crea duplicado
- Si existen asignaciones que no fueron enviadas en la nueva lista, se eliminan automáticamente
- El proceso es silencioso, solo muestra mensaje de éxito