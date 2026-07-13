**RF-HU-022.1 Frontend: Fee Schedules (Tarifas)**

Implement **only** the **Fee Schedules** CRUD module. Do **not** implement Charge Types, Payment Methods or Cash Points. This screen must strictly follow the exact structure, patterns and UI used by the existing **Courses** module.

### General Rules

* Follow this project's existing conventions exactly.
* Reuse the same architecture, folder structure, hooks, dialogs, services and components used by the **Courses** module.
* Do not introduce new UI patterns.
* All code (variables, types, comments) must be in English.
* All UI labels must be in Spanish.

### Types

Create:

```text
src/types/fee-schedule.ts
```

```ts
FeeSchedule {
  id
  yearId
  yearName
  gradeId
  gradeName
  chargeTypeId
  chargeTypeName
  amount
}

FeeSchedulePayload {
  yearId
  gradeId
  chargeTypeId
  amount
}
```

### Endpoint

Add:

```text
feeSchedules: "/fee-schedules"
```

to:

```text
src/lib/endpoints.ts
```

### Service

Create:

```text
src/services/fee-schedules.service.ts
```

using `createCrudService`.

### Page

Create the page following **exactly** the same implementation style as the **Courses** module.

The page must provide a standard CRUD.

The form must contain:

* Año Académico (Select)
* Grado (Select, optional)
* Tipo de Cobro (Select)
* Monto (Input)

The list must display:

* Año Académico
* Grado
* Tipo de Cobro
* Monto

Each row must support:

* Editar
* Eliminar

Use the same components already used in the Courses module:

* ApiCrudPage
* DataTable
* FormDialog
* ConfirmDialog
* useCrudResource
* createCrudService
* SelectField

### Navigation

Add a single menu item:

```text
Pagos
 └── Tarifas
```

Route:

```text
/fee-schedules
```

Register the route following exactly the same pattern used by the Courses module.

Do not implement any other payment catalogs or additional payment functionality.

## API Endpoints

### List Fee Schedules

Obtiene las tarifas registradas.

**GET** `/api/fee-schedules`

### Query Params

```text
yearId (optional)
gradeId (optional)
```

### Response (paginado, mismo formato que los demás módulos)

```json
{
  "data": [
    {
      "id": 1,
      "yearId": 1,
      "yearName": "2026",
      "gradeId": 2,
      "gradeName": "PRIMERO",
      "chargeTypeId": 1,
      "chargeTypeName": "Matrícula",
      "amount": 500.00
    }
  ]
}
```

---

### Get Fee Schedule

Obtiene una tarifa por su identificador.

**GET** `/api/fee-schedules/{id}`

### Response

```json
{
  "id": 1,
  "yearId": 1,
  "gradeId": 2,
  "chargeTypeId": 1,
  "amount": 500.00
}
```

---

### Create Fee Schedule

Registra una nueva tarifa.

**POST** `/api/fee-schedules`

### Request

```json
{
  "yearId": 1,
  "gradeId": 2,
  "chargeTypeId": 1,
  "amount": 500.00
}
```

### Response

```json
{
  "success": true,
  "message": "Fee schedule created successfully."
}
```

---

### Update Fee Schedule

Actualiza una tarifa existente.

**PUT** `/api/fee-schedules/{id}`

### Request

```json
{
  "yearId": 1,
  "gradeId": 2,
  "chargeTypeId": 1,
  "amount": 550.00
}
```

### Response

```json
{
  "success": true,
  "message": "Fee schedule updated successfully."
}
```

---

### Delete Fee Schedule

Elimina una tarifa (Soft Delete).

**DELETE** `/api/fee-schedules/{id}`

### Response

```json
{
  "success": true,
  "message": "Fee schedule deleted successfully."
}
```
