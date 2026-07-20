import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { guardiansService } from "@/services/guardians.service";
import type { ColumnDef, FieldDef, Guardian } from "@/types";

const columns: ColumnDef<Guardian>[] = [
  { header: "Nombres", accessor: "names", sortable: true },
  { header: "Apellidos", accessor: "last_name", sortable: true },
  { header: "DNI", accessor: "dni" },
  { header: "Teléfono", accessor: "phone" },
  { 
    header: "Relación", 
    accessor: "relationship_type",
    render: (item) => {
      const labels: Record<string, string> = {
        Father: "Padre",
        Mother: "Madre",
        Tutor: "Tutor",
        Grandparent: "Abuelo/a",
        Other: "Otro",
        "": "—",
      };
      return labels[item.relationship_type] || item.relationship_type;
    }
  },
  { 
    header: "Estado", 
    accessor: "status",
    render: (item) => <StatusBadge estado={item.status || "Activo"} /> 
  },
];

const fields: FieldDef<Guardian>[] = [
  { name: "names", label: "Nombres", type: "text", placeholder: "Ej. Juan Carlos", required: true },
  { name: "last_name", label: "Apellidos", type: "text", placeholder: "Ej. Pérez García", required: true },
  { name: "dni", label: "DNI", type: "text", placeholder: "Ej. 12345678", required: true },
  { name: "phone", label: "Teléfono", type: "text", placeholder: "Ej. 987654321" },
  {
    name: "relationship_type",
    label: "Relación",
    type: "select",
    required: true,
    options: [
      { label: "Padre", value: "Father" },
      { label: "Madre", value: "Mother" },
      { label: "Tutor", value: "Tutor" },
      { label: "Abuelo/a", value: "Grandparent" },
      { label: "Otro", value: "Other" },
    ],
  },
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

export default function GuardiansPage() {
  return (
    <ApiCrudPage<Guardian>
      title="Apoderados"
      description="Gestiona la información de los apoderados de los estudiantes."
      columns={columns}
      fields={fields}
      api={guardiansService}
      emptyItem={{ names: "", last_name: "", dni: "", phone: "", relationship_type: "", status: "Activo" }}
      searchPlaceholder="Buscar apoderado..."
      newLabel="Nuevo apoderado"
    />
  );
}