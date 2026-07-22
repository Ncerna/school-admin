import { useMemo, useCallback, useState } from "react";
import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { gradesService } from "@/services/grades.service";
import { useOptions } from "@/hooks/useOptions";
import { GradeDeleteDialog } from "./GradeDeleteDialog";
import type { ColumnDef, FieldDef, Grade, Level, Classroom } from "@/types";

// Memoize the empty item to prevent unnecessary re-renders
const emptyGrade: Grade = {
  id: "",
  name: "",
  levelId: "",
  section: "",
  classroomId: "",
  vacancies: 1,
  status: "Activo",
};

export default function GradesPage() {
  // Load options dynamically when the modal opens
  const { options: levelOptions, isLoading: levelsLoading, fetch: fetchLevels } = useOptions<Level>("/levels", (n) => ({
    label: n.name,
    value: n.id,
  }));
  const { options: classroomOptions, isLoading: classroomsLoading, fetch: fetchClassrooms } = useOptions<Classroom>("/classrooms", (a) => ({
    label: a.name,
    value: a.id,
  }));

  // Callback to load options when the form dialog opens
  const handleFormOpen = useCallback(() => {
    fetchLevels();
    fetchClassrooms();
  }, [fetchLevels, fetchClassrooms]);

  // Combined loading state for the form
  const isFormLoading = levelsLoading || classroomsLoading;

  const levelById = useMemo(() => new Map(levelOptions.map((o) => [o.value, o.label])), [levelOptions]);
  const classroomById = useMemo(() => new Map(classroomOptions.map((o) => [o.value, o.label])), [classroomOptions]);

  const columns: ColumnDef<Grade>[] = [
    { header: "Grado", accessor: "name", sortable: true },
    { header: "Sección", accessor: "section" },
    { header: "Nivel", accessor: "levelName" },
    { header: "Aula", accessor: "classroomName" },
    { header: "Vacantes", accessor: "vacancies" },
    { header: "Estado", accessor: "status", render: (item) => <StatusBadge estado={item.status} /> },
  ];

  // Memoize fields to avoid re-creating on each render
  const fields = useMemo<FieldDef<Grade>[]>(() => {
    return [
      { name: "name", label: "Grado", type: "text", placeholder: "Ej. 1°", required: true },
      { 
        name: "levelId", 
        label: "Nivel", 
        type: "select", 
        required: true, 
        options: [{ label: "--- Seleccione ---", value: "" }, ...levelOptions] 
      },
      { name: "section", label: "Sección", type: "text", placeholder: "Ej. A", required: true },
      { 
        name: "classroomId", 
        label: "Aula", 
        type: "select", 
        required: true, 
        options: [{ label: "--- Seleccione ---", value: "" }, ...classroomOptions] 
      },
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
  }, [levelOptions, classroomOptions]);

  // Custom delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<Grade | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const handleDeleteSuccess = useCallback(() => {
    // Force refetch by changing the key
    setRefetchKey(prev => prev + 1);
  }, []);

  // Custom delete handler that opens our custom dialog
  const handleCustomDelete = (item: Grade) => {
    setGradeToDelete(item);
    setDeleteDialogOpen(true);
  };

  return (
    <div key={refetchKey}>
      <ApiCrudPage<Grade>
        title="Grados"
        description="Organiza la estructura académica: grados, secciones y aulas asignadas."
        columns={columns}
        fields={fields}
        api={gradesService}
        emptyItem={emptyGrade}
        searchPlaceholder="Buscar grado..."
        newLabel="Nuevo grado"
        onFormOpen={handleFormOpen}
        isFormLoading={isFormLoading}
        onCustomDelete={handleCustomDelete}
        readOnly={false}
      />

      {/* Custom delete dialog for grades with dependency handling */}
      <GradeDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        grade={gradeToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}