import React, { useCallback, useState, useEffect } from "react";
import { Plus, Search, Save } from "lucide-react";
import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { gradeCoursesService } from "@/services/grade-courses.service";
import { useOptions } from "@/hooks/useOptions";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ColumnDef } from "@/types";
import type { GradeCourse, GradeCoursePayload, AcademicYearOption, GradeOption, CourseOption } from "@/types/grade-course";

// Memoize the empty item to prevent unnecessary re-renders
const emptyGradeCourse: GradeCoursePayload = {
  yearId: 0,
  gradeId: 0,
  courseIds: [],
};

// Custom form dialog component
function GradeCourseFormDialog({
  open,
  onOpenChange,
  isSaving,
  onSave,
  academicYearOptions,
  gradeOptions,
  courseOptions,
  isFormLoading,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onSave: (values: GradeCoursePayload) => Promise<void>;
  academicYearOptions: { value: string; label: string }[];
  gradeOptions: { value: string; label: string }[];
  courseOptions: { value: string; label: string }[];
  isFormLoading: boolean;
  onSuccess?: () => void;
}) {
  const [formValues, setFormValues] = useState<GradeCoursePayload>(emptyGradeCourse);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormValues(emptyGradeCourse);
    }
  }, [open]);

  function toggleCourse(courseId: number) {
    setFormValues((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
    }));
  }

  async function handleSubmit() {
    try {
      await onSave(formValues);
      onSuccess?.();
    } catch (err) {
      // Error is handled by the parent component
      console.error("Error saving grade course:", err);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex flex-col h-full">
          <DialogHeader>
            <DialogTitle>Asignar cursos a grado</DialogTitle>
            <DialogDescription>
              Selecciona el año académico, el grado y uno o varios cursos para asignar.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Año académico *</Label>
                <Select
                  value={formValues.yearId?.toString() ?? ""}
                  onValueChange={(v) => setFormValues((p) => ({ ...p, yearId: Number(v) }))}
                  disabled={isFormLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYearOptions.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label>Grado *</Label>
                <Select
                  value={formValues.gradeId?.toString() ?? ""}
                  onValueChange={(v) => setFormValues((p) => ({ ...p, gradeId: Number(v) }))}
                  disabled={isFormLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Cursos *</Label>
              <div className="flex max-h-60 flex-col gap-2 overflow-y-auto rounded-md border p-3">
                {isFormLoading ? (
                  <p className="text-xs text-muted-foreground">Cargando cursos...</p>
                ) : (
                  courseOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={formValues.courseIds.includes(Number(option.value))}
                        onCheckedChange={() => toggleCourse(Number(option.value))}
                      />
                      {option.label}
                    </label>
                  ))
                )}
                {!isFormLoading && courseOptions.length === 0 && (
                  <p className="text-xs text-muted-foreground">No hay cursos registrados todavía.</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving || isFormLoading}>
                Cancelar
              </Button>
              <LoadingButton
                isLoading={isSaving || isFormLoading}
                onClick={handleSubmit}
                disabled={formValues.yearId === 0 || formValues.gradeId === 0 || formValues.courseIds.length === 0}
              >
                <Save className="h-4 w-4" />
                Guardar
              </LoadingButton>
            </DialogFooter>
          </DialogBody>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function GradeCoursePage() {
  // Load options for the form (academic years, grades, courses)
  const { options: academicYearOptions, isLoading: yearsLoading, fetch: fetchYears } = useOptions<AcademicYearOption>("/years", (n) => ({
    label: n.name,
    value: String(n.id),
  }));
  const { options: gradeOptions, isLoading: gradesLoading, fetch: fetchGrades } = useOptions<GradeOption>("/grades", (a) => ({
    label: a.name,
    value: String(a.id),
  }));
  const { options: courseOptions, isLoading: coursesLoading, fetch: fetchCourses } = useOptions<CourseOption>("/courses", (c) => ({
    label: c.name,
    value: String(c.id),
  }));

  // Callback to load options when the form dialog opens
  const handleFormOpen = useCallback(() => {
    fetchYears();
    fetchGrades();
    fetchCourses();
  }, [fetchYears, fetchGrades, fetchCourses]);

  // Combined loading state for the form
  const isFormLoading = yearsLoading || gradesLoading || coursesLoading;

  const columns: ColumnDef<GradeCourse>[] = [
    { header: "Curso", accessor: "courseName", sortable: true },
    { header: "Grado", accessor: "gradeName", sortable: true },
    { header: "Nivel", accessor: "levelName" },
    { header: "Sección", accessor: "section" },
    { header: "Fecha", accessor: "date" },
    { header: "Estado", accessor: "status", render: (item) => <StatusBadge estado={item.status} /> },
  ];

  // Custom form dialog for grade-course assignment
  const renderFormDialog = useCallback(
    ({
      open,
      onOpenChange,
      editingItem,
      isSaving,
      onSave,
      refetch,
    }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      editingItem: GradeCourse | null;
      isSaving: boolean;
      onSave: (values: GradeCoursePayload) => Promise<void>;
      refetch: () => void;
    }) => {
      return (
        <GradeCourseFormDialog
          open={open}
          onOpenChange={onOpenChange}
          isSaving={isSaving}
          onSave={onSave}
          academicYearOptions={academicYearOptions}
          gradeOptions={gradeOptions}
          courseOptions={courseOptions}
          isFormLoading={isFormLoading}
          onSuccess={() => {
            onOpenChange(false);
            refetch();
          }}
        />
      );
    },
    [academicYearOptions, gradeOptions, courseOptions, isFormLoading]
  );

  return (
    <ApiCrudPage<GradeCourse, GradeCoursePayload>
      title="Asignación de cursos a grados"
      description="Asigna cursos a los grados académicos según el año lectivo."
      columns={columns}
      fields={[]}
      api={gradeCoursesService}
      emptyItem={emptyGradeCourse}
      searchPlaceholder="Buscar asignación..."
      newLabel="Asignar"
      onFormOpen={handleFormOpen}
      isFormLoading={isFormLoading}
      renderFormDialog={renderFormDialog}
    />
  );
}