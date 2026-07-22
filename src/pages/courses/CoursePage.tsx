import { useMemo, useCallback, useState } from "react";
import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { coursesService } from "@/services/courses.service";
import { CourseDeleteDialog } from "./CourseDeleteDialog";
import type { ColumnDef, Course, FieldDef } from "@/types";

const columns: ColumnDef<Course>[] = [
  { header: "Curso", accessor: "name", sortable: true },
  { header: "Código", accessor: "code", render: (item) => item.code || "—" },
  { header: "Estado", accessor: "status", render: (item) => <StatusBadge estado={item.status} /> },
];

const fields: FieldDef<Course>[] = [
  { name: "name", label: "Nombre del curso", type: "text", placeholder: "Ej. Matemática", required: true },
  { name: "code", label: "Código (opcional)", type: "text", placeholder: "Ej. MAT-01" },
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

export default function CoursesPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const handleDeleteSuccess = useCallback(() => {
    setRefetchKey(prev => prev + 1);
  }, []);

  const handleCustomDelete = (item: Course) => {
    setCourseToDelete(item);
    setDeleteDialogOpen(true);
  };

  return (
    <div key={refetchKey}>
      <ApiCrudPage<Course>
        title="Cursos"
        description="Mantén actualizado el catálogo institucional de cursos."
        columns={columns}
        fields={fields}
        api={coursesService}
        emptyItem={{ name: "", code: "", status: "Activo" }}
        searchPlaceholder="Buscar curso..."
        newLabel="Nuevo curso"
        onCustomDelete={handleCustomDelete}
        readOnly={false}
      />

      <CourseDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        course={courseToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}