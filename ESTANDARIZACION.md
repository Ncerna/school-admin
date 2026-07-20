# Guía de Estandarización - Formato de Trabajo

## Estructura de Carpetas

```
src/
├── pages/
│   └── {modulo}/
│       ├── {Modulo}Page.tsx     # Página principal
│       ├── {Modulo}Form.tsx     # Formulario (opcional)
│       └── {Modulo}Tab.tsx      # Tabs (opcional)
├── services/
│   └── {modulo}.service.ts      # Servicio API
├── types/
│   └── {modulo}.ts              # Tipos TypeScript
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── common/                  # LoadingButton, Pagination, SearchInput
│   └── shared/                  # ConfirmDialog, DataTable, PageHeader
└── hooks/
    └── useOptions.ts            # Hook para selects
```

## Patrón de Servicio API

```typescript
// src/services/{modulo}.service.ts
import { apiClient } from "@/lib/api-client";
import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Modulo } from "@/types/{modulo}";

const base = ENDPOINTS.{modulo};

// CRUD básico
const crudService = createCrudService<Modulo>(base);

export const {modulo}Service = {
  // Heredar operaciones CRUD
  list: crudService.list,
  getById: crudService.getById,
  create: crudService.create,
  update: crudService.update,
  remove: crudService.remove,
  
  // Métodos personalizados
  getByCustom: (params) => apiClient.get<Modulo>(`${base}/custom`, params),
};
```

## Patrón de Tipos

```typescript
// src/types/{modulo}.ts
export interface Modulo {
  id: string | number;
  // ...otros campos
}

export interface ModuloPayload {
  // Campos para crear/editar
}

export interface ModuloOption {
  id: number;
  name: string;
}
```

## Patrón de Página Principal

```typescript
// src/pages/{modulo}/{Modulo}Page.tsx
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { useCrudResource } from "@/hooks/useCrudResource";
import { {modulo}Service } from "@/services/{modulo}.service";
import type { ColumnDef } from "@/types";
import type { Modulo } from "@/types/{modulo}";

const columns: ColumnDef<Modulo>[] = [
  { header: "Nombre", accessor: "name", sortable: true },
  // ...más columnas
];

export default function {Modulo}Page() {
  const resource = useCrudResource<Modulo>({
    list: {modulo}Service.list,
    // ...otros métodos
  });

  return (
    <div>
      <PageHeader
        title="Título del Módulo"
        description="Descripción del módulo"
      />
      
      <SearchInput ... />
      
      <DataTable
        columns={columns}
        data={resource.items}
        ...
      />
      
      <Pagination ... />
    </div>
  );
}
```

## Componentes Reutilizables Disponibles

### UI Components (shadcn)
- `Button`, `Input`, `Label`, `Select`, `Dialog`, `Checkbox`, `Badge`

### Common Components
- `LoadingButton` - Botón con estado de carga
- `Pagination` - Paginación de tablas
- `SearchInput` - Input de búsqueda

### Shared Components
- `PageHeader` - Header de página con título y descripción
- `DataTable` - Tabla con columnas configurables
- `ConfirmDialog` - Diálogo de confirmación
- `DependencyConfirmDialog` - Diálogo con dependencias

## Hook useOptions

```typescript
const { options, isLoading, fetch } = useOptions<OptionType>(
  ENDPOINTS.{endpoint},
  (item) => ({ label: item.name, value: String(item.id) }),
  true // autoFetch
);
```

## Flujo de Trabajo Recomendado

1. **Crear tipos** en `src/types/{modulo}.ts`
2. **Crear servicio** en `src/services/{modulo}.service.ts`
3. **Crear páginas** en `src/pages/{modulo}/`
4. **Agregar endpoint** en `src/lib/endpoints.ts`
5. **Usar componentes existentes** (no crear nuevos si ya hay uno similar)