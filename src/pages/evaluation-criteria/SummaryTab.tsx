import { useState, useEffect, useCallback } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
import { evaluationCriteriaService } from "@/services/evaluation-criteria.service";
import { ApiError } from "@/types/api";
import type { EvaluationCriteriaSummaryItem, AcademicYearOption, EvaluationPeriodOption } from "@/types/evaluation-criteria";

export function SummaryTab() {
  // Use useOptions hook for academic years - autoFetch: true to load once on mount
  const { options: academicYearOptions } = useOptions<AcademicYearOption>(
    ENDPOINTS.AcademicYears,
    (item) => ({ label: item.name, value: String(item.id) }),
    true
  );

  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [evaluationPeriods, setEvaluationPeriods] = useState<EvaluationPeriodOption[]>([]);
  const [summaryData, setSummaryData] = useState<EvaluationCriteriaSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [periodError, setPeriodError] = useState<string | null>(null);

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
    setPeriodError(null);
    try {
      const periods = await evaluationCriteriaService.getEvaluationPeriods(yearId);
      setEvaluationPeriods(periods);
    } catch (err) {
      if (err instanceof ApiError) {
        setPeriodError(err.message);
      }
      setEvaluationPeriods([]);
    }
  }

  // Load summary when both year and period are selected
  useEffect(() => {
    if (selectedYearId && selectedPeriodId) {
      loadSummary(Number(selectedYearId), Number(selectedPeriodId));
    } else {
      setSummaryData([]);
    }
  }, [selectedPeriodId]);

  async function loadSummary(yearId: number, periodId: number) {
    setIsLoading(true);
    try {
      const data = await evaluationCriteriaService.getSummary(yearId, periodId);
      setSummaryData(data);
    } catch (err) {
      console.error("Error loading summary:", err);
      setSummaryData([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Group data by grade
  const groupedByGrade = summaryData.reduce((acc, item) => {
    const gradeName = item.gradeName;
    if (!acc[gradeName]) {
      acc[gradeName] = [];
    }
    acc[gradeName].push(item);
    return acc;
  }, {} as Record<string, EvaluationCriteriaSummaryItem[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Año Académico:</span>
          <Select value={selectedYearId} onValueChange={setSelectedYearId}>
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

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Período de Evaluación:</span>
          <Select 
            value={selectedPeriodId} 
            onValueChange={setSelectedPeriodId} 
            disabled={!selectedYearId || !!periodError}
          >
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
      </div>

      {periodError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {periodError}
        </div>
      )}

      {!selectedYearId || !selectedPeriodId ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Seleccione un año académico y un período de evaluación para ver el resumen.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando resumen...</p>
          </div>
        </div>
      ) : summaryData.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            No hay combinaciones de grado-curso para este período.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grado</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Criterios configurados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedByGrade).map(([gradeName, courses]) =>
                courses.map((item, index) => (
                  <TableRow key={`${item.gradeId}-${item.gradeCourseId}`}>
                    {index === 0 && (
                      <TableCell rowSpan={courses.length} className="font-medium border-r">
                        {gradeName}
                      </TableCell>
                    )}
                    <TableCell>{item.courseName}</TableCell>
                    <TableCell>
                      {item.criteriaCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-600" />
                          <span>{item.criteriaCount} criterios configurados</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Sin configurar</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}