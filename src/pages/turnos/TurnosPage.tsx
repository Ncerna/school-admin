import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { shiftsService } from "@/services/shifts.service";
import type { ColumnDef, FieldDef, Turno } from "@/types";

const columns: ColumnDef<Turno>[] = [
  { header: "Turno", accessor: "nombre", sortable: true },
  { header: "Hora de inicio", accessor: "horaInicio" },
  { header: "Hora de fin", accessor: "horaFin" },
  { header: "Estado", accessor: "estado", render: (item) => <StatusBadge estado={item.estado} /> },
];

const fields: FieldDef<Turno>[] = [
  { name: "nombre", label: "Nombre", type: "text", placeholder: "Ej. Mañana", required: true },
  { name: "horaInicio", label: "Hora de inicio", type: "text", placeholder: "08:00", required: true },
  { name: "horaFin", label: "Hora de finalización", type: "text", placeholder: "13:00", required: true },
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

export default function TurnosPage() {
  return (
    <ApiCrudPage<Turno>
      title="Turnos"
      description="Mantén el catálogo de turnos escolares (mañana, tarde, noche)."
      columns={columns}
      fields={fields}
      api={shiftsService}
      emptyItem={{ nombre: "", horaInicio: "", horaFin: "", estado: "Activo" }}
      searchPlaceholder="Buscar turno..."
      newLabel="Nuevo turno"
    />
  );
}
