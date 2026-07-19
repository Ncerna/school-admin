import { useState, useEffect, useCallback, useRef } from "react";
import { Save, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
import { gradeCoursesService } from "@/services/grade-courses.service";
import { ApiError } from "@/types/api";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { AcademicYearOption, GradeOption, CourseOption, GradeCourse } from "@/types/grade-course";

export function AssignmentTab() {
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

  // Use the centralized useOptions hook for courses
  const { options: courseOptions, isLoading: isLoadingCourses } = useOptions<CourseOption>(
    ENDPOINTS.courses,
    (item) => ({ label: item.name, value: String(item.id) }),
    true
  );

  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [assignedCourseIds, setAssignedCourseIds] = useState<number[]>([]);
  const [originalCourseIds, setOriginalCourseIds] = useState<number[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showChangeConfirm, setShowChangeConfirm] = useState(false);
  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const [pendingType, setPendingType] = useState<"year" | "grade" | null>(null);

  // Load assignments when year and grade are selected
  const loadAssignments = useCallback(async () => {
    if (!selectedYearId || !selectedGradeId) {
      setAssignedCourseIds([]);
      setOriginalCourseIds([]);
      return;
    }

    setIsLoadingAssignments(true);
    setError(null);
    try {
      const data = await gradeCoursesService.getByYearAndGrade(
        Number(selectedYearId),
        Number(selectedGradeId)
      );
      setAssignedCourseIds(data.courseIds);
      setOriginalCourseIds(data.courseIds);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
      setAssignedCourseIds([]);
      setOriginalCourseIds([]);
    } finally {
      setIsLoadingAssignments(false);
    }
  }, [selectedYearId, selectedGradeId]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Check if there are unsaved changes
  const hasChanges = assignedCourseIds.length > 0 && 
    JSON.stringify(assignedCourseIds.sort()) !== JSON.stringify(originalCourseIds.sort());

  // Handle year/grade change with unsaved changes check
  const handleYearChange = (value: string) => {
    if (hasChanges) {
      setPendingValue(value);
      setPendingType("year");
      setShowChangeConfirm(true);
      return;
    }
    setSelectedYearId(value);
    setSelectedGradeId("");
    setAssignedCourseIds([]);
    setOriginalCourseIds([]);
  };

  const handleGradeChange = (value: string) => {
    if (hasChanges) {
      setPendingValue(value);
      setPendingType("grade");
      setShowChangeConfirm(true);
      return;
    }
    setSelectedGradeId(value);
  };

  // Confirm change and proceed
  const confirmChange = () => {
    if (pendingType === "year" && pendingValue !== null) {
      setSelectedYearId(pendingValue);
      setSelectedGradeId("");
      setAssignedCourseIds([]);
      setOriginalCourseIds([]);
    } else if (pendingType === "grade" && pendingValue !== null) {
      setSelectedGradeId(pendingValue);
    }
    setShowChangeConfirm(false);
    setPendingValue(null);
    setPendingType(null);
  };

  // Handle save
  const handleSave = async () => {
    if (!selectedYearId || !selectedGradeId) return;

    setIsSaving(true);
    setError(null);
    try {
      await gradeCoursesService.updateByYearAndGrade(
        Number(selectedYearId),
        Number(selectedGradeId),
        assignedCourseIds
      );
      setOriginalCourseIds(assignedCourseIds);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel - restore original data
  const handleCancel = () => {
    setAssignedCourseIds(originalCourseIds);
  };

  // Handle course selection
  const handleCourseToggle = (courseId: number) => {
    setAssignedCourseIds(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  // Handle assign button click
  const handleAssignClick = () => {
    setShowAssignDialog(true);
  };

  // Handle dialog close - restore original state if needed
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Restore original state when dialog is closed
      setAssignedCourseIds(originalCourseIds);
    }
    setShowAssignDialog(open);
  };

  // Handle save from dialog
  const handleDialogSave = async () => {
    if (!selectedYearId || !selectedGradeId) return;

    setIsSaving(true);
    setError(null);
    try {
      await gradeCoursesService.create({
        yearId: Number(selectedYearId),
        gradeId: Number(selectedGradeId),
        courseIds: assignedCourseIds,
      });
      setOriginalCourseIds(assignedCourseIds);
      setShowAssignDialog(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    } finally {
      setIsSaving(false);
    }
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
          <Select value={selectedYearId} onValueChange={handleYearChange} disabled={isLoadingYears}>
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
          <Select value={selectedGradeId} onValueChange={handleGradeChange} disabled={!selectedYearId || isLoadingGrades}>
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

        <LoadingButton
          onClick={handleAssignClick}
          disabled={!selectedYearId || !selectedGradeId}
        >
          <Plus className="h-4 w-4" />
          Asignar cursos
        </LoadingButton>
      </div>

      {!selectedYearId || !selectedGradeId ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Seleccione un año académico y un grado para ver las asignaciones.
          </p>
        </div>
      ) : isLoadingAssignments ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando asignaciones...</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Cursos asignados
          </h3>
          
          {assignedCourseIds.length === 0 ? (
            <p className="text-sm text-muted-foreground mb-4">
              Aún no hay cursos asignados a este grado. Haz clic en "Asignar cursos" para agregar cursos.
            </p>
          ) : (
            <div className="space-y-2">
              {courseOptions
                .filter(opt => assignedCourseIds.includes(Number(opt.value)))
                .map((option) => (
                  <div key={option.value} className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                    <span className="text-sm">{option.label}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Asignar cursos al grado</DialogTitle>
            <DialogDescription>
              Selecciona los cursos que deseas asignar al grado seleccionado.
            </DialogDescription>
          </DialogHeader>
          
          <DialogBody>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Año Académico:</span>
                <span className="text-sm">{academicYearOptions.find(o => o.value === selectedYearId)?.label || "Seleccionado"}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Grado:</span>
                <span className="text-sm">{gradeOptions.find(o => o.value === selectedGradeId)?.label || "Seleccionado"}</span>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Cursos disponibles:</span>
                <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                  {isLoadingCourses ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Cargando cursos...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {courseOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`course-${option.value}`}
                            checked={assignedCourseIds.includes(Number(option.value))}
                            onCheckedChange={() => handleCourseToggle(Number(option.value))}
                          />
                          <label
                            htmlFor={`course-${option.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogOpenChange(false)} disabled={isSaving}>
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <LoadingButton isLoading={isSaving} onClick={handleDialogSave}>
              <Save className="h-4 w-4" />
              Guardar
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showChangeConfirm}
        onOpenChange={setShowChangeConfirm}
        title="¿Descartar cambios?"
        description="¿Está seguro que desea descartar los cambios no guardados y cambiar la selección?"
        onConfirm={confirmChange}
        confirmLabel="Cambiar"
      />
    </div>
  );
}