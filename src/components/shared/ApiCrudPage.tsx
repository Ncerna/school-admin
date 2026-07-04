import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DataTable } from "./DataTable";
import { FormDialog } from "./FormDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { LoadingButton } from "@/components/common/LoadingButton";
import { useCrudResource } from "@/hooks/useCrudResource";
import { ApiError } from "@/types/api";
import type { ColumnDef, FieldDef } from "@/types";

interface CrudApi<T, TPayload> {
  list: (params?: any) => Promise<any>;
  create: (payload: TPayload) => Promise<T>;
  update: (id: string, payload: TPayload) => Promise<T>;
  remove: (id: string) => Promise<null>;
}

interface ApiCrudPageProps<T extends { id: string }, TPayload = Omit<T, "id">> {
  title: string;
  description: string;
  columns: ColumnDef<T>[];
  fields: FieldDef<T>[];
  api: CrudApi<T, TPayload>;
  emptyItem: TPayload;
  searchPlaceholder?: string;
  newLabel?: string;
}

/**
 * Reusable list+form+delete page. Every catalog module (turnos, aulas,
 * grados, cursos, docentes, tipos de evaluación...) is just this component
 * configured with columns/fields/api, keeping pagination, search, sorting,
 * loading states and error handling centralized in one place.
 */
export function ApiCrudPage<T extends { id: string }, TPayload = Omit<T, "id">>({
  title,
  description,
  columns,
  fields,
  api,
  emptyItem,
  searchPlaceholder = "Buscar...",
  newLabel = "Nuevo",
}: ApiCrudPageProps<T, TPayload>) {
  const resource = useCrudResource<T, TPayload>(api);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]> | null>(null);

  function openCreate() {
    setEditingItem(null);
    setFormErrors(null);
    setFormOpen(true);
  }

  function openEdit(item: T) {
    setEditingItem(item);
    setFormErrors(null);
    setFormOpen(true);
  }

  async function handleSubmit(values: T) {
    setFormErrors(null);
    try {
      if (editingItem) {
        await resource.update(editingItem.id, values as unknown as TPayload);
      } else {
        await resource.create(values as unknown as TPayload);
      }
      setFormOpen(false);
    } catch (err) {
      if (err instanceof ApiError && err.errors) setFormErrors(err.errors);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await resource.remove(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // El mensaje de error queda visible en resource.error; el diálogo
      // permanece abierto para que el usuario pueda reintentar.
    }
  }

  const formInitialValues = (editingItem ?? { ...emptyItem, id: "" }) as T;

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={
          <LoadingButton onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {newLabel}
          </LoadingButton>
        }
      />

      {resource.error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {resource.error}
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <SearchInput value={resource.search} onChange={resource.setSearch} placeholder={searchPlaceholder} />
        <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">
          {resource.pagination.total} registro(s)
        </span>
      </div>

      <DataTable
        columns={columns}
        data={resource.items}
        onEdit={openEdit}
        onDelete={(item) => setDeleteTarget(item)}
        emptyMessage={resource.search ? "No se encontraron resultados." : "No hay registros todavía."}
        isLoading={resource.isLoading}
        deletingId={resource.deletingId}
        sortBy={resource.sortBy}
        sortDir={resource.sortDir}
        onSort={resource.toggleSort}
      />

      <Pagination pagination={resource.pagination} onPageChange={resource.setPage} disabled={resource.isLoading} />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingItem ? `Editar ${title.slice(0, -1) || title}` : "Nuevo registro"}
        description={
          editingItem ? "Actualiza la información y guarda los cambios." : "Completa los datos para crear el registro."
        }
        fields={fields}
        initialValues={formInitialValues}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Guardar cambios" : "Crear"}
        isSubmitting={resource.isSaving}
        serverErrors={formErrors}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="¿Eliminar este registro?"
        description="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        isLoading={resource.deletingId === deleteTarget?.id}
      />
    </div>
  );
}
