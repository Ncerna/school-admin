import { useState, useEffect, useCallback } from "react";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody } from "@/components/ui/dialog";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
import { gradeCoursesService } from "@/services/grade-courses.service";
import { ApiError } from "@/types/api";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { ColumnDef } from "@/types";
import type { AcademicYearOption, GradeOption, GradeCourseListItem } from "@/types/grade-course";

// Column definitions for the table
const columns: ColumnDef<GradeCourseListItem>[] = [
  { header: "Curso", accessor: "couseName", sortable: true },
  { header: "Grado", accessor: "gradeName", sortable: true },
  { header: "Nivel", accessor: "levelName" },
  { header: "Sección", accessor: "secion" },
  { header: "Fecha", accessor: "fecha" },
  { 
    header: "Estado", 
    accessor: "estado",
    render: (item) => (
      <Badge variant={item.estado === "Activo" ? "success" : "secondary"}>
        {item.estado}
      </Badge>
    )
  },
];

export function ReportTab() {
  // Use the centralized useOptions hook for academic years
  const { options: academicYearOptions, isLoading: isLoadingYears } = useOptions<AcademicYearOption>(
    ENDPOINTS.AcademicYears,
    (item) => ({ label: item.name, value: String(item.id) }),
    true
  );

  // Use the centralized useOptions hook for grades
  const { options: gradeOptions, isLoading: isLoadingGrades } = useOptions<GradeOption>(
    ENDPOINTS.grades,
    (item) => ({ label: item.name, value: String(item.id) }),
    true
  );

  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [gradeCourses, setGradeCourses] = useState<GradeCourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GradeCourseListItem | null>(null);
  const [showCoursesDialog, setShowCoursesDialog] = useState(false);
  const [selectedGradeCourse, setSelectedGradeCourse] = useState<GradeCourseListItem | null>(null);

  // Load grade-courses when year and grade are selected
  const loadGradeCourses = useCallback(async () => {
    if (!selectedYearId) {
      setGradeCourses([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const params: { yearId: number; gradeId?: number } = { yearId: Number(selectedYearId) };
      if (selectedGradeId) {
        params.gradeId = Number(selectedGradeId);
      }
      const data = await gradeCoursesService.list(params);
      // Map the response to match the API structure (couseName, secion, fecha, estado)
      const mappedData: GradeCourseListItem[] = data.items.map((item: any) => ({
        id: item.id,
        couseName: item.courseName || item.couseName || "—",
        gradeName: item.gradeName,
        levelName: item.levelName,
        secion: item.section || item.secion || "—",
        fecha: item.date || item.fecha || "—",
        estado: item.status || item.estado || "—",
      }));
      setGradeCourses(mappedData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
      setGradeCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYearId, selectedGradeId]);

  useEffect(() => {
    loadGradeCourses();
  }, [loadGradeCourses]);

  // Handle delete
  const handleDeleteClick = (item: GradeCourseListItem) => {
    setDeleteTarget(item);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await gradeCoursesService.remove(String(deleteTarget.id));
      setGradeCourses(prev => prev.filter(a => a.id !== deleteTarget.id));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  // Handle view courses
  const handleViewCourses = (item: GradeCourseListItem) => {
    setSelectedGradeCourse(item);
    setShowCoursesDialog(true);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Año Académico:</span>
          <Select value={selectedYearId} onValueChange={setSelectedYearId} disabled={isLoadingYears}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los años</SelectItem>
              {academicYearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Grado:</span>
          <Select value={selectedGradeId} onValueChange={setSelectedGradeId} disabled={!selectedYearId || isLoadingGrades}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar grado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los grados</SelectItem>
              {gradeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedYearId ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Seleccione un año académico para ver el reporte de asignaciones.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando reporte...</p>
          </div>
        </div>
      ) : gradeCourses.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            No hay asignaciones registradas para este año y grado.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left text-sm font-medium">#</th>
                {columns.map((col) => (
                  <th key={String(col.accessor)} className="px-4 py-2 text-left text-sm font-medium">
                    {col.header}
                  </th>
                ))}
                <th className="px-4 py-2 text-right text-sm font-medium w-[100px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {gradeCourses.map((item, index) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-2 font-mono text-sm">{index + 1}</td>
                  {columns.map((col) => (
                    <td key={String(col.accessor)} className="px-4 py-2 text-sm">
                      {col.render ? col.render(item) : String(item[col.accessor] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Ver cursos"
                        onClick={() => handleViewCourses(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Quitar"
                        onClick={() => handleDeleteClick(item)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="¿Quitar asignación?"
        description="¿Está seguro que desea quitar la asignación de este curso al grado? Esta acción no se puede deshacer."
        onConfirm={handleDeleteConfirm}
        confirmLabel="Quitar"
      />

      {/* Courses Dialog */}
      <Dialog open={showCoursesDialog} onOpenChange={setShowCoursesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cursos asignados</DialogTitle>
            <DialogDescription>
              Detalles del curso asignado al grado {selectedGradeCourse?.gradeName}.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-2">
              {selectedGradeCourse && (
                <div className="space-y-2">
                  <p><span className="font-medium">Curso:</span> {selectedGradeCourse.couseName}</p>
                  <p><span className="font-medium">Grado:</span> {selectedGradeCourse.gradeName}</p>
                  <p><span className="font-medium">Nivel:</span> {selectedGradeCourse.levelName}</p>
                  <p><span className="font-medium">Sección:</span> {selectedGradeCourse.secion}</p>
                  <p><span className="font-medium">Fecha:</span> {selectedGradeCourse.fecha}</p>
                  <p><span className="font-medium">Estado:</span> {selectedGradeCourse.estado}</p>
                </div>
              )}
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}