import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { classroomsService } from "@/services/classrooms.service";
import type { Aula, ColumnDef, FieldDef } from "@/types";

const columns: ColumnDef<Aula>[] = [
  { header: "Aula", accessor: "nombre", sortable: true },
  { header: "Estado", accessor: "estado", render: (item) => <StatusBadge estado={item.estado} /> },
];

const fields: FieldDef<Aula>[] = [
  { name: "nombre", label: "Nombre del aula", type: "text", placeholder: "Ej. Aula 101", required: true },
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

export default function AulasPage() {
  return (
    <ApiCrudPage<Aula>
      title="Aulas"
      description="Administra el catálogo de aulas del colegio."
      columns={columns}
      fields={fields}
      api={classroomsService}
      emptyItem={{ nombre: "", estado: "Activo" }}
      searchPlaceholder="Buscar aula..."
      newLabel="Nueva aula"
    />
  );
}
