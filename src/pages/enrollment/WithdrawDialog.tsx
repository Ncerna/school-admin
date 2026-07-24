import React, { useState, useCallback, useEffect } from "react";
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
import { enrollmentsService } from "@/services/enrollments.service";
import { useToast } from "@/components/ui/toast";
import { AlertCircle, CheckCircle2, XCircle, DollarSign, CreditCard, Package } from "lucide-react";
import type { WithdrawPreview, WithdrawCharge } from "@/types";

const chargeTypeIcons: Record<string, React.ReactNode> = {
  ENROLLMENT: <CreditCard className="h-4 w-4" />,
  TUITION: <DollarSign className="h-4 w-4" />,
  SUPPLIES: <Package className="h-4 w-4" />,
};

const chargeTypeColors: Record<string, string> = {
  ENROLLMENT: "bg-blue-100 text-blue-700",
  TUITION: "bg-amber-100 text-amber-700",
  SUPPLIES: "bg-green-100 text-green-700",
};

function WithdrawChargeRow({ charge, icon }: { charge: WithdrawCharge; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${chargeTypeColors[charge.type] || "bg-gray-100 text-gray-700"}`}>
          {icon}
        </span>
        <div>
          <p className="font-medium">{charge.label}</p>
          <p className="text-xs text-muted-foreground">Vence: {new Date(charge.due_date).toLocaleDateString("es-PE")}</p>
        </div>
      </div>
      <span className="font-semibold">S/ {charge.amount.toFixed(2)}</span>
    </div>
  );
}

export default function WithdrawDialog({
  open,
  onOpenChange,
  enrollmentId,
  enrollmentName,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string;
  enrollmentName: string;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const [step, setStep] = useState<"loading" | "preview" | "confirming" | "success" | "error">("loading");
  const [preview, setPreview] = useState<WithdrawPreview | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    setStep("loading");
    setErrorMsg(null);
    try {
      const data = await enrollmentsService.withdrawPreview(enrollmentId);
      setPreview(data);
      setStep("preview");
    } catch (err: any) {
      setErrorMsg(err.message || "Error al cargar la vista previa.");
      setStep("error");
    }
  }, [enrollmentId]);

  // Load preview when dialog opens
  useEffect(() => {
    if (open) loadPreview();
  }, [open, loadPreview]);

  // Reset when dialog closes
  function handleClose() {
    setStep("loading");
    setPreview(null);
    setErrorMsg(null);
    onOpenChange(false);
  }

  async function handleConfirm() {
    setStep("confirming");
    setErrorMsg(null);
    try {
      await enrollmentsService.withdrawConfirm(enrollmentId);
      setStep("success");
      showToast("Matrícula retirada exitosamente", "success");
    } catch (err: any) {
      setErrorMsg(err.message || "Error al retirar la matrícula.");
      setStep("error");
    }
  }

  function handleDone() {
    handleClose();
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === "loading" && "Cargando..."}
            {step === "preview" && "Confirmar retiro de matrícula"}
            {step === "confirming" && "Procesando retiro..."}
            {step === "success" && "Matrícula retirada"}
            {step === "error" && "Error"}
          </DialogTitle>
          <DialogDescription>
            {step === "preview" && `Estás a punto de retirar la matrícula de "${enrollmentName}". Revisa los detalles antes de confirmar.`}
            {step === "success" && "La matrícula ha sido retirada exitosamente."}
            {step === "error" && "Ocurrió un error al procesar la solicitud."}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {step === "loading" && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-2 text-sm text-muted-foreground">Obteniendo información...</p>
              </div>
            </div>
          )}

          {step === "preview" && preview && (
            <div className="space-y-4">
              {/* Student info */}
              <div className="grid grid-cols-3 gap-4 rounded-lg border bg-muted/30 p-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Estudiante:</span>
                  <p className="font-semibold">{preview.student_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Grado:</span>
                  <p className="font-semibold">{preview.grade_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Año:</span>
                  <p className="font-semibold">{preview.year_name}</p>
                </div>
              </div>

              {/* Charges cancelled (pending) */}
              {preview.charges_cancelled.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700">
                    <XCircle className="h-4 w-4" />
                    Cargos que serán cancelados ({preview.charges_cancelled.length})
                  </div>
                  <div className="space-y-2">
                    {preview.charges_cancelled.map((charge) => (
                      <WithdrawChargeRow
                        key={charge.id}
                        charge={charge}
                        icon={chargeTypeIcons[charge.type] || <CreditCard className="h-4 w-4" />}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Charges paid (already paid) */}
              {preview.charges_paid.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Cargos ya pagados ({preview.charges_paid.length})
                  </div>
                  <div className="space-y-2">
                    {preview.charges_paid.map((charge) => (
                      <WithdrawChargeRow
                        key={charge.id}
                        charge={charge}
                        icon={chargeTypeIcons[charge.type] || <CreditCard className="h-4 w-4" />}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="rounded-lg border bg-card p-4">
                <p className="mb-2 text-sm font-semibold">Resumen</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total pendiente:</span>
                    <span className="font-semibold text-amber-700">S/ {preview.summary.total_pending.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total pagado:</span>
                    <span className="font-semibold text-green-700">S/ {preview.summary.total_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cargos a cancelar:</span>
                    <span className="font-semibold">{preview.summary.cancelled_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cargos pagados:</span>
                    <span className="font-semibold">{preview.summary.paid_count}</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>Esta acción retirará al estudiante del grado y año seleccionados. Los cargos pendientes serán cancelados. Los cargos ya pagados se mantendrán. Esta acción no se puede deshacer.</p>
              </div>
            </div>
          )}

          {step === "confirming" && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-2 text-sm text-muted-foreground">Procesando retiro de matrícula...</p>
              </div>
            </div>
          )}

          {step === "success" && preview && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Retiro exitoso</p>
                <p className="text-sm text-muted-foreground">
                  La matrícula de <strong>{preview.student_name}</strong> en <strong>{preview.grade_name}</strong> ({preview.year_name}) ha sido retirada.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vacantes restauradas: <strong>{preview.vacancies_restored}</strong>
                </p>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{errorMsg || "Error desconocido al procesar la solicitud."}</p>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <LoadingButton isLoading={false} onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white">
                <XCircle className="h-4 w-4" />
                Confirmar retiro
              </LoadingButton>
            </>
          )}

          {step === "success" && (
            <Button onClick={handleDone}>
              Cerrar
            </Button>
          )}

          {step === "error" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cerrar
              </Button>
              <Button onClick={loadPreview}>
                Reintentar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}