import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DataTable } from "./DataTable";
import { FormDialog } from "./FormDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Button } from "@/components/ui/button";
import { useCrudResource } from "@/hooks/useCrudResource";
import { ApiError } from "@/types/api";
import type { ColumnDef, FieldDef } from "@/types";
import type { ReactNode } from "react";

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
  /** Callback when form dialog opens (for lazy loading options) */
  onFormOpen?: () => void;
  /** Whether the form options are still loading */
  isFormLoading?: boolean;
  /** Custom filter component to render above the table (receives search props to include in same row) */
  filterComponent?: (props: {
    setExtraParams: (params: Record<string, unknown>) => void;
    search: string;
    setSearch: (value: string) => void;
    refetch: () => void;
    searchPlaceholder: string;
    setPage: (page: number) => void;
  }) => ReactNode;
  /** Custom form dialog component (for complex forms) - if not provided, uses default FormDialog */
  renderFormDialog?: (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingItem: T | null;
    isSaving: boolean;
    onSave: (values: TPayload) => Promise<void>;
    refetch: () => void;
  }) => ReactNode;
  /** Callback for viewing item details (shows Eye button in table) */
  onViewDetails?: (item: T) => void;
  /** Callback when data changes (receives items for filtering) */
  onDataChange?: (items: T[]) => void;
  /** Custom delete handler (for confirmation dialogs) */
  onCustomDelete?: (item: T) => Promise<void> | void;
  /** Read-only mode - hides the create button and edit/delete actions */
  readOnly?: boolean;
  /** Custom render function for row actions (for custom action buttons) */
  renderActions?: (item: T) => ReactNode;
  /** Summary data to display (for reports) */
  summary?: any;
  /** Custom summary component to render (for reports) */
  summaryComponent?: (summary: any) => ReactNode;
}

/**
 * Reusable list+form+delete page. Every catalog module (Shifts, Classrooms,
 * Grades, Courses, Teachers, tipos de evaluación...) is just this component
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
  onFormOpen,
  isFormLoading = false,
  filterComponent,
  renderFormDialog,
  onViewDetails,
  onDataChange,
  onCustomDelete,
  readOnly = false,
  renderActions,
  summary,
  summaryComponent,
}: ApiCrudPageProps<T, TPayload>) {
  const resource = useCrudResource<T, TPayload, any>(api);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]> | null>(null);
  
  // Use a ref to track if onFormOpen has been called for this open
  const hasCalledOnFormOpen = useRef(false);

  // Call onFormOpen when form dialog opens (only once per open)
  useEffect(() => {
    if (formOpen && onFormOpen && !hasCalledOnFormOpen.current) {
      hasCalledOnFormOpen.current = true;
      onFormOpen();
    }
    if (!formOpen) {
      hasCalledOnFormOpen.current = false;
    }
  }, [formOpen, onFormOpen]);

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

  // Call onDataChange when items change
  useEffect(() => {
    onDataChange?.(resource.items);
  }, [resource.items, onDataChange]);

  // Memoize formInitialValues to prevent unnecessary re-renders
  const formInitialValues = useMemo(() => {
    return (editingItem ?? { ...emptyItem, id: "" }) as T;
  }, [editingItem, emptyItem]);

  // Handle delete - use custom handler if provided
  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      if (onCustomDelete) {
        await onCustomDelete(deleteTarget);
      } else {
        await resource.remove(deleteTarget.id);
      }
      setDeleteTarget(null);
    } catch {
      // El mensaje de error queda visible en resource.error; el diálogo
      // permanece abierto para que el usuario pueda reintentar.
    }
  }

  // Use summary from props or from resource
  const displaySummary = summary ?? resource.summary;

  // Default handlers for DataTable (required by interface)
  const handleEdit = readOnly ? (() => {}) : openEdit;
  const handleDeleteRow = readOnly ? (() => {}) : ((item: T) => {
    if (onCustomDelete) {
      onCustomDelete(item);
    } else {
      setDeleteTarget(item);
    }
  });

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={
          !readOnly && (
            <LoadingButton onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {newLabel}
            </LoadingButton>
          )
        }
      />

      {resource.error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {resource.error}
        </div>
      )}

      {filterComponent?.({
        setExtraParams: resource.setExtraParams,
        search: resource.search,
        setSearch: resource.setSearch,
        refetch: resource.refetch,
        searchPlaceholder,
        setPage: resource.setPage,
      })}

      {/* Summary component */}
      {displaySummary && summaryComponent && summaryComponent(displaySummary)}

<DataTable
        columns={columns}
        data={resource.items}
        onEdit={handleEdit}
        onDelete={handleDeleteRow}
        onViewDetails={onViewDetails}
        renderActions={renderActions}
        emptyMessage={resource.search ? "No se encontraron resultados." : "No hay registros todavía."}
        isLoading={resource.isLoading}
        deletingId={resource.deletingId}
        sortBy={resource.sortBy}
        sortDir={resource.sortDir}
        onSort={resource.toggleSort}
        currentPage={resource.page}
        itemsPerPage={resource.pagination?.limit ?? 10}
        hideRowActions={readOnly && !renderActions}
      />

      <Pagination pagination={resource.pagination} onPageChange={resource.setPage} disabled={resource.isLoading} />

      {renderFormDialog ? (
        renderFormDialog({
          open: formOpen,
          onOpenChange: setFormOpen,
          editingItem,
          isSaving: resource.isSaving,
          onSave: handleSubmit as any,
          refetch: resource.refetch,
        })
      ) : (
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
          isFormLoading={isFormLoading}
        />
      )}

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