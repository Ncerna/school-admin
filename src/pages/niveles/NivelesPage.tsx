import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { levelsService } from "@/services/levels.service";
import type { ColumnDef, FieldDef, Nivel } from "@/types";

const columns: ColumnDef<Nivel>[] = [
  { header: "Nombre", accessor: "nombre", sortable: true },
  { header: "Descripción", accessor: "descripcion" },
  { header: "Estado", accessor: "estado", render: (item) => <StatusBadge estado={item.estado} /> },
];

const fields: FieldDef<Nivel>[] = [
  { name: "nombre", label: "Nombre del nivel", type: "text", placeholder: "Ej. Inicial", required: true },
  { name: "descripcion", label: "Descripción", type: "textarea", placeholder: "Breve descripción del nivel" },
  {
    name: "estado",
    label: "Estado",
    type: "select",
    required: true,
    options: [
      { label: "Activo", value: "Activo" },
      { label: "Inactivo", value: "Inactivo" },
    ],
  },
];

export default function NivelesPage() {
  return (
    <ApiCrudPage<Nivel>
      title="Niveles"
      description="Administra los niveles educativos del colegio (Inicial, Primaria, Secundaria)."
      columns={columns}
      fields={fields}
      api={levelsService}
      emptyItem={{ nombre: "", descripcion: "", estado: "Activo" }}
      searchPlaceholder="Buscar nivel..."
      newLabel="Nuevo nivel"
    />
  );
}
