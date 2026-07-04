import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { coursesService } from "@/services/courses.service";
import type { ColumnDef, Curso, FieldDef } from "@/types";

const columns: ColumnDef<Curso>[] = [
  { header: "Curso", accessor: "nombre", sortable: true },
  { header: "Código", accessor: "codigo", render: (item) => item.codigo || "—" },
  { header: "Estado", accessor: "estado", render: (item) => <StatusBadge estado={item.estado} /> },
];

const fields: FieldDef<Curso>[] = [
  { name: "nombre", label: "Nombre del curso", type: "text", placeholder: "Ej. Matemática", required: true },
  { name: "codigo", label: "Código (opcional)", type: "text", placeholder: "Ej. MAT-01" },
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

export default function CursosPage() {
  return (
    <ApiCrudPage<Curso>
      title="Cursos"
      description="Mantén actualizado el catálogo institucional de cursos."
      columns={columns}
      fields={fields}
      api={coursesService}
      emptyItem={{ nombre: "", codigo: "", estado: "Activo" }}
      searchPlaceholder="Buscar curso..."
      newLabel="Nuevo curso"
    />
  );
}
