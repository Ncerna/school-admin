import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { teachersService } from "@/services/teachers.service";
import type { ColumnDef, Docente, FieldDef } from "@/types";

const columns: ColumnDef<Docente>[] = [
  { header: "Nombres", accessor: "nombres", sortable: true },
  { header: "Apellidos", accessor: "apellidos", sortable: true },
  { header: "DNI", accessor: "dni" },
  { header: "Especialidad", accessor: "especialidad" },
  { header: "Correo", accessor: "correo" },
  { header: "Estado", accessor: "estado", render: (item) => <StatusBadge estado={item.estado} /> },
];

const fields: FieldDef<Docente>[] = [
  { name: "nombres", label: "Nombres", type: "text", placeholder: "Ej. Carlos", required: true },
  { name: "apellidos", label: "Apellidos", type: "text", placeholder: "Ej. Ramírez Soto", required: true },
  { name: "dni", label: "DNI", type: "text", placeholder: "8 dígitos", required: true },
  { name: "correo", label: "Correo electrónico", type: "email", placeholder: "correo@colegio.edu.pe", required: true },
  { name: "telefono", label: "Teléfono", type: "text", placeholder: "9 dígitos", required: true },
  {
    name: "especialidad",
    label: "Tipo de docente",
    type: "select",
    required: true,
    options: [
      { label: "Nombrado", value: "Nombrado" },
      { label: "Contratado", value: "Contratado" },
      { label: "Auxiliar", value: "Auxiliar" },
    ],
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

export default function DocentesPage() {
  return (
    <ApiCrudPage<Docente>
      title="Docentes"
      description="Administra la información del personal docente del colegio."
      columns={columns}
      fields={fields}
      api={teachersService}
      emptyItem={{
        nombres: "",
        apellidos: "",
        dni: "",
        especialidad: "",
        correo: "",
        telefono: "",
        estado: "Activo",
      }}
      searchPlaceholder="Buscar docente..."
      newLabel="Nuevo docente"
    />
  );
}
