import React, { useState, useEffect, useCallback, useRef } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
import { teacherAssignmentsService } from "@/services/teacher-assignments.service";
import { ApiError } from "@/types/api";
import { AssignmentTree } from "./AssignmentTree";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { TeacherAssignmentTree, AcademicYearOption, TeacherOption } from "@/types/teacher-assignment";

export function AssignmentTab() {
  // Use the centralized useOptions hook for academic years
  const { options: academicYearOptions } = useOptions<AcademicYearOption>(
    ENDPOINTS.AcademicYears,
    (item) => ({ label: item.name, value: String(item.id) }),
    true
  );

  
  const { options: teacherOptions } = useOptions<TeacherOption>(
    ENDPOINTS.teachers,
    (item) => ({ label: item.name, value: String(item.id) }),
    true
  );

  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [treeData, setTreeData] = useState<TeacherAssignmentTree | null>(null);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const originalTreeDataRef = useRef<TeacherAssignmentTree | null>(null);

  // Load tree data when year and teacher are selected
  const loadTree = useCallback(async () => {
    if (!selectedYearId || !selectedTeacherId) {
      setTreeData(null);
      return;
    }

    setIsLoadingTree(true);
    setError(null);
    try {
      const data = await teacherAssignmentsService.getTree(
        Number(selectedYearId),
        Number(selectedTeacherId)
      );
      setTreeData(data);
      originalTreeDataRef.current = data;
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar los datos.");
    } finally {
      setIsLoadingTree(false);
    }
  }, [selectedYearId, selectedTeacherId]);

  // Handle data change in tree
  const handleTreeDataChange = (data: TeacherAssignmentTree) => {
    setHasChanges(true);
  };

  // Handle cancel - restore original data
  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    }
  };

  // Confirm cancel and restore original data
  const confirmCancel = () => {
    if (originalTreeDataRef.current) {
      setTreeData(originalTreeDataRef.current);
      setHasChanges(false);
    }
    setShowCancelConfirm(false);
  };

  // Handle save
  const handleSave = async () => {
    if (!treeData) return;

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        academicYearId: treeData.academicYearId,
        teacherId: treeData.teacher.id,
        grades: treeData.grades.map((g) => ({
          gradeId: g.gradeId,
          assigned: g.assigned,
          courses: g.courses.map((c) => ({
            gradeCourseId: c.gradeCourseId,
            assigned: c.assigned,
          })),
        })),
      };

      await teacherAssignmentsService.save(payload);
      // Refresh tree after save
      await loadTree();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle year/teacher change with unsaved changes check
  const handleYearChange = (value: string) => {
    if (hasChanges && !confirm("¿Descartar los cambios no guardados?")) {
      return;
    }
    setSelectedYearId(value);
    setSelectedTeacherId("");
    setTreeData(null);
    setHasChanges(false);
  };

  const handleTeacherChange = (value: string) => {
    if (hasChanges && !confirm("¿Descartar los cambios no guardados?")) {
      return;
    }
    setSelectedTeacherId(value);
  };

  // Load tree when both selections are made
  useEffect(() => {
    loadTree();
  }, [loadTree]);

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
          <Select value={selectedYearId} onValueChange={handleYearChange}>
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
          <span className="text-sm font-medium">Docente:</span>
          <Select value={selectedTeacherId} onValueChange={handleTeacherChange} disabled={!selectedYearId}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Seleccionar docente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los docentes</SelectItem>
              {teacherOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedYearId || !selectedTeacherId ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Seleccione un año académico y un docente para ver las asignaciones.
          </p>
        </div>
      ) : isLoadingTree ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando árbol de asignaciones...</p>
          </div>
        </div>
      ) : (
        <AssignmentTree
          data={treeData}
          onDataChange={handleTreeDataChange}
          hasChanges={hasChanges}
        />
      )}

      {selectedYearId && selectedTeacherId && (
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving || !hasChanges}>
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <LoadingButton
            isLoading={isSaving}
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </LoadingButton>
        </div>
      )}

      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="¿Descartar cambios?"
        description="¿Está seguro que desea descartar los cambios no guardados? Esta acción no se puede deshacer."
        onConfirm={confirmCancel}
      />
    </div>
  );
}