import { useState, useEffect } from "react";
import { X, Calendar, CalendarDays, BookOpen, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { evaluationPeriodsService } from "@/services/evaluation-periods.service";
import { ApiError } from "@/types/api";
import { Loader2 } from "lucide-react";
import type { EvaluationPeriod, EvaluationPeriodFormState } from "@/types";

interface EvaluationPeriodDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: EvaluationPeriod | null;
}

export function EvaluationPeriodDetailsDialog({
  open,
  onOpenChange,
  period,
}: EvaluationPeriodDetailsDialogProps) {
  const [details, setDetails] = useState<EvaluationPeriodFormState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && period) {
      loadDetails(period.id);
    } else if (!open) {
      setDetails(null);
      setError(null);
    }
  }, [open, period]);

  async function loadDetails(id: string) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await evaluationPeriodsService.getById(id);
      setDetails(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los detalles del período.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalles del Período de Evaluación</DialogTitle>
          <DialogDescription>
            Información completa del período de evaluación y sus sub-períodos.
          </DialogDescription>
        </DialogHeader>
        
        <DialogBody>
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center min-h-[200px]">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : details ? (
            <div className="space-y-6">
              {/* Header Information */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Información General
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Año Académico:</span>
                    <span className="text-sm">{details.header.yearName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Tipo:</span>
                    <span className="text-sm">{details.header.typeName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Cantidad de Períodos:</span>
                    <span className="text-sm">{details.header.periodsCount}</span>
                  </div>
                  {details.header.status && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Estado:</span>
                      <StatusBadge estado={details.header.status} />
                    </div>
                  )}
                </div>
              </div>

              {/* Periods List */}
              {details.periods && details.periods.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Períodos
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-2 text-left text-sm font-medium">
                            Código
                          </th>
                          <th className="px-3 py-2 text-left text-sm font-medium">
                            Nombre
                          </th>
                          <th className="px-3 py-2 text-left text-sm font-medium">
                            Fecha de Inicio
                          </th>
                          <th className="px-3 py-2 text-left text-sm font-medium">
                            Fecha de Fin
                          </th>
                          <th className="px-3 py-2 text-left text-sm font-medium">
                            Cursando
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.periods.map((period) => (
                          <tr key={period.id} className="border-t">
                            <td className="px-3 py-2 text-sm font-mono">{period.code}</td>
                            <td className="px-3 py-2 text-sm">{period.name || period.code}</td>
                            <td className="px-3 py-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {period.startDate}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm">
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                {period.endDate}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {period.isCurrent ? (
                                <span className="text-xs font-medium text-primary">Sí</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">No</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}