import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gradeCoursesService } from "@/services/grade-courses.service";
import type { ColumnDef, PaginationMeta } from "@/types";
import type { GradeCourse, GradeCoursePayload, AcademicYearOption, GradeOption, CourseOption } from "@/types/grade-course";

export default function GradeCoursePage() {
  const [academicYearOptions, setAcademicYearOptions] = useState<AcademicYearOption[]>([]);
  const [gradeOptions, setGradeOptions] = useState<GradeOption[]>([]);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [items, setItems] = useState<GradeCourse[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ currentPage: 1, limit: 10, total: 0, totalPage: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<GradeCoursePayload>({
    yearId: 0,
    gradeId: 0,
    courseIds: [],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GradeCourse | null>(null);

  // Filters for the list
  const [selectedYearId, setSelectedYearId] = useState<number | undefined>(undefined);
  const [selectedGradeId, setSelectedGradeId] = useState<number | undefined>(undefined);

  // Load all options
  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const [years, grades, courses] = await Promise.all([
        gradeCoursesService.getAcademicYears(),
        gradeCoursesService.getGrades(),
        gradeCoursesService.getCourses(),
      ]);
      setAcademicYearOptions(years);
      setGradeOptions(grades);
      setCourseOptions(courses);
    } catch (err) {
      console.error("Error loading options:", err);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  // Load options on page mount
  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  // Fetch list
  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await gradeCoursesService.list({
        yearId: selectedYearId,
        gradeId: selectedGradeId,
        page,
        limit: 10,
        search,
        sortBy,
        sortDir,
      });
      setItems(result.items);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la información.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedYearId, selectedGradeId, page, search, sortBy, sortDir]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

const columns: ColumnDef<GradeCourse>[] = [
    { header: "Curso", accessor: "courseName", sortable: true },
    { header: "Grado", accessor: "gradeName", sortable: true },
    { header: "Nivel", accessor: "levelName" },
    { header: "Sección", accessor: "section" },
    { header: "Fecha", accessor: "date" },
    { header: "Estado", accessor: "status", render: (item) => <StatusBadge estado={item.status} /> },
  ];

  // Handle course checkbox toggle
  function toggleCourse(courseId: number) {
    setFormValues((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
    }));
  }

  // Handle sort toggle
  function toggleSort(column: string) {
    if (sortBy !== column) {
      setSortBy(column);
      setSortDir("asc");
    } else {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    }
  }

  // Handle form submission
  async function handleSubmit() {
    setFormError(null);
    setIsSaving(true);
    try {
      const result = await gradeCoursesService.assign(formValues);
      if (result.success) {
        setFormOpen(false);
        setFormValues({ yearId: 0, gradeId: 0, courseIds: [] });
        await fetchList();
      }
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      }
    } finally {
      setIsSaving(false);
    }
  }

  // Handle delete
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await gradeCoursesService.remove(deleteTarget.id);
      setDeleteTarget(null);
      await fetchList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el registro.");
    } finally {
      setDeletingId(null);
    }
  }

  // Open assign modal
  function openAssignModal() {
    setFormValues({ yearId: 0, gradeId: 0, courseIds: [] });
    setFormError(null);
    setFormOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Asignación de cursos a grados"
        description="Asigna cursos a los grados académicos según el año lectivo."
        action={
          <LoadingButton onClick={openAssignModal}>
            <Plus className="h-4 w-4" />
            Asignar
          </LoadingButton>
        }
      />

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-end gap-2">
        <Select
          value={selectedYearId?.toString() ?? ""}
          onValueChange={(v) => setSelectedYearId(v ? Number(v) : undefined)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Año académico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los años</SelectItem>
            {academicYearOptions.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedGradeId?.toString() ?? ""}
          onValueChange={(v) => setSelectedGradeId(v ? Number(v) : undefined)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Grado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los grados</SelectItem>
            {gradeOptions.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar asignación..."
        />
        <Button variant="outline" size="icon" aria-label="Buscar" onClick={() => fetchList()}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

<DataTable
        columns={columns}
        data={items}
        onEdit={() => {}} // No edit functionality
        onDelete={(item) => setDeleteTarget(item)}
        emptyMessage={search ? "No se encontraron resultados." : "No hay asignaciones registradas todavía."}
        isLoading={isLoading}
        deletingId={deletingId}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={toggleSort}
        currentPage={page}
        itemsPerPage={pagination.limit}
      />

      <Pagination pagination={pagination} onPageChange={setPage} disabled={isLoading} />

      {/* Assign Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <div className="flex flex-col h-full">
            <DialogHeader>
              <DialogTitle>Asignar cursos a grado</DialogTitle>
              <DialogDescription>
                Selecciona el año académico, el grado y uno o varios cursos para asignar.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="grid gap-4">
              {formError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>Año académico *</Label>
                  <Select 
                    value={formValues.yearId?.toString() ?? ""}
                    onValueChange={(v) => setFormValues((p) => ({ ...p, yearId: Number(v) }))}
                    disabled={optionsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar año" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYearOptions.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.name}
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
                    disabled={optionsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label>Cursos *</Label>
                <div className="flex max-h-60 flex-col gap-2 overflow-y-auto rounded-md border p-3">
                  {optionsLoading ? (
                    <p className="text-xs text-muted-foreground">Cargando cursos...</p>
                  ) : (
                    courseOptions.map((option) => (
                      <label key={option.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={formValues.courseIds.includes(option.id)}
                          onCheckedChange={() => toggleCourse(option.id)}
                        />
                        {option.name}
                      </label>
                    ))
                  )}
                  {!optionsLoading && courseOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">No hay cursos registrados todavía.</p>
                  )}
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)} disabled={isSaving || optionsLoading}>
                Cancelar
              </Button>
              <LoadingButton
                isLoading={isSaving || optionsLoading}
                onClick={handleSubmit}
                disabled={formValues.yearId === 0 || formValues.gradeId === 0 || formValues.courseIds.length === 0}
              >
                <Save className="h-4 w-4" />
                Guardar
              </LoadingButton>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="¿Quitar esta asignación?"
        description="Esta acción eliminará la asignación del curso al grado. ¿Estás seguro?"
        onConfirm={handleDelete}
        isLoading={deletingId === deleteTarget?.id}
      />
    </div>
  );
}