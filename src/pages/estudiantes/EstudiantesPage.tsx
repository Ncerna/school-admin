import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { useCrudResource } from "@/hooks/useCrudResource";
import { useLookupOptions } from "@/hooks/useLookupOptions";
import { studentsService } from "@/services/students.service";
import { gradesService } from "@/services/grades.service";
import { classroomsService } from "@/services/classrooms.service";
import type { Aula, ColumnDef, Estudiante, Grado } from "@/types";

export default function EstudiantesPage() {
  const navigate = useNavigate();
  const resource = useCrudResource<Estudiante>(studentsService);
  const [deleteTarget, setDeleteTarget] = useState<Estudiante | null>(null);

  const { options: gradoOptions } = useLookupOptions<Grado>(gradesService, (g) => ({
    label: g.nombre,
    value: g.id,
  }));
  const { options: aulaOptions } = useLookupOptions<Aula>(classroomsService, (a) => ({
    label: a.nombre,
    value: a.id,
  }));
  const gradoById = new Map(gradoOptions.map((o) => [o.value, o.label]));
  const aulaById = new Map(aulaOptions.map((o) => [o.value, o.label]));

  const columns: ColumnDef<Estudiante>[] = [
    { header: "Nombres", accessor: "nombres", sortable: true },
    { header: "Apellidos", accessor: "apellidos", sortable: true },
    { header: "DNI", accessor: "dni" },
    { header: "Grado", accessor: "gradoId", render: (item) => gradoById.get(item.gradoId) ?? "—" },
    { header: "Aula", accessor: "aulaId", render: (item) => aulaById.get(item.aulaId) ?? "—" },
    { header: "Estado", accessor: "estado", render: (item) => <StatusBadge estado={item.estado} /> },
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

      <div className="mb-4 flex items-center gap-2">
        <SearchInput
          value={resource.search}
          onChange={resource.setSearch}
          placeholder="Buscar por nombres, apellidos o DNI..."
        />
      </div>

      <DataTable
        columns={columns}
        data={resource.items}
        onEdit={(item) => navigate(`/estudiantes/${item.id}/editar`)}
        onDelete={(item) => setDeleteTarget(item)}
        emptyMessage={resource.search ? "No se encontraron resultados." : "No hay estudiantes registrados todavía."}
        isLoading={resource.isLoading}
        deletingId={resource.deletingId}
        sortBy={resource.sortBy}
        sortDir={resource.sortDir}
        onSort={resource.toggleSort}
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
