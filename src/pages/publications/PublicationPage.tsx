import { useState } from "react";
import { Plus, Search, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { useCrudResource } from "@/hooks/useCrudResource";
import { publicationService } from "@/services/publication.service";
import type { ColumnDef, Publication, PublicationStatus } from "@/types";

export default function PublicationPage() {
  const navigate = useNavigate();
  const resource = useCrudResource<Publication>(publicationService);
  const [deleteTarget, setDeleteTarget] = useState<Publication | null>(null);
  const [statusFilter, setStatusFilter] = useState<PublicationStatus | "">("");

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await resource.remove(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // se mantiene abierto el diálogo para reintentar
    }
  }

  async function handleApprove(item: Publication) {
    try {
      await publicationService.approve(item.id);
      resource.refetch();
    } catch {
      // error handling
    }
  }

  const columns: ColumnDef<Publication>[] = [
    { header: "Título", accessor: "title", sortable: true },
    { header: "Fecha", accessor: "date", sortable: true },
    { header: "Sección", accessor: "section" },
    { header: "Público objetivo", accessor: "targetAudience" },
    { header: "Estado", accessor: "status" },
    { header: "Fecha de creación", accessor: "createdAt", sortable: true },
    {
      header: "Acciones",
      accessor: "status",
      render: (item) =>
        item.status === "Pendiente" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleApprove(item)}
            title="Aprobar"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Publicaciones"
        description="Administra eventos y publicaciones del sistema."
        action={
          <Button onClick={() => navigate("/publicaciones/nuevo")}>
            <Plus className="h-4 w-4" />
            Nueva publicación
          </Button>
        }
      />

      {resource.error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {resource.error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-end gap-2">
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PublicationStatus | "")}
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Archivado">Archivado</option>
        </select>
        <SearchInput
          value={resource.search}
          onChange={resource.setSearch}
          placeholder="Buscar por título..."
        />
        <Button variant="outline" size="icon" aria-label="Buscar" onClick={() => resource.refetch()}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={resource.items}
        onEdit={(item) => navigate(`/publicaciones/${item.id}/editar`)}
        onDelete={(item) => setDeleteTarget(item)}
        emptyMessage={resource.search ? "No se encontraron resultados." : "No hay publicaciones registradas todavía."}
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
        title="¿Eliminar esta publicación?"
        description="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        isLoading={resource.deletingId === deleteTarget?.id}
      />
    </div>
  );
}