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
import { studentsService } from "@/services/students.service";
import type { ColumnDef, Student } from "@/types";

export default function StudentsPage() {
  const navigate = useNavigate();
  const resource = useCrudResource<Student>(studentsService);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const columns: ColumnDef<Student>[] = [
    { header: "Nombres", accessor: "firstName", sortable: true },
    { header: "Apellidos", accessor: "lastName", sortable: true },
    { header: "DNI", accessor: "dni" },
    { header: "Correo", accessor: "email", sortable: true },
  
    { header: "Género", accessor: "gender" },
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
        title="Estudiantes"
        description="Administra la matrícula y datos generales de los estudiantes."
        action={
          <Button onClick={() => navigate("/estudiantes/nuevo")}>
            <Plus className="h-4 w-4" />
            Nuevo estudiante
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
          placeholder="Buscar por nombres, apellidos o DNI..."
        />
        <Button variant="outline" size="icon" aria-label="Buscar" onClick={() => resource.refetch()}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={resource.items}
        onEdit={(item) => navigate("/estudiantes/editar", { state: { studentId: item.id } })}
        onDelete={(item) => setDeleteTarget(item)}
        emptyMessage={resource.search ? "No se encontraron resultados." : "No hay estudiantes registrados todavía."}
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
        title="¿Eliminar este estudiante?"
        description="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        isLoading={resource.deletingId === deleteTarget?.id}
      />
    </div>
  );
}