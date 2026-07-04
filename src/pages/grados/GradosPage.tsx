import { useMemo } from "react";
import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { gradesService } from "@/services/grades.service";
import { levelsService } from "@/services/levels.service";
import { classroomsService } from "@/services/classrooms.service";
import { useLookupOptions } from "@/hooks/useLookupOptions";
import type { ColumnDef, FieldDef, Grado, Nivel, Aula } from "@/types";

export default function GradosPage() {
  const { options: nivelOptions } = useLookupOptions<Nivel>(levelsService, (n) => ({
    label: n.nombre,
    value: n.id,
  }));
  const { options: aulaOptions } = useLookupOptions<Aula>(classroomsService, (a) => ({
    label: a.nombre,
    value: a.id,
  }));

  const nivelById = useMemo(() => new Map(nivelOptions.map((o) => [o.value, o.label])), [nivelOptions]);
  const aulaById = useMemo(() => new Map(aulaOptions.map((o) => [o.value, o.label])), [aulaOptions]);

  const columns: ColumnDef<Grado>[] = [
    { header: "Grado", accessor: "nombre", sortable: true },
    { header: "Sección", accessor: "seccion" },
    { header: "Nivel", accessor: "nivelId", render: (item) => nivelById.get(item.nivelId) ?? "—" },
    { header: "Aula", accessor: "aulaId", render: (item) => aulaById.get(item.aulaId) ?? "—" },
    { header: "Vacantes", accessor: "vacantes" },
    { header: "Estado", accessor: "estado", render: (item) => <StatusBadge estado={item.estado} /> },
  ];

  const fields: FieldDef<Grado>[] = [
    { name: "nombre", label: "Grado", type: "text", placeholder: "Ej. 1°", required: true },
    { name: "nivelId", label: "Nivel", type: "select", required: true, options: nivelOptions },
    { name: "seccion", label: "Sección", type: "text", placeholder: "Ej. A", required: true },
    { name: "aulaId", label: "Aula", type: "select", required: true, options: aulaOptions },
    { name: "vacantes", label: "Vacantes", type: "number", placeholder: "Ej. 30", required: true },
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

  return (
    <ApiCrudPage<Grado>
      title="Grados"
      description="Organiza la estructura académica: grados, secciones y aulas asignadas."
      columns={columns}
      fields={fields}
      api={gradesService}
      emptyItem={{ nombre: "", nivelId: "", seccion: "", aulaId: "", vacantes: 0, estado: "Activo" }}
      searchPlaceholder="Buscar grado..."
      newLabel="Nuevo grado"
    />
  );
}
