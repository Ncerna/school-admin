RF-HU-021-BE - Asisgnacion de cursos alos grados.

sequiere asignar cursos alos grado y guardar este regitro la tabal debe tener estos columna:

## Tabla
**grade_courses**

- `id`
- `grade_id`
- `course_id`
- `year_id`
- `created_at`
- `updated_at`
---
##
# Endpoints
## Get Academic Years (ya exite)
**GET** `/api/academic-years/options`
### Response
```json
[
  {
    "id": 1,
    "name": "2026"
  }..,
  
]
```
---
## Get Grades (ya exite)
**GET** `/api/grades/options` 
### Response

```json
[
  {
    "id": 1,
    "name": "Primary - 1st A"
  }..
]
```

---

## Get  Courses (ya exite)
**GET** `/api/courses/options`
### Response
```json
[
  {
    "id": 1,
    "name": "Mathematics"
  }..
]
```
---

## Get Assigned Courses
Obtiene todos los cursos grade-courses.
**GET** `/api/grade-courses?yearId=1&gradeId=2`
### Query Params
```
yearId
gradeId
```
### Response paginado como modulo levels

```json
{ [
    {
      "id": 1,
      "couseName": "Mathematics",
      "gradeName": "PRIMERO",
      "levelName":"primaria",
      "secion":"A",
      "fecha":"30-02-2026",
      "estado":"Activo",
    },
    .....
  ]
}
```
---

## Assign Courses to Grade
**POST** `/api/grade-courses`
### Request
```json
{
  "yearId": 1,
  "gradeId": 2,
  "courseIds": [
    1,
    2,
    5,
    8
  ]
}
```
### Response
```json
{
  "success": true,
  "message": "N Courses assigned successfully."
}
```

---
## Remove Course Assignment
**DELETE** `/api/grade-courses/{id}`
### Response
```json
{
  "success": true,
  "message": "Course assignment removed successfully."
}
```

## Frontend
### Pantalla
Ruta:
```
/grade-courses
```
Al ingresar a la pantalla, el sistema mostrará un botón **Asignar**, con el mismo estilo utilizado en el módulo de Estudiantes,aulas docentes..

### Asignar Cursos
Al hacer clic en **Asignar**, se abrirá un modal que contendrá:
- Select **Año Académico**.
- Select **Grado**.
- Listado de todos los cursos disponibles con selección múltiple mediante checkboxes.

El usuario deberá:
1. Seleccionar el Año Académico.
2. Seleccionar el Grado.
3. Marcar uno o varios cursos.
4. Hacer clic en **Guardar**.
(## Assign Courses to Grade
**POST** `/api/grade-courses`
### Request
```json
{
  "yearId": 1,
  "gradeId": 2,
  "courseIds": [
    1,
    2,
    5,
    8
  ]
}
```)
Si la operación es exitosa:
- El modal se cerrará automáticamente.
- Se mostrará un mensaje de éxito.
Ejemplo:
```
Se asignaron 8 cursos al grado correctamente.
```
- Se actualizará automáticamente el listado de asignaciones.
---
### Listado
La pantalla mostrará todas las asignaciones registradas.
Cada registro deberá mostrar como mínimo:
- Año Académico.
- Grado.
- Curso.
- secion.
- fecha.
- estado.

Cada fila tendrá la acción:
- **Quitar** 
Al hacer clic en **Quitar**, se eliminará únicamente la asignación del curso al grado seleccionado. se usaro sof delete.antes de eliminar confirma.

### Regla de Negocio

El sistema deberá sincronizar las asignaciones de forma automática.

Cuando se reciba la lista de `courseIds` para un `yearId` y `gradeId`:

- Si la combinación (`yearId`, `gradeId`, `courseId`) **ya existe**, el sistema **no deberá crear un registro duplicado**. La asignación se conservará sin generar errores ni mensajes al usuario.
- Si la combinación **no existe**, el sistema creará una nueva asignación.
- Si existen asignaciones para ese `yearId` y `gradeId` que **no fueron enviadas** en la nueva lista de `courseIds`, el sistema las eliminará automáticamente.

Este proceso deberá realizarse de forma **silenciosa**, de modo que el usuario únicamente reciba un mensaje de éxito indicando que las asignaciones fueron actualizadas correctamente.