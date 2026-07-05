import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { levelsService } from "@/services/levels.service";
import type { ColumnDef, FieldDef, Level } from "@/types";

const columns: ColumnDef<Level>[] = [
  { header: "Nombre", accessor: "name", sortable: true },
  { header: "Descripción", accessor: "description" },
  { header: "Estado", accessor: "status", render: (item) => <StatusBadge estado={item.status} /> },
];

const fields: FieldDef<Level>[] = [
  { name: "name", label: "Nombre del nivel", type: "text", placeholder: "Ej. Inicial", required: true },
  { name: "description", label: "Descripción", type: "textarea", placeholder: "Breve descripción del nivel" },
  {
    name: "status",
    label: "Estado",
    type: "select",
    required: true,
    options: [
      { label: "Activo", value: "ACTIVE" },
      { label: "Inactivo", value: "INACTIVE" },
    ],
  },
];

export default function LevelsPage() {
  return (
    <ApiCrudPage<Level>
      title="Niveles"
      description="Administra los niveles educativos del colegio (Inicial, Primaria, Secundaria)."
      columns={columns}
      fields={fields}
      api={levelsService}
      emptyItem={{ name: "", description: "", status: "Activo" }}
      searchPlaceholder="Buscar nivel..."
      newLabel="Nuevo nivel"
    />
  );
}