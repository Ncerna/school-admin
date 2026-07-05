import { useMemo } from "react";
import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { gradesService } from "@/services/grades.service";
import { levelsService } from "@/services/levels.service";
import { classroomsService } from "@/services/classrooms.service";
import { useLookupOptions } from "@/hooks/useLookupOptions";
import type { ColumnDef, FieldDef, Grade, Level, Classroom } from "@/types";

export default function GradesPage() {
  const { options: levelOptions } = useLookupOptions<Level>(levelsService, (n) => ({
    label: n.name,
    value: n.id,
  }));
  const { options: classroomOptions } = useLookupOptions<Classroom>(classroomsService, (a) => ({
    label: a.name,
    value: a.id,
  }));

  const levelById = useMemo(() => new Map(levelOptions.map((o) => [o.value, o.label])), [levelOptions]);
  const classroomById = useMemo(() => new Map(classroomOptions.map((o) => [o.value, o.label])), [classroomOptions]);

  const columns: ColumnDef<Grade>[] = [
    { header: "Grado", accessor: "name", sortable: true },
    { header: "Sección", accessor: "section" },
    { header: "Nivel", accessor: "levelId", render: (item) => levelById.get(item.levelId) ?? "—" },
    { header: "Aula", accessor: "classroomId", render: (item) => classroomById.get(item.classroomId) ?? "—" },
    { header: "Vacantes", accessor: "vacancies" },
    { header: "Estado", accessor: "status", render: (item) => <StatusBadge estado={item.status} /> },
  ];

  const fields: FieldDef<Grade>[] = [
    { name: "name", label: "Grado", type: "text", placeholder: "Ej. 1°", required: true },
    { name: "levelId", label: "Nivel", type: "select", required: true, options: levelOptions },
    { name: "section", label: "Sección", type: "text", placeholder: "Ej. A", required: true },
    { name: "classroomId", label: "Aula", type: "select", required: true, options: classroomOptions },
    { name: "vacancies", label: "Vacantes", type: "number", placeholder: "Ej. 30", required: true },
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

  return (
    <ApiCrudPage<Grade>
      title="Grados"
      description="Organiza la estructura académica: grados, secciones y aulas asignadas."
      columns={columns}
      fields={fields}
      api={gradesService}
      emptyItem={{ name: "", levelId: "", section: "", classroomId: "", vacancies: 0, status: "Activo" }}
      searchPlaceholder="Buscar grado..."
      newLabel="Nuevo grado"
    />
  );
}