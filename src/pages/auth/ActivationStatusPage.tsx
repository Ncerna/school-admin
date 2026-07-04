import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { Badge } from "@/components/ui/badge";
import { useCrudResource } from "@/hooks/useCrudResource";
import { authService } from "@/services/auth.service";
import type { AccountActivationStatus as Account } from "@/types/auth";
import type { ColumnDef as Column } from "@/types";

const noopApi = {
  create: async () => {
    throw new Error("not supported");
  },
  update: async () => {
    throw new Error("not supported");
  },
  remove: async () => {
    throw new Error("not supported");
  },
};

export default function ActivationStatusPage() {
  const resource = useCrudResource<Account>({ list: authService.getActivationStatusList, ...noopApi });

  const columns: Column<Account>[] = [
    { header: "Nombres", accessor: "nombres", sortable: true },
    { header: "Apellidos", accessor: "apellidos" },
    { header: "Correo", accessor: "correo" },
    {
      header: "Estado de activación",
      accessor: "estadoActivacion",
      render: (item) => (
        <Badge variant={item.estadoActivacion === "Activado" ? "success" : "secondary"}>
          {item.estadoActivacion}
        </Badge>
      ),
    },
    { header: "Fecha de activación", accessor: "fechaActivacion", render: (item) => item.fechaActivacion || "—" },
  ];

  return (
    <div>
      <PageHeader title="Estado de activación de cuentas" description="Revisa qué cuentas ya fueron activadas por los usuarios." />

      <div className="mb-4 flex items-center gap-2">
        <SearchInput value={resource.search} onChange={resource.setSearch} placeholder="Buscar usuario..." />
      </div>

      <DataTable
        columns={columns}
        data={resource.items}
        onEdit={() => {}}
        onDelete={() => {}}
        isLoading={resource.isLoading}
        hideRowActions
      />

      <Pagination pagination={resource.pagination} onPageChange={resource.setPage} disabled={resource.isLoading} />
    </div>
  );
}
