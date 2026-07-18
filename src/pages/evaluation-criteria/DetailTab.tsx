import { useState, useEffect, useCallback, useRef } from "react";
import { Save, X, Plus, Trash2, GripVertical } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { evaluationCriteriaService } from "@/services/evaluation-criteria.service";
import { ApiError } from "@/types/api";
import type { 
  EvaluationCriterion, 
  EvaluationCriteriaResponse,
  AcademicYearOption, 
  EvaluationPeriodOption,
  GradeOption,
  GradeCourseOption 
} from "@/types/evaluation-criteria";

export function DetailTab() {
  // Filter state
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [evaluationPeriods, setEvaluationPeriods] = useState<EvaluationPeriodOption[]>([]);
  const [grades, setGrades] = useState<GradeOption[]>([]);
  const [courses, setCourses] = useState<GradeCourseOption[]>([]);
  
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  
  // Criteria state
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>([]);
  const [originalCriteria, setOriginalCriteria] = useState<EvaluationCriterion[]>([]);
  
  // Loading states
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Validation state
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Ref to track if we have unsaved changes
  const hasChangesRef = useRef(false);

  // Load academic years on mount
  useEffect(() => {
    loadAcademicYears();
  }, []);

  async function loadAcademicYears() {
    try {
      const years = await evaluationCriteriaService.getAcademicYears();
      setAcademicYears(years);
    } catch (err) {
      console.error("Error loading academic years:", err);
    }
  }

  // Load evaluation periods when year is selected
  useEffect(() => {
    if (selectedYearId) {
      loadEvaluationPeriods(Number(selectedYearId));
    } else {
      setEvaluationPeriods([]);
      setSelectedPeriodId("");
    }
  }, [selectedYearId]);

  async function loadEvaluationPeriods(yearId: number) {
    try {
      const periods = await evaluationCriteriaService.getEvaluationPeriods(yearId);
      setEvaluationPeriods(periods);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
      setEvaluationPeriods([]);
    }
  }

  // Load grades when year is selected
  useEffect(() => {
    if (selectedYearId) {
      loadGrades(Number(selectedYearId));
    } else {
      setGrades([]);
      setSelectedGradeId("");
    }
  }, [selectedYearId]);

  async function loadGrades(yearId: number) {
    try {
      const gradeList = await evaluationCriteriaService.getGrades(yearId);
      setGrades(gradeList);
    } catch (err) {
      console.error("Error loading grades:", err);
      setGrades([]);
    }
  }

  // Load courses when grade is selected
  useEffect(() => {
    if (selectedYearId && selectedGradeId) {
      loadCourses(Number(selectedYearId), Number(selectedGradeId));
    } else {
      setCourses([]);
      setSelectedCourseId("");
    }
  }, [selectedGradeId]);

  async function loadCourses(yearId: number, gradeId: number) {
    try {
      const courseList = await evaluationCriteriaService.getGradeCourses(yearId, gradeId);
      setCourses(courseList);
    } catch (err) {
      console.error("Error loading courses:", err);
      setCourses([]);
    }
  }

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

  async function loadCriteria(evaluationPeriodId: number, gradeCourseId: number) {
    setIsLoadingCriteria(true);
    setError(null);
    try {
      const response = await evaluationCriteriaService.getCriteria(evaluationPeriodId, gradeCourseId);
      setCriteria(response.criteria);
      setOriginalCriteria(response.criteria);
      hasChangesRef.current = false;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
      setCriteria([]);
      setOriginalCriteria([]);
    } finally {
      setIsLoadingCriteria(false);
    }
  }

  // Check for duplicate names
  function hasDuplicateNames(criteriaList: EvaluationCriterion[]): boolean {
    const names = criteriaList.map(c => c.name.toLowerCase().trim());
    return new Set(names).size !== names.length;
  }

  // Check if any criterion has invalid data
  function hasInvalidData(criteriaList: EvaluationCriterion[]): boolean {
    return criteriaList.some(c => !c.name.trim() || c.maxScore <= 0);
  }

  // Handle filter changes with unsaved changes check
  const handleYearChange = (value: string) => {
    if (hasChangesRef.current && !confirm("¿Descartar los cambios no guardados?")) {
      return;
    }
    setSelectedYearId(value);
    setSelectedPeriodId("");
    setSelectedGradeId("");
    setSelectedCourseId("");
    setCriteria([]);
    setOriginalCriteria([]);
    hasChangesRef.current = false;
  };

  const handlePeriodChange = (value: string) => {
    if (hasChangesRef.current && !confirm("¿Descartar los cambios no guardados?")) {
      return;
    }
    setSelectedPeriodId(value);
    setSelectedGradeId("");
    setSelectedCourseId("");
    setCriteria([]);
    setOriginalCriteria([]);
    hasChangesRef.current = false;
  };

  const handleGradeChange = (value: string) => {
    if (hasChangesRef.current && !confirm("¿Descartar los cambios no guardados?")) {
      return;
    }
    setSelectedGradeId(value);
    setSelectedCourseId("");
    setCriteria([]);
    setOriginalCriteria([]);
    hasChangesRef.current = false;
  };

  const handleCourseChange = (value: string) => {
    if (hasChangesRef.current && !confirm("¿Descartar los cambios no guardados?")) {
      return;
    }
    setSelectedCourseId(value);
  };

  // Add a new criterion
  const handleAddCriterion = () => {
    const newCriterion: EvaluationCriterion = {
      id: null,
      name: "",
      maxScore: 0,
      order: criteria.length + 1,
    };
    setCriteria([...criteria, newCriterion]);
    hasChangesRef.current = true;
  };

  // Update a criterion
  const handleUpdateCriterion = (index: number, field: "name" | "maxScore", value: string | number) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
    hasChangesRef.current = true;
  };

  // Delete a criterion
  const handleDeleteCriterion = (index: number) => {
    const updated = criteria.filter((_, i) => i !== index);
    // Reorder remaining items
    updated.forEach((c, i) => {
      c.order = i + 1;
    });
    setCriteria(updated);
    hasChangesRef.current = true;
  };

  // Move criterion up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...criteria];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    updated.forEach((c, i) => {
      c.order = i + 1;
    });
    setCriteria(updated);
    hasChangesRef.current = true;
  };

  // Move criterion down
  const handleMoveDown = (index: number) => {
    if (index === criteria.length - 1) return;
    const updated = [...criteria];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((c, i) => {
      c.order = i + 1;
    });
    setCriteria(updated);
    hasChangesRef.current = true;
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChangesRef.current) {
      if (confirm("¿Descartar los cambios no guardados?")) {
        setCriteria(originalCriteria);
        hasChangesRef.current = false;
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    setValidationError(null);
    
    // Validate
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
    setError(null);
    
    try {
      const payload = {
        evaluationPeriodId: Number(selectedPeriodId),
        gradeCourseId: Number(selectedCourseId),
        criteria: criteria.map((c, i) => ({
          ...c,
          order: i + 1,
        })),
      };
      
      const response = await evaluationCriteriaService.saveCriteria(payload);
      setCriteria(response.criteria);
      setOriginalCriteria(response.criteria);
      hasChangesRef.current = false;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Check if all 4 filters are selected
  const allFiltersSelected = selectedYearId && selectedPeriodId && selectedGradeId && selectedCourseId;

  return (
    <div className="space-y-4">
      {/* Filter selectors */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Año Académico:</span>
          <Select value={selectedYearId} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar año" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year.id} value={String(year.id)}>
                  {year.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Período de Evaluación:</span>
          <Select 
            value={selectedPeriodId} 
            onValueChange={handlePeriodChange} 
            disabled={!selectedYearId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              {evaluationPeriods.map((period) => (
                <SelectItem key={period.id} value={String(period.id)}>
                  {period.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Grado:</span>
          <Select 
            value={selectedGradeId} 
            onValueChange={handleGradeChange} 
            disabled={!selectedYearId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar grado" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((grade) => (
                <SelectItem key={grade.id} value={String(grade.id)}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Curso:</span>
          <Select 
            value={selectedCourseId} 
            onValueChange={handleCourseChange} 
            disabled={!selectedGradeId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar curso" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.gradeCourseId} value={String(course.gradeCourseId)}>
                  {course.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error messages */}
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

      {/* Criteria list */}
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

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              disabled={isSaving || !hasChangesRef.current}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <LoadingButton
              isLoading={isSaving}
              onClick={handleSave}
              disabled={!hasChangesRef.current || criteria.length === 0 || hasInvalidData(criteria) || hasDuplicateNames(criteria)}
            >
              <Save className="h-4 w-4" />
              Guardar
            </LoadingButton>
          </div>
        </div>
      )}
    </div>
  );
}