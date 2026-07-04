import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { evaluationTypesService } from "@/services/evaluation-types.service";
import type { ColumnDef, FieldDef, TipoEvaluacion } from "@/types";

const columns: ColumnDef<TipoEvaluacion>[] = [
  { header: "Nombre", accessor: "nombre", sortable: true },
  { header: "Cantidad de períodos", accessor: "cantidadPeriodos" },
  { header: "Estado", accessor: "estado", render: (item) => <StatusBadge estado={item.estado} /> },
];

const fields: FieldDef<TipoEvaluacion>[] = [
  { name: "nombre", label: "Nombre", type: "text", placeholder: "Ej. Bimestre", required: true },
  {
    name: "cantidadPeriodos",
    label: "Cantidad de períodos",
    type: "number",
    placeholder: "Ej. 4",
    required: true,
  },
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

export default function TiposEvaluacionPage() {
  return (
    <ApiCrudPage<TipoEvaluacion>
      title="Tipos de evaluación"
      description="Configura la estructura de evaluación de la institución."
      columns={columns}
      fields={fields}
      api={evaluationTypesService}
      emptyItem={{ nombre: "", cantidadPeriodos: 1, estado: "Activo" }}
      searchPlaceholder="Buscar tipo de evaluación..."
      newLabel="Nuevo tipo"
    />
  );
}
