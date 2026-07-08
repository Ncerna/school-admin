

=======================================
RF-HU-012
Historia de Usuario: Creación y Gestión de Períodos de Evaluación (Backend y froend)
Todo codigo en ingles.
Convenciones Froend siempre envia(ejemplo:yearId) backen trabaja (ejemplo year_id)
EL solocita lsita de Tipos de Evaluación.
GET: /evaluation-types/options:
responde.
```json
{
  "id": "int",
  "name": "Bimestre",//Bimestre, Trimestre, Semestre
 
}
```
EL solocita lsita de años acdemicos.(mediante migracion agregra esto, por ahora para abanzar )
GET: /academic-years/options
responde.
```json
{
  "id": "int",
  "name": "string",
  "periodsCount": 5 //esto es un nuvo coluna agregado al año academico.
}
```
## Frontend

1. El administrador ingresa al módulo **Períodos de Evaluación**.
da click en nuevo periodo. levantra un modal  con los select.

2. El sistema carga el **select de Años Académicos** para que el usuario seleccione el año al que desea configurar los períodos.

3. El sistema carga el **select de Tipos de Evaluación** (Bimestre, Trimestre, Semestre, etc.) para que el usuario seleccione el tipo de evaluación.

4. Una vez seleccionado el **Tipo de Evaluación**, el frontend obtiene el valor de **`periodsCount`** asociado a ese tipo de evaluación y lo muestra automáticamente en el campo **Cantidad de Períodos**. Este campo será de solo lectura, ya que la cantidad de períodos depende de la configuración del tipo de evaluación.

5. El administrador hace clic en el botón **Generar**.

6. El sistema genera automáticamente la cantidad de filas indicada por **`periodsCount`**, asignando el nombre correspondiente a cada período (por ejemplo: Bimestre I, Bimestre II, Bimestre III y Bimestre IV), para que el usuario complete las fechas de inicio y fin y marque cuál es el período que se encuentra en curso.


el diseño seria:
## Generación de Períodos de Evaluación

### Configuración

| Año Académico | Tipo de Evaluación | Cantidad de Períodos | Acción |
|---------------|--------------------|----------------------|--------|
| 🔽 2026 | 🔽 Bimestre | 🔢 4 | **[ Generar ]** |

---

### Períodos Generados

> Ejemplo: Tipo de evaluación = **Bimestre** y **Cantidad de períodos = 4**

| Período (codigo)| Fecha de Inicio | Fecha de Fin | Cursando |
|----------|-----------------|--------------|-----------|
| Bimestre I | 📅 [Input Fecha] | 📅 [Input Fecha] | ☐ |
| Bimestre II | 📅 [Input Fecha] | 📅 [Input Fecha] | ☐ |
| Bimestre III | 📅 [Input Fecha] | 📅 [Input Fecha] | ☐ |
| Bimestre IV | 📅 [Input Fecha] | 📅 [Input Fecha] | ☐ |

---

### Comportamiento

- El usuario selecciona el **Año Académico**.
- El usuario selecciona el **Tipo de Evaluación**.
- El sistema carga automáticamente la **Cantidad de Períodos** según el tipo de evaluación (editable si el negocio lo permite).
- Al hacer clic en **Generar**, el sistema crea automáticamente una fila por cada período.
- El nombre del período se construye usando el nombre del tipo de evaluación y un número romano.
  - Ejemplo:
    - Bimestre I
    - Bimestre II
    - Bimestre III
    - Bimestre IV
- El usuario debe completar las fechas de inicio y fin de cada período.(al generase la tabal las fecha debe ponerese en forma automatica en un separacion de un mes entre ello en forma acendete desde actual.)
- Solo un período puede estar marcado como **Cursando**.
detro del cart que contine la tabal deb aber un buton para guardar o cancelar(se limpia todo la tabla generado.) 


## Listar Períodos
**GET** `/api/evaluation-periods`
### Filtros
- `yearId`
- `evaluationTypeId`
### Respuesta

```json
[
  {
    "id": 1,
    "code": "BIM-I",
    "name": "Bimestre I",
    "startDate": "2026-03-01",//Fecha Inicio**: corresponde a la fecha en que inicia el período (ejemplo: Bimestre I).
    "endDate": "2026-04-30",//Fecha Fin**: corresponde a la fecha en que finaliza el período (ejemplo: Bimestre IV).
    "isCurrent": true,
    "academicYear": "2029-bicentenario" ,//nombre de año en el iner join al talaba years
    "typeName": "Bimestre",//nombre de tipo de evaluacion iner join a la tabla tipo de evluacion
  }
]
```

---


Cuando el usuario haga clic en **Editar**, el frontend deberá consumir:
**GET** `/api/evaluation-periods/{id}`
Este endpoint devolverá toda la información necesaria para reconstruir el mismo formulario utilizado en la creación, incluyendo la cabecera (Año Académico, Tipo de Evaluación y Cantidad de Períodos) y la lista completa de períodos.
La respuesta incluirá:

- **Cabecera del formulario:**
  - `yearId`
  - `yearName`
  - `evaluationTypeId`
  - `evaluationTypeName`
  - `periodsCount`

- **Listado de períodos:**
  - `id`
  - `code`

  - `startDate`
  - `endDate`
  - `isCurrent`

El frontend utilizará esta información para:

1. Mostrar los datos de la cabecera.
2. Generar automáticamente la cantidad de filas indicada por `periodsCount`.
3. Completar cada fila con la información de los períodos.
4. Permitir únicamente la edición de `startDate`, `endDate` e `isCurrent`.

## Actualizar Períodos

**PUT** `/api/evaluation-periods/{id}`

### Request

```json
{
  "periods": [
    {
      "id": 1,
      "startDate": "2026-03-01",
      "endDate": "2026-04-30",
      "isCurrent": false
    },....
  ]
}
```
## Eliminar Período
**DELETE** `/api/evaluation-periods/{id}`
### Comportamiento

- Realiza un **Soft Delete**.
- Antes de eliminar se solicitará confirmación al usuario.
- Los registros eliminados no deberán aparecer en el listado.



## Tabla: evaluation_periods

| Campo | Tipo | Descripción |
|--------|------|-------------|
| id | BIGINT | Identificador único del período. |
| year_id | BIGINT | FK hacia `academic_years`. |
| evaluation_type_id | BIGINT | FK hacia `evaluation_types`. |
| code | VARCHAR(20) | Código del período (Ej.: BIM-I, TRI-II). |
| start_date | DATE | Fecha de inicio del período. |
| end_date | DATE | Fecha de fin del período. |
| is_current | BOOLEAN | Indica si el período se encuentra actualmente en curso. Solo un período puede tener el valor `true`. |
| status | VARCHAR(20) | Estado del registro (Activo, Inactivo, etc.). |
| created_at | TIMESTAMP | Fecha de creación del registro. |
| updated_at | TIMESTAMP | Fecha de última actualización. |
| deleted_at | TIMESTAMP NULL | Fecha de eliminación lógica (Soft Delete). Si es `NULL`, el registro está activo. |