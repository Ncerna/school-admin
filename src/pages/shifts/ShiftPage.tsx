import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { shiftsService } from "@/services/shifts.service";
import type { ColumnDef, FieldDef, Shift } from "@/types";

const columns: ColumnDef<Shift>[] = [
  { header: "Turno", accessor: "name", sortable: true },
  { header: "Hora de inicio", accessor: "startTime" },
  { header: "Hora de fin", accessor: "endTime" },
  { header: "Estado", accessor: "status", render: (item) => <StatusBadge estado={item.status} /> },
];

const fields: FieldDef<Shift>[] = [
  { name: "name", label: "Nombre", type: "text", placeholder: "Ej. Mañana", required: true },
 { name: "startTime", label: "Hora de inicio", type: "time", required: true },
{ name: "endTime", label: "Hora de finalización", type: "time", required: true },
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

export default function ShiftsPage() {
  return (
    <ApiCrudPage<Shift>
      title="Turnos"
      description="Mantén el catálogo de turnos escolares (mañana, tarde, noche)."
      columns={columns}
      fields={fields}
      api={shiftsService}
      emptyItem={{ name: "", startTime: "", endTime: "", status: "Activo" }}
      searchPlaceholder="Buscar turno..."
      newLabel="Nuevo turno"
    />
  );
}