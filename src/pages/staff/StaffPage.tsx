import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { useCrudResource } from "@/hooks/useCrudResource";
import { staffService } from "@/services/staff.service";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
import type { ColumnDef, Staff, Role } from "@/types";

export default function StaffPage() {
  const navigate = useNavigate();
  const resource = useCrudResource<Staff>(staffService);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);

  // Get roles for filter (excluding ALUM and DOC)
  const { options: roleOptions } = useOptions<Role>(
    ENDPOINTS.roles,
    (item) => ({ label: item.name, value: String(item.id) }),
    true
  );

  const columns: ColumnDef<Staff>[] = [
    { header: "Nombres", accessor: "firstName", sortable: true },
    { header: "Apellidos", accessor: "lastName", sortable: true },
    { header: "DNI", accessor: "dni" },
    { header: "Correo", accessor: "email", sortable: true },
    { header: "Teléfono", accessor: "phone" },
    { header: "Cargo", accessor: "position" },
    { 
      header: "Rol", 
      accessor: "role",
      render: (item) => {
        const role = roleOptions.find(r => r.value === item.role);
        return role ? role.label : item.role;
      }
    },
    { 
      header: "Estado", 
      accessor: "status",
      render: (item) => <StatusBadge estado={item.status} />
    },
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
        title="Personal administrativo"
        description="Administra el personal administrativo de la institución."
        action={
          <Button onClick={() => navigate("/personal-administrativo/nuevo")}>
            <Plus className="h-4 w-4" />
            Nuevo personal
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
        onEdit={(item) => navigate("/personal-administrativo/editar", { state: { staffId: item.id } })}
        onDelete={(item) => setDeleteTarget(item)}
        emptyMessage={resource.search ? "No se encontraron resultados." : "No hay personal administrativo registrado todavía."}
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
        title="¿Dar de baja a este personal?"
        description="¿Confirmas dar de baja a este personal? Su cuenta de acceso también será desactivada."
        onConfirm={handleDelete}
        isLoading={resource.deletingId === deleteTarget?.id}
      />
    </div>
  );
}