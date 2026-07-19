import { useState, useEffect, useCallback, useRef } from "react";
import { Save, X, Plus, Trash2, GripVertical } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
import { evaluationCriteriaService } from "@/services/evaluation-criteria.service";
import { ApiError } from "@/types/api";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import type { 
  EvaluationCriterion, 
  EvaluationCriteriaResponse,
  AcademicYearOption, 
  EvaluationPeriodOption,
  GradeOption,
  GradeCourseOption 
} from "@/types/evaluation-criteria";

export function DetailTab() {
  const { showToast } = useToast();
  
  const { options: academicYearOptions } = useOptions<AcademicYearOption>(
    ENDPOINTS.AcademicYears,
    (item) => ({ label: item.name, value: String(item.id) }),
    true
  );

  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  
  const [evaluationPeriods, setEvaluationPeriods] = useState<EvaluationPeriodOption[]>([]);
  const [grades, setGrades] = useState<GradeOption[]>([]);
  const [courses, setCourses] = useState<GradeCourseOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>([]);
  const [originalCriteria, setOriginalCriteria] = useState<EvaluationCriterion[]>([]);
  
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const hasChangesRef = useRef(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showChangeConfirm, setShowChangeConfirm] = useState(false);
  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const [pendingType, setPendingType] = useState<"year" | "period" | "grade" | "course" | null>(null);

  // Load evaluation periods when year is selected
  useEffect(() => {
    if (selectedYearId) {
      evaluationCriteriaService.getEvaluationPeriods(Number(selectedYearId))
        .then(setEvaluationPeriods)
        .catch((err) => setError(err instanceof ApiError ? err.message : null));
    } else {
      setEvaluationPeriods([]);
      setSelectedPeriodId("");
    }
  }, [selectedYearId]);

  // Load grades when year is selected
  useEffect(() => {
    if (selectedYearId) {
      evaluationCriteriaService.getGrades(Number(selectedYearId))
        .then(setGrades)
        .catch((err) => setError(err instanceof ApiError ? err.message : null));
    } else {
      setGrades([]);
      setSelectedGradeId("");
    }
  }, [selectedYearId]);

  // Load courses when grade is selected
  useEffect(() => {
    if (selectedYearId && selectedGradeId) {
      evaluationCriteriaService.getGradeCourses(Number(selectedYearId), Number(selectedGradeId))
        .then(setCourses)
        .catch(() => setCourses([]));
    } else {
      setCourses([]);
      setSelectedCourseId("");
    }
  }, [selectedGradeId]);

  // Load criteria when all 4 filters are selected
  useEffect(() => {
    if (selectedYearId && selectedPeriodId && selectedGradeId && selectedCourseId) {
      loadCriteria(Number(selectedPeriodId), Number(selectedCourseId));
    } else {
      setCriteria([]);
      setOriginalCriteria([]);
      hasChangesRef.current = false;
    }
  }, [selectedPeriodId, selectedCourseId]);

  const loadCriteria = async (evaluationPeriodId: number, gradeCourseId: number) => {
    setIsLoadingCriteria(true);
    setError(null);
    try {
      const response = await evaluationCriteriaService.getCriteria(evaluationPeriodId, gradeCourseId);
      const criteriaList = response?.criteria ?? [];
      setCriteria(criteriaList);
      setOriginalCriteria(criteriaList);
      hasChangesRef.current = false;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar criterios");
    } finally {
      setIsLoadingCriteria(false);
    }
  };

  const hasDuplicateNames = (criteriaList: EvaluationCriterion[]) => 
    new Set(criteriaList.map(c => c.name.toLowerCase().trim())).size !== criteriaList.length;

  const hasInvalidData = (criteriaList: EvaluationCriterion[]) => 
    criteriaList.some(c => !c.name.trim() || c.maxScore <= 0);

  const handleFilterChange = useCallback((type: "year" | "period" | "grade" | "course", value: string) => {
    if (hasChangesRef.current) {
      setPendingValue(value);
      setPendingType(type);
      setShowChangeConfirm(true);
      return;
    }
    if (type === "year") {
      setSelectedYearId(value);
      setSelectedPeriodId("");
      setSelectedGradeId("");
      setSelectedCourseId("");
    } else if (type === "period") {
      setSelectedPeriodId(value);
      setSelectedGradeId("");
      setSelectedCourseId("");
    } else if (type === "grade") {
      setSelectedGradeId(value);
      setSelectedCourseId("");
    } else {
      setSelectedCourseId(value);
    }
    setCriteria([]);
    setOriginalCriteria([]);
    hasChangesRef.current = false;
  }, []);

  const confirmChange = () => {
    if (pendingType && pendingValue !== null) {
      handleFilterChange(pendingType, pendingValue);
    }
    setShowChangeConfirm(false);
    setPendingValue(null);
    setPendingType(null);
  };

  const handleCancel = () => {
    if (hasChangesRef.current) {
      setShowCancelConfirm(true);
    }
  };

  const confirmCancel = () => {
    setCriteria(originalCriteria);
    hasChangesRef.current = false;
    setShowCancelConfirm(false);
  };

  const handleSave = async () => {
    setValidationError(null);
    setError(null);
    
    if (!selectedYearId || !selectedPeriodId || !selectedGradeId || !selectedCourseId) {
      setValidationError("Debe seleccionar Año Académico, Período, Grado y Curso antes de guardar.");
      return;
    }
    
    if (criteria.length === 0) {
      setValidationError("Debe agregar al menos un criterio de evaluación.");
      return;
    }
    
    if (hasDuplicateNames(criteria)) {
      setValidationError("No pueden existir criterios con el mismo nombre.");
      return;
    }
    
    if (hasInvalidData(criteria)) {
      setValidationError("Todos los criterios deben tener nombre y puntaje máximo mayor a 0.");
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await evaluationCriteriaService.saveCriteria({
        evaluationPeriodId: Number(selectedPeriodId),
        gradeCourseId: Number(selectedCourseId),
        criteria: criteria.map((c, i) => ({ ...c, order: i + 1 })),
      });
      const savedCriteria = response?.criteria ?? [];
      setCriteria(savedCriteria);
      setOriginalCriteria(savedCriteria);
      hasChangesRef.current = false;
      showToast("Criterios guardados correctamente.", "success");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error al guardar";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCriterion = () => {
    setCriteria([...criteria, { id: null, name: "", maxScore: 0, order: criteria.length + 1 }]);
    hasChangesRef.current = true;
  };

  const handleUpdateCriterion = (index: number, field: "name" | "maxScore", value: string | number) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
    hasChangesRef.current = true;
  };

  const handleDeleteCriterion = (index: number) => {
    const updated = criteria.filter((_, i) => i !== index);
    updated.forEach((c, i) => { c.order = i + 1; });
    setCriteria(updated);
    hasChangesRef.current = true;
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...criteria];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    updated.forEach((c, i) => { c.order = i + 1; });
    setCriteria(updated);
    hasChangesRef.current = true;
  };

  const handleMoveDown = (index: number) => {
    if (index === criteria.length - 1) return;
    const updated = [...criteria];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((c, i) => { c.order = i + 1; });
    setCriteria(updated);
    hasChangesRef.current = true;
  };

  const allFiltersSelected = selectedYearId && selectedPeriodId && selectedGradeId && selectedCourseId;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <Label htmlFor="academic-year">Año Académico:</Label>
          <Select value={selectedYearId} onValueChange={(v) => handleFilterChange("year", v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar año" />
            </SelectTrigger>
            <SelectContent>
              {academicYearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="evaluation-period">Período de Evaluación:</Label>
          <Select value={selectedPeriodId} onValueChange={(v) => handleFilterChange("period", v)} disabled={!selectedYearId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              {evaluationPeriods.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Grado:</Label>
          <Select value={selectedGradeId} onValueChange={(v) => handleFilterChange("grade", v)} disabled={!selectedYearId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar grado" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="course">Curso</Label>
          <Select value={selectedCourseId} onValueChange={(v) => handleFilterChange("course", v)} disabled={!selectedGradeId}>
            <SelectTrigger id="course" className="w-[180px]">
              <SelectValue placeholder="Seleccionar curso" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((option) => (
                <SelectItem key={option.gradeCourseId} value={String(option.gradeCourseId)}>
                  {option.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {validationError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {validationError}
        </div>
      )}

      {!allFiltersSelected ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Complete la selección de Año Académico, Período, Grado y Curso para configurar los criterios.
          </p>
        </div>
      ) : isLoadingCriteria ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando criterios...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Criterios de evaluación
            </h3>
            
            {criteria.length === 0 ? (
              <p className="text-sm text-muted-foreground mb-4">
                Aún no hay criterios configurados para este curso en este período. Agrega el primero.
              </p>
            ) : (
              <div className="space-y-2">
                {criteria.map((criterion, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Input
                      value={criterion.name}
                      onChange={(e) => handleUpdateCriterion(index, "name", e.target.value)}
                      placeholder="Nombre del criterio"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={criterion.maxScore || ""}
                      onChange={(e) => handleUpdateCriterion(index, "maxScore", Number(e.target.value))}
                      placeholder="Puntaje máximo"
                      className="w-32"
                      min={1}
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === criteria.length - 1}
                        className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                      >
                        ↓
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCriterion(index)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCriterion}
              className="mt-3"
            >
              <Plus className="h-4 w-4" />
              Agregar criterio
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving || !hasChangesRef.current}>
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <LoadingButton
              isLoading={isSaving}
              onClick={handleSave}
              disabled={!allFiltersSelected || !hasChangesRef.current || criteria.length === 0 || hasInvalidData(criteria) || hasDuplicateNames(criteria)}
            >
              <Save className="h-4 w-4" />
              Guardar
            </LoadingButton>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="¿Descartar cambios?"
        description="¿Está seguro que desea descartar los cambios no guardados? Esta acción no se puede deshacer."
        onConfirm={confirmCancel}
        confirmLabel="Descartar"
      />

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