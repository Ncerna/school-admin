import React, { useCallback, useState, useEffect, useRef } from "react";
import { Search, Save, X } from "lucide-react";
import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { gradeCoursesService } from "@/services/grade-courses.service";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
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
import { SearchInput } from "@/components/common/SearchInput";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/types/api";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { ColumnDef } from "@/types";
import type { GradeCourse, GradeCoursePayload, GradeCourseFormState, AcademicYearOption, GradeOption, CourseOption } from "@/types/grade-course";

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
  editingItem,
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
  editingItem: GradeCourse | null;
  isSaving: boolean;
  onSave: (values: GradeCoursePayload) => Promise<void>;
  academicYearOptions: { value: string; label: string }[];
  gradeOptions: { value: string; label: string }[];
  courseOptions: { value: string; label: string }[];
  isFormLoading: boolean;
  onSuccess?: () => void;
}) {
  const isEditing = Boolean(editingItem);
  const [formValues, setFormValues] = useState<GradeCoursePayload>(emptyGradeCourse);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when editing
  useEffect(() => {
    if (open && editingItem) {
      loadGradeCourseData(editingItem.yearId, editingItem.gradeId);
    } else if (open && !editingItem) {
      // Reset form for creation
      setFormValues(emptyGradeCourse);
      setError(null);
    }
  }, [open, editingItem]);

  async function loadGradeCourseData(yearId: number, gradeId: number) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await gradeCoursesService.getByYearAndGrade(yearId, gradeId);
      setFormValues({
        yearId: response.yearId,
        gradeId: response.gradeId,
        courseIds: response.courseIds,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar la asignación.");
    } finally {
      setIsLoading(false);
    }
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (open && !editingItem) {
      setFormValues(emptyGradeCourse);
    }
  }, [open, editingItem]);

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
            <DialogTitle>{isEditing ? "Editar asignación" : "Asignar cursos a grado"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica la asignación de cursos al grado."
                : "Selecciona el año académico, el grado y uno o varios cursos para asignar."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="grid gap-4">
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center min-h-[200px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label>Año académico *</Label>
                    <Select
                      value={formValues.yearId?.toString() ?? ""}
                      onValueChange={(v) => setFormValues((p) => ({ ...p, yearId: Number(v) }))}
                      disabled={isFormLoading || isEditing}
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
                      disabled={isFormLoading || isEditing}
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
              </>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving || isFormLoading || isLoading}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <LoadingButton
                isLoading={isSaving || isFormLoading || isLoading}
                onClick={handleSubmit}
                disabled={formValues.yearId === 0 || formValues.gradeId === 0}
              >
                <Save className="h-4 w-4" />
                {isEditing ? "Guardar cambios" : "Guardar"}
              </LoadingButton>
            </DialogFooter>
          </DialogBody>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function GradeCoursePage() {
  // Load options for filters (auto-fetch on mount)
  const { options: filterYearOptions, isLoading: filterYearsLoading } = useOptions<AcademicYearOption>(
    ENDPOINTS.AcademicYears,
    (n) => ({ label: n.name, value: String(n.id) }),
    true // Auto-fetch for filter dropdowns
  );
  const { options: filterGradeOptions, isLoading: filterGradesLoading } = useOptions<GradeOption>(
    ENDPOINTS.grades,
    (a) => ({ label: a.name, value: String(a.id) }),
    true // Auto-fetch for filter dropdowns
  );

  // Load options for the form (lazy loading)
  const { options: formYearOptions, isLoading: formYearsLoading, fetch: fetchYears } = useOptions<AcademicYearOption>(
    ENDPOINTS.AcademicYears,
    (n) => ({ label: n.name, value: String(n.id) })
  );
  const { options: formGradeOptions, isLoading: formGradesLoading, fetch: fetchGrades } = useOptions<GradeOption>(
    ENDPOINTS.grades,
    (a) => ({ label: a.name, value: String(a.id) })
  );
  const { options: courseOptions, isLoading: coursesLoading, fetch: fetchCourses } = useOptions<CourseOption>(
    ENDPOINTS.courses,
    (c) => ({ label: c.name, value: String(c.id) })
  );

  // Callback to load options when the form dialog opens
  const handleFormOpen = useCallback(() => {
    fetchYears();
    fetchGrades();
    fetchCourses();
  }, [fetchYears, fetchGrades, fetchCourses]);

  // Combined loading state for the form
  const isFormLoading = formYearsLoading || formGradesLoading || coursesLoading;

  // State for filters
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");

  // Use ref to track assigned grades (to avoid re-render loop)
  const assignedGradeIdsRef = useRef<Set<string>>(new Set());

  // State for delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<GradeCourse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Ref to store the refetch function
  const refetchFnRef = useRef<(() => void) | null>(null);

  // Memoized callback to update the ref
  const handleDataChange = useCallback((items: GradeCourse[]) => {
    const gradeIds = new Set<string>();
    items.forEach((item) => {
      gradeIds.add(String(item.gradeId));
    });
    assignedGradeIdsRef.current = gradeIds;
  }, []);

  const columns: ColumnDef<GradeCourse>[] = [
    { header: "Año lectivo", accessor: "yearName", sortable: true },
    { header: "Grado", accessor: "gradeName", sortable: true },
    { header: "Nivel", accessor: "levelName" },
    { header: "Sección", accessor: "section" },
    { header: "Cantidad de Cursos", accessor: "coursesCount" },
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
      // Custom save handler that uses updateByYearAndGrade for editing
      const handleSave = async (values: GradeCoursePayload) => {
        if (editingItem) {
          // Use the specific endpoint for updating grade-course assignment
          await gradeCoursesService.updateByYearAndGrade(
            editingItem.yearId,
            editingItem.gradeId,
            values.courseIds
          );
        } else {
          // Use the standard create for new assignments
          await onSave(values);
        }
      };

      // Filter out already assigned grades (except the one being edited)
      const availableGradeOptions = formGradeOptions.filter(option => 
        !assignedGradeIdsRef.current.has(option.value) || (editingItem && String(editingItem.gradeId) === option.value)
      );

      return (
        <GradeCourseFormDialog
          open={open}
          onOpenChange={onOpenChange}
          editingItem={editingItem}
          isSaving={isSaving}
          onSave={handleSave}
          academicYearOptions={formYearOptions}
          gradeOptions={availableGradeOptions}
          courseOptions={courseOptions}
          isFormLoading={isFormLoading}
          onSuccess={() => {
            onOpenChange(false);
            refetch();
          }}
        />
      );
    },
    [formYearOptions, formGradeOptions, courseOptions, isFormLoading]
  );

  // State for delete confirmation message
  const [deleteMessage, setDeleteMessage] = useState<string>("");

  // Handle delete - try first with force=false, show confirmation if needed
  async function handleCustomDelete(item: GradeCourse) {
    try {
      await gradeCoursesService.deleteByYearAndGrade(item.yearId, item.gradeId, false);
      // If successful, refetch
      refetchFnRef.current?.();
    } catch (err) {
      if (err instanceof ApiError && err.errors?.requires_confirmation) {
        setDeleteTarget(item);
        // Use the error message directly (it contains the warning from API)
        setDeleteMessage(err.message || `Este grado tiene cursos asignados. ¿Está seguro que desea eliminar toda la asignación?`);
      } else {
        throw err;
      }
    }
  }

  // Confirm delete with force=true
  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await gradeCoursesService.deleteByYearAndGrade(deleteTarget.yearId, deleteTarget.gradeId, true);
      setDeleteTarget(null);
      setDeleteMessage("");
      // Refetch data after successful deletion
      refetchFnRef.current?.();
    } catch (err) {
      console.error("Error deleting grade course:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
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
        filterComponent={({ setExtraParams, search, setSearch, refetch, searchPlaceholder }) => {
          // Store refetch in ref for use in handleCustomDelete and handleConfirmDelete
          refetchFnRef.current = refetch;
          
          return (
            <div className="mb-4 flex items-center justify-end gap-2">
              <Select value={selectedYearId} onValueChange={(value) => {
                setSelectedYearId(value);
                setExtraParams({ yearId: value ? Number(value) : undefined, gradeId: selectedGradeId ? Number(selectedGradeId) : undefined });
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Año académico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los años</SelectItem>
                  {filterYearOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedGradeId} onValueChange={(value) => {
                setSelectedGradeId(value);
                setExtraParams({ yearId: selectedYearId ? Number(selectedYearId) : undefined, gradeId: value ? Number(value) : undefined });
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los grados</SelectItem>
                  {filterGradeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <SearchInput value={search} onChange={setSearch} placeholder={searchPlaceholder} />
              <Button variant="outline" size="icon" aria-label="Buscar" onClick={refetch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          );
        }}
        onDataChange={handleDataChange}
        renderFormDialog={renderFormDialog}
        onCustomDelete={handleCustomDelete}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="¿Eliminar esta asignación?"
        description={deleteMessage || "Esta acción no se puede deshacer."}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}