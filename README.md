# Sistema Escolar — Panel Administrativo

Frontend en **React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui**
conectado a un backend REST real, con manejo centralizado de peticiones
HTTP, autenticación con Access/Refresh Token, y componentes reutilizables
(tabla, paginación, formularios, confirmaciones).

## 🚀 Cómo correrlo

Requisitos: Node.js 18 o superior. El backend debe estar disponible en
`http://127.0.0.1:8000/api` (o la URL que definas en `.env`).

```bash
# 1. Descomprime el zip y entra a la carpeta
cd school-admin

# 2. Copia el archivo de entorno y ajusta la URL de tu API si es necesario
cp .env.example .env

# 3. Instala las dependencias
npm install

# 4. Levanta el entorno de desarrollo
npm run dev
```

Abre `http://localhost:5173` en el navegador. Sin sesión iniciada, verás el
**Portal Institucional**; desde ahí puedes ir a "Ingresar" para autenticarte.

Para generar la build de producción:

```bash
npm run build
npm run preview
```

## 🔌 Configuración de la API

Todo el frontend habla con el backend a través de un **cliente HTTP
centralizado** (`src/lib/api-client.ts`):

- Antepone automáticamente `VITE_API_BASE_URL` (por defecto
  `http://127.0.0.1:8000/api`) a cada endpoint.
- **Verifica si existe un Access Token** guardado y, de ser así, lo agrega
  como `Authorization: Bearer <token>` en cada solicitud autenticada.
- Si el backend responde `401`, intenta **refrescar la sesión** una sola
  vez con el Refresh Token; si el refresh también falla, limpia la sesión
  y emite un evento (`auth:session-expired`) que el `AuthContext` escucha
  para redirigir a `/login`.
- Desempaqueta automáticamente el formato de respuesta
  `{ success, message, data, errors }` y lanza un `ApiError` tipado
  cuando `success` es `false`, con los `errors` de validación del backend
  disponibles para mostrarlos en los formularios.

Cada módulo (Students, Teachers, Classrooms, Grades, Courses, Shifts, años
académicos, tipos de evaluación, roles) tiene su propio **servicio**
(`src/services/*.service.ts`), la mayoría generado con la fábrica
`createCrudService` (`src/lib/crud-service.ts`) para no repetir
list/create/update/delete en cada módulo.

## 🧱 Arquitectura del proyecto

```
src/
├── lib/
│   ├── api-client.ts     # Cliente HTTP centralizado (auth header, refresh, unwrap de respuesta)
│   ├── crud-service.ts   # Fábrica de servicios CRUD reutilizada por cada catálogo
│   ├── endpoints.ts      # Único lugar con las rutas del backend
│   ├── token-storage.ts  # Persistencia de tokens/usuario/menú (localStorage)
│   └── utils.ts
├── services/             # Un archivo por reCourse (students, teachers, classrooms, ...)
├── hooks/
│   ├── useCrudResource.ts   # Paginación + búsqueda (debounced) + orden + CRUD con loading states
│   ├── useLookupOptions.ts  # Carga catálogos (Level, Classroom, Shift...) para <Select>
│   ├── useSessionMonitor.ts # Detecta cuándo el Access Token está por expirar
│   └── useDebounce.ts
├── context/AuthContext.tsx  # Sesión: login, logout, escucha auth:session-expired
├── components/
│   ├── ui/            # Primitivos shadcn/ui (button, input, select, dialog, checkbox, etc.)
│   ├── common/         # LoadingButton, Pagination, SearchInput, ProtectedRoute,
│   │                   # PublicOnlyRoute, SessionExpiryModal
│   ├── layout/         # Navbar, Sidebar, DashboardLayout
│   └── shared/         # PageHeader, DataTable (sorteable + skeleton), FormDialog,
│                       # ConfirmDialog, ApiCrudPage (motor genérico de CRUD contra la API)
├── pages/
│   ├── portal/PortalPage.tsx              # RF-HU-008 Portal institucional (público)
│   ├── auth/LoginPage.tsx                 # RF-HU-007 Login
│   ├── auth/ActivateAccountPage.tsx       # RF-HU-004 Activación de cuenta
│   ├── auth/ActivationStatusPage.tsx      # RF-HU-004 Listado de estados de activación
│   ├── Students/StudentsPage.tsx    # RF-HU-003 Listado (tabla + búsqueda + orden)
│   ├── Students/StudentFormPage.tsx # RF-HU-003 Pantalla dedicada crear/editar (no modal)
│   ├── Teachers/TeachersPage.tsx          # RF-HU-005
│   ├── accesos/AccesosPage.tsx            # RF-HU-006 Gestión de accesos por rol
│   ├── Leveles/LevelesPage.tsx
│   ├── Classrooms/ClassroomsPage.tsx                # RF-HU-014
│   ├── Grades/GradesPage.tsx              # RF-HU-015
│   ├── Courses/CoursesPage.tsx              # RF-HU-016
│   ├── Shifts/ShiftsPage.tsx              # RF-HU-009
│   ├── anio-academico/AnioAcademicoPage.tsx # RF-HU-010
│   └── tipos-evaluacion/TiposEvaluacionPage.tsx # RF-HU-011
├── types/
│   ├── api.ts   # ApiResponse, PaginatedData, ListParams, ApiError
│   ├── auth.ts  # AuthUser, LoginPayload/Result, MenuPermission, activación
│   └── index.ts # Entidades de dominio + ColumnDef/FieldDef genéricos
└── App.tsx      # Rutas públicas (portal, login, activación) y protegidas (dashboard)
```

## ✅ Cómo se cumplen las especificaciones pedidas

- **Íconos según la acción**: cada botón (crear, editar, eliminar, guardar,
  activar, refrescar sesión, cerrar sesión, ingresar...) usa un ícono de
  `lucide-react` acorde a su acción.
- **Loading State tras el clic**: todo botón de acción pasa por
  `LoadingButton` (`src/components/common/LoadingButton.tsx`), que se
  deshabilita y muestra un spinner mientras la petición está en Course.
  Las tablas también muestran un *skeleton* mientras cargan y un spinner
  por fila mientras se elimina un registro puntual.
- **Componentes reutilizables**: `Pagination`, `SearchInput`, `DataTable`
  (con orden por columna), `FormDialog`, `ConfirmDialog` y `ApiCrudPage`
  son usados por todos los módulos de catálogo; agregar uno nuevo no
  repite lógica de paginación/búsqueda/orden/loading.
- **Cliente HTTP centralizado con Authorization automático**: ver sección
  "Configuración de la API" arriba (`api-client.ts` + `token-storage.ts`).

## ➕ Cómo agregar un módulo CRUD nuevo

1. Define el tipo en `src/types/index.ts`.
2. Crea el servicio en `src/services/nuevo.service.ts`:
   ```ts
   export const nuevoService = createCrudService<Nuevo>(ENDPOINTS.nuevo);
   ```
3. Crea `src/pages/nuevo/NuevoPage.tsx` siguiendo el patrón de
   `ShiftsPage.tsx` (columnas + campos + `<ApiCrudPage />`).
4. Agrega la ruta en `App.tsx` y el ítem en
   `src/components/layout/nav-items.ts`.

## 📦 Stack

- React 19 + Vite 6 + TypeScript
- React Router 7
- Tailwind CSS 3 + tailwindcss-animate
- shadcn/ui (Radix UI: Dialog, Dropdown Menu, Select, Avatar, Checkbox...)
- lucide-react (íconos)

## 📌 Alcance de esta entrega

Se implementaron: Portal Institucional (RF-HU-008), Autenticación con
monitoreo/renovación de sesión (RF-HU-007), Activación de cuenta y listado
de estados (RF-HU-004), Students con pantalla dedicada (RF-HU-003),
Teachers (RF-HU-005), Accesos por rol (RF-HU-006), Shifts (RF-HU-009),
Años académicos (RF-HU-010), Tipos de evaluación (RF-HU-011), Classrooms
(RF-HU-014), Grades (RF-HU-015) y Courses (RF-HU-016), todos sobre la
infraestructura centralizada descrita arriba.

Quedan pendientes (mismo patrón, listos para replicar rápidamente):
generación de Períodos de Evaluación (RF-HU-012), Asignación de Courses a
Grades (RF-HU-016b), Datos del Colegio con carga de logo/banner
(RF-HU-017) y Gestión de Eventos y Publicaciones (RF-HU-018), por requerir
UI a medida (matrices de selección, generación automática de tablas, carga
de archivos) fuera del alcance de esta iteración.

