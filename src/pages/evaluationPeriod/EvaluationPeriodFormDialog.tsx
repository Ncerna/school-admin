import { useState, useEffect, type FormEvent, useRef } from "react";
import { Save, Calendar, CalendarDays } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { evaluationPeriodsService } from "@/services/evaluation-periods.service";
import { ApiError } from "@/types/api";
import type { EvaluationPeriod, AcademicYearOption, EvaluationTypeOption, EvaluationPeriodPayload } from "@/types";

interface EvaluationPeriodFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: EvaluationPeriod | null;
  academicYears: AcademicYearOption[];
  evaluationTypes: EvaluationTypeOption[];
  isOptionsLoading: boolean;
  onSuccess: () => void;
}

// Convert number to Roman numeral
function toRoman(num: number): string {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let result = "";
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
    }
  }
  return result;
}

// Format date to YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Add months to a date
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function EvaluationPeriodFormDialog({
  open,
  onOpenChange,
  editingItem,
  academicYears,
  evaluationTypes,
  isOptionsLoading,
  onSuccess,
}: EvaluationPeriodFormDialogProps) {
  const isEditing = Boolean(editingItem);
  const [yearId, setYearId] = useState("");
  const [evaluationTypeId, setEvaluationTypeId] = useState("");
  const [periodsCount, setPeriodsCount] = useState(0);
  const [periods, setPeriods] = useState<
    { id?: string; code: string; name: string; startDate: string; endDate: string; isCurrent: boolean }[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true);

  // Load data when editing
  useEffect(() => {
    if (open && editingItem) {
      loadPeriodData(editingItem.id);
    } else if (open && !editingItem) {
      // Reset form for creation
      setYearId("");
      setEvaluationTypeId("");
      setPeriodsCount(0);
      setPeriods([]);
      setErrors(null);
      setGeneralError(null);
    }
  }, [open, editingItem]);

  async function loadPeriodData(id: string) {
    setIsSaving(true);
    setGeneralError(null);
    try {
      // Get the period data - we need to fetch the full form data
      const periodData = await evaluationPeriodsService.getById(id);
      setYearId(String(periodData.yearId));
      setEvaluationTypeId(String(periodData.evaluationTypeId));
      setPeriodsCount(periodData.periodsCount);
      setPeriods(
        periodData.periods.map((p: any) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          startDate: p.startDate,
          endDate: p.endDate,
          isCurrent: p.isCurrent,
        }))
      );
    } catch (err) {
      setGeneralError(err instanceof ApiError ? err.message : "No se pudo cargar el período.");
    } finally {
      setIsSaving(false);
    }
  }

  // Handle evaluation type change
  function handleEvaluationTypeChange(value: string) {
    setEvaluationTypeId(value);
  }

  // Handle year change - set periodsCount from selected academic year
  function handleYearChange(value: string) {
   setYearId(value);
    // Get periodsCount from selected academic year, default to 4 if 0 or null
    const selectedYear = academicYears.find((y) => String(y.id) === String(value));
 
    const count = selectedYear?.periodsCount ?? 1;
    
    setPeriodsCount(count);
  }

  // Generate periods
  function handleGenerate() {
    if (!yearId || !evaluationTypeId || periodsCount <= 0) return;

    const selectedType = evaluationTypes.find((t) => String(t.id) === String(evaluationTypeId));
    const typeName = selectedType?.name || "Período";
    
    const today = new Date();
    const newPeriods = [];
    
    for (let i = 1; i <= periodsCount; i++) {
      const startDate = addMonths(new Date(today), i - 1);
      const endDate = addMonths(new Date(today), i);
      endDate.setDate(endDate.getDate() - 1);
      
      newPeriods.push({
        code: `${typeName.substring(0, 3).toUpperCase()}-${toRoman(i)}`,
        name: `${typeName} ${toRoman(i)}`,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        isCurrent: i === 1, // First period is current by default
      });
    }
    
   setPeriods(newPeriods);
  }

  // Handle date change
  function handleDateChange(index: number, field: "startDate" | "endDate", value: string) {
    setPeriods((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  }

  // Handle isCurrent change - only one can be current
  function handleIsCurrentChange(index: number, checked: boolean) {
   setPeriods((prev) => {
      const newPeriods = prev.map((p, i) => ({ ...p, isCurrent: i === index ? checked : false }));
      return newPeriods;
    });
  }

  // Handle save
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors(null);
    setGeneralError(null);
    setIsSaving(true);

    const payload: EvaluationPeriodPayload = {
      yearId,
      evaluationTypeId,
      periods: periods.map((p) => ({
        id: p.id,
        startDate: p.startDate,
        endDate: p.endDate,
        isCurrent: p.isCurrent,
      })),
    };

    try {
      if (isEditing && editingItem) {
        await evaluationPeriodsService.update(editingItem.id, payload);
      } else {
        await evaluationPeriodsService.create(payload);
      }
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors);
        setGeneralError(err.message);
      }
    } finally {
      setIsSaving(false);
    }
  }

  // Handle cancel
  function handleCancel() {
   
    setPeriods([]);
    onOpenChange(false);
  }

  // Wrapper for onOpenChange to debug
  function handleDialogOpenChange(newOpen: boolean) {
    onOpenChange(newOpen);
  }

  // Debug: Log current state on every render

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-4xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar período de evaluación" : "Nuevo período de evaluación"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Actualiza la información de los períodos."
                : "Configura los períodos de evaluación para un año académico."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="flex flex-col gap-6">
            {generalError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {generalError}
              </div>
            )}

            {/* Configuration Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Configuración</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="grid gap-1.5">
                  <Label>Año Académico <span className="text-destructive">*</span></Label>
                  <Select
                    value={yearId}
                    onValueChange={handleYearChange}
                    disabled={isOptionsLoading || isEditing}
                  >
                    <SelectTrigger>
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

                <div className="grid gap-1.5">
                  <Label>Tipo de Evaluación <span className="text-destructive">*</span></Label>
                  <Select
                    value={evaluationTypeId}
                    onValueChange={handleEvaluationTypeChange}
                    disabled={isOptionsLoading || isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {evaluationTypes.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label>Cantidad de Períodos</Label>
                  <Input
                    type="number"
                    value={periodsCount}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!yearId || !evaluationTypeId || isEditing}
                >
                  Generar
                </Button>
              </div>
            </div>

            {/* Generated Periods Table */}
            {periods.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Períodos Generados</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-medium">Período (código)</th>
                        <th className="px-3 py-2 text-left text-sm font-medium">Fecha de Inicio</th>
                        <th className="px-3 py-2 text-left text-sm font-medium">Fecha de Fin</th>
                        <th className="px-3 py-2 text-left text-sm font-medium">Cursando</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periods.map((period, index) => (
                        <tr key={period.code} className="border-t">
                          <td className="px-3 py-2 text-sm">{period.name}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <Input
                                type="date"
                                value={period.startDate}
                                onChange={(e) => handleDateChange(index, "startDate", e.target.value)}
                                className="w-auto"
                                required
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-muted-foreground" />
                              <Input
                                type="date"
                                value={period.endDate}
                                onChange={(e) => handleDateChange(index, "endDate", e.target.value)}
                                className="w-auto"
                                required
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <Checkbox
                              checked={period.isCurrent}
                              onCheckedChange={() => handleIsCurrentChange(index, !period.isCurrent)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancelar
            </Button>
            <LoadingButton type="submit" isLoading={isSaving} disabled={periods.length === 0}>
              <Save className="h-4 w-4" />
              {isEditing ? "Guardar cambios" : "Registrar períodos"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}