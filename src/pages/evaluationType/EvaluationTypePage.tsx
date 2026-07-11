import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { evaluationTypesService } from "@/services/evaluation-types.service";
import type { ColumnDef, FieldDef, EvaluationType } from "@/types";

const columns: ColumnDef<EvaluationType>[] = [
  { header: "Nombre", accessor: "name", sortable: true },

  { header: "Estado", accessor: "status", render: (item) => <StatusBadge estado={item.status} /> },
 
];

const fields: FieldDef<EvaluationType>[] = [
  { name: "name", label: "Nombre", type: "text", placeholder: "Ej. Bimestre", required: true },
  
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

export default function EvaluationTypePage() {
  return (
    <ApiCrudPage<EvaluationType>
      title="Tipos de evaluación"
      description="Configura la estructura de evaluación de la institución."
      columns={columns}
      fields={fields}
      api={evaluationTypesService}
      emptyItem={{ name: "", status: "Activo" }}
      searchPlaceholder="Buscar tipo de evaluación..."
      newLabel="Nuevo tipo"
    />
  );
}