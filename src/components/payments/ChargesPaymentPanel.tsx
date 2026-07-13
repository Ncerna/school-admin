import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { paymentsService } from "@/services/payments.service";
import { paymentMethodsService } from "@/services/payment-methods.service";
import { Badge } from "@/components/ui/badge";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError } from "@/types/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import type { Charge, PaymentMethod, PaymentMethodEntry, PaymentBatchResult } from "@/types";

interface ChargesPaymentPanelProps {
  payableId: number;
  chargeTypeFilter?: string;
  submitEndpoint: string;
}

// Charge type labels mapping
const chargeTypeLabels: Record<string, string> = {
  ENROLLMENT: "Matrícula",
  TUITION: "Pensión",
  SUPPLIES: "Útiles",
};

// Charge status badge variant mapping
function getChargeStatusVariant(status: string): "success" | "secondary" | "destructive" {
  if (status === "Paid") return "success";
  if (status === "Pending" || status === "Partial") return "secondary";
  return "destructive";
}

export function ChargesPaymentPanel({ payableId, chargeTypeFilter, submitEndpoint }: ChargesPaymentPanelProps) {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedChargeIds, setSelectedChargeIds] = useState<number[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodEntries, setPaymentMethodEntries] = useState<PaymentMethodEntry[]>([
    { paymentMethodCode: "", amount: 0, reference: null },
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentBatchResult | null>(null);

  // Load charges on mount
  useEffect(() => {
    loadCharges();
    loadPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payableId, chargeTypeFilter]);

  async function loadCharges() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentsService.getCharges(payableId, chargeTypeFilter);
      setCharges(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los cargos.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPaymentMethods() {
    try {
      // Use /payment-methods/options endpoint which returns array directly
      const methods = await apiClient.get<PaymentMethod[]>(ENDPOINTS.paymentMethodsOptions);
      setPaymentMethods(methods);
    } catch (err) {
      console.error("Error loading payment methods:", err);
    }
  }

  // Get pending charges (not Paid)
  const pendingCharges = charges.filter((c) => c.status !== "Paid");

  // Calculate total selected (sum of balance for selected charges)
  const totalSelected = charges
    .filter((c) => selectedChargeIds.includes(c.id))
    .reduce((sum, c) => sum + c.balance, 0);

  // Calculate total entered (sum of amounts in payment method entries)
  const totalEntered = paymentMethodEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Handle charge selection
  function handleChargeSelect(chargeId: number, checked: boolean) {
    setSelectedChargeIds((prev) =>
      checked ? [...prev, chargeId] : prev.filter((id) => id !== chargeId)
    );
  }

  // Handle "select all pending" checkbox
  function handleSelectAllPending(checked: boolean) {
    if (checked) {
      // Select all pending charges
      const pendingIds = pendingCharges.map((c) => c.id);
      setSelectedChargeIds(pendingIds);
    } else {
      // Deselect all
      setSelectedChargeIds([]);
    }
  }

  // Handle payment method change
  function handleMethodChange(index: number, field: keyof PaymentMethodEntry, value: string | number | null) {
    setPaymentMethodEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  }

  // Add new payment method row
  function addPaymentMethod() {
    setPaymentMethodEntries((prev) => [
      ...prev,
      { paymentMethodCode: "", amount: 0, reference: null },
    ]);
  }

  // Remove payment method row
  function removePaymentMethod(index: number) {
    if (paymentMethodEntries.length === 1) return;
    setPaymentMethodEntries((prev) => prev.filter((_, i) => i !== index));
  }

  // Validation: at least one method with amount > 0, and non-CASH methods need reference
  const methodsWithAmount = paymentMethodEntries.filter((e) => e.amount > 0);
  const hasValidReference = methodsWithAmount.every(
    (e) => e.paymentMethodCode === "CASH" || (e.reference && e.reference.trim() !== "")
  );
  const canSubmit = methodsWithAmount.length > 0 && hasValidReference;

  // Handle payment submission
  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await paymentsService.register(submitEndpoint, {
        payableType: "enrollment",
        payableId,
        methods: methodsWithAmount,
        chargeIds: selectedChargeIds.length ? selectedChargeIds : null,
        chargeTypeCode: chargeTypeFilter ?? null,
      });
      setPaymentResult(result);
      // Refresh charges
      await loadCharges();
      // Reset form
      setSelectedChargeIds([]);
      setPaymentMethodEntries([{ paymentMethodCode: "", amount: 0, reference: null }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al registrar el pago.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Get payment method name by code
  function getPaymentMethodName(code: string): string {
    const method = paymentMethods.find((m) => m.code === code);
    return method?.name || code;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Cargando cargos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Charges Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={pendingCharges.length > 0 && pendingCharges.every((c) => selectedChargeIds.includes(c.id))}
                  onCheckedChange={(checked) => handleSelectAllPending(checked as boolean)}
                />
              </TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cuota/Periodo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Vencimiento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No hay cargos pendientes.
                </TableCell>
              </TableRow>
            ) : (
              charges.map((charge) => (
                <TableRow key={charge.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedChargeIds.includes(charge.id)}
                      onCheckedChange={(checked) => handleChargeSelect(charge.id, checked as boolean)}
                      disabled={charge.status === "Paid"}
                    />
                  </TableCell>
                  <TableCell>
                    {chargeTypeLabels[charge.chargeType] || charge.chargeType}
                  </TableCell>
                  <TableCell>
                    {charge.installmentNumber ?? charge.period ?? "—"}
                  </TableCell>
                  <TableCell>S/ {charge.amount.toFixed(2)}</TableCell>
                  <TableCell>S/ {charge.balance.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getChargeStatusVariant(charge.status)}>
                      {charge.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(charge.dueDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Payment Methods Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Métodos de pago</h3>
        
        {paymentMethodEntries.map((entry, index) => (
          <div key={index} className="flex items-end gap-3 p-3 border rounded-md">
            <div className="flex-1 grid gap-1.5">
              <Label htmlFor={`method-${index}`}>Método *</Label>
              <Select
                value={entry.paymentMethodCode}
                onValueChange={(v) => handleMethodChange(index, "paymentMethodCode", v)}
              >
                <SelectTrigger id={`method-${index}`}>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.code}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 grid gap-1.5">
              <Label htmlFor={`amount-${index}`}>Monto *</Label>
              <Input
                id={`amount-${index}`}
                type="number"
                min="0"
                step="0.01"
                value={entry.amount || ""}
                onChange={(e) => handleMethodChange(index, "amount", Number(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div className="flex-1 grid gap-1.5">
              <Label htmlFor={`reference-${index}`}>Referencia {entry.paymentMethodCode !== "CASH" && "*"}</Label>
              <Input
                id={`reference-${index}`}
                type="text"
                value={entry.reference || ""}
                onChange={(e) => handleMethodChange(index, "reference", e.target.value)}
                placeholder="Número de referencia"
                disabled={entry.paymentMethodCode === "CASH"}
              />
            </div>

            {paymentMethodEntries.length > 1 && (
              <button
                type="button"
                onClick={() => removePaymentMethod(index)}
                className="p-2 text-destructive hover:bg-destructive/10 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addPaymentMethod}
          className="text-sm text-primary hover:underline"
        >
          + Agregar otro método de pago
        </button>

        {/* Totals */}
        <div className="flex gap-4 text-sm">
          <span>Total ingresado: S/ {totalEntered.toFixed(2)}</span>
          {selectedChargeIds.length > 0 && (
            <span className={totalEntered !== totalSelected ? "text-yellow-600" : ""}>
              Total seleccionado: S/ {totalSelected.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <LoadingButton
        onClick={handleSubmit}
        disabled={!canSubmit}
        isLoading={isSubmitting}
      >
        Registrar pago
      </LoadingButton>

      {/* Payment Result */}
      {paymentResult && (
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-medium">Confirmación de pago</h3>
          
          {paymentResult.payments.map((payment) => (
            <div key={payment.id} className="p-3 border rounded-md">
              <p className="font-medium">S/ {payment.amount.toFixed(2)} vía {getPaymentMethodName(payment.method)}</p>
              {payment.reference && (
                <p className="text-sm text-muted-foreground">Referencia: {payment.reference}</p>
              )}
              {payment.allocations.length > 0 && (
                <div className="mt-2 text-xs">
                  {payment.allocations.map((alloc, i) => (
                    <div key={i}>
                      {chargeTypeLabels[alloc.chargeType] || alloc.chargeType}
                      {alloc.period && ` — ${alloc.period}`}
                      {alloc.amountApplied && `: S/ ${alloc.amountApplied.toFixed(2)}`}
                      {` (${alloc.chargeStatus})`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {paymentResult.unappliedAmount > 0 && (
            <div className="rounded-md border border-yellow-600/30 bg-yellow-600/10 px-3 py-2 text-sm text-yellow-600">
              S/ {paymentResult.unappliedAmount.toFixed(2)} no se pudo aplicar a ningún cargo pendiente.
            </div>
          )}
        </div>
      )}
    </div>
  );
}