import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { classroomsService } from "@/services/classrooms.service";
import type { Classroom, ColumnDef, FieldDef } from "@/types";

const columns: ColumnDef<Classroom>[] = [
  { header: "Aula", accessor: "name", sortable: true },
  { header: "Estado", accessor: "status", render: (item) => <StatusBadge estado={item.status} /> },
];

const fields: FieldDef<Classroom>[] = [
  { name: "name", label: "Nombre del aula", type: "text", placeholder: "Ej. Aula 101", required: true },
  {
    name: "status",
    label: "Estado",
    type: "select",
    required: true,
    options: [
      { label: "Activo", value: "Activo" },
      { label: "Inactivo", value: "Inactivo" },
    ],
  },
];

export default function ClassroomsPage() {
  return (
    <ApiCrudPage<Classroom>
      title="Aulas"
      description="Administra el catálogo de aulas del colegio."
      columns={columns}
      fields={fields}
      api={classroomsService}
      emptyItem={{ name: "", status: "Activo" }}
      searchPlaceholder="Buscar aula..."
      newLabel="Nuevo aula"
    />
  );
}