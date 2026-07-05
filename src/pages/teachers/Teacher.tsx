import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { useCrudResource } from "@/hooks/useCrudResource";
import { teachersService } from "@/services/teachers.service";
import type { ColumnDef, Teacher } from "@/types";

export default function TeachersPage() {
  const navigate = useNavigate();
  const resource = useCrudResource<Teacher>(teachersService);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const columns: ColumnDef<Teacher>[] = [
    { header: "Nombres", accessor: "firstName", sortable: true },
    { header: "Apellidos", accessor: "lastName", sortable: true },
    { header: "DNI", accessor: "dni" },
    { header: "Especialidad", accessor: "specialty" },
    { header: "Correo", accessor: "email" },
    { header: "Teléfono", accessor: "phone" },
    { header: "Estado", accessor: "status", render: (item) => <StatusBadge estado={item.status} /> },
  ];

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await resource.remove(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // se mantiene abierto el diálogo para reintentar
    }
  }

  return (
    <div>
      <PageHeader
        title="Docentes"
        description="Administra la información del personal docente del colegio."
        action={
          <Button onClick={() => navigate("/docentes/nuevo")}>
            <Plus className="h-4 w-4" />
            Nuevo docente
          </Button>
        }
      />

      {resource.error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {resource.error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-end gap-2">
        <SearchInput
          value={resource.search}
          onChange={resource.setSearch}
          placeholder="Buscar docente..."
        />
        <Button variant="outline" size="icon" aria-label="Buscar" onClick={() => resource.refetch()}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={resource.items}
        onEdit={(item) => navigate(`/docentes/${item.id}/editar`)}
        onDelete={(item) => setDeleteTarget(item)}
        isLoading={resource.isLoading}
        deletingId={resource.deletingId}
        sortBy={resource.sortBy}
        sortDir={resource.sortDir}
        onSort={resource.toggleSort}
        currentPage={resource.page}
        itemsPerPage={resource.pagination?.limit ?? 10}
      />

      <Pagination pagination={resource.pagination} onPageChange={resource.setPage} disabled={resource.isLoading} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="¿Eliminar este docente?"
        description="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        isLoading={resource.deletingId === deleteTarget?.id}
      />
    </div>
  );
}