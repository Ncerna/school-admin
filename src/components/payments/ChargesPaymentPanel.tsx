import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, X } from "lucide-react";
import { paymentsService } from "@/services/payments.service";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChargeStatusBadge } from "@/components/shared/ChargeStatusBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError } from "@/types/api";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";

import type { Charge, PaymentMethod, PaymentBatchResult } from "@/types";
import type { PaymentMethodEntry, PaymentMethodEntryPayload } from "@/types/payment";

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

// Payment method entry for form state
interface PaymentMethodFormEntry {
  id: string;
  paymentMethodCode: string;
  amount: number;
  reference: string | null;
}

// Counter for generating unique IDs
let entryIdCounter = 0;
function generateEntryId(): string {
  return `entry-${++entryIdCounter}`;
}

// Payment methods form section component
function PaymentMethodsSection({
  entries,
  paymentMethods,
  onMethodChange,
  onAddMethod,
  onRemoveMethod,
}: {
  entries: PaymentMethodFormEntry[];
  paymentMethods: { value: string; label: string }[];
  onMethodChange: (entryId: string, field: keyof PaymentMethodFormEntry, value: string | number | null) => void;
  onAddMethod: () => void;
  onRemoveMethod: (entryId: string) => void;
}) {
  const totalEntered = useMemo(
    () => entries.reduce((sum, e) => sum + (e.amount || 0), 0),
    [entries]
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Métodos de pago</h3>
      
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-end gap-3 p-3 border rounded-md">
          <div className="flex-1 grid gap-1.5">
            <Label htmlFor={`method-${entry.id}`}>Método *</Label>
            <Select
              value={entry.paymentMethodCode}
              onValueChange={(v: string) => onMethodChange(entry.id, "paymentMethodCode", v)}
            >
              <SelectTrigger id={`method-${entry.id}`}>
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 grid gap-1.5">
            <Label htmlFor={`amount-${entry.id}`}>Monto *</Label>
            <Input
              id={`amount-${entry.id}`}
              type="number"
              min="0"
              step="0.01"
              value={entry.amount || ""}
              onChange={(e) => onMethodChange(entry.id, "amount", Number(e.target.value))}
              placeholder="0.00"
            />
          </div>

          <div className="flex-1 grid gap-1.5">
            <Label htmlFor={`reference-${entry.id}`}>
              Referencia {entry.paymentMethodCode !== "CASH" && "*"}
            </Label>
            <Input
              id={`reference-${entry.id}`}
              type="text"
              value={entry.reference || ""}
              onChange={(e) => onMethodChange(entry.id, "reference", e.target.value)}
              placeholder="Número de referencia"
              disabled={entry.paymentMethodCode === "CASH"}
            />
          </div>

          {entries.length > 1 && (
            <button
              type="button"
              onClick={() => onRemoveMethod(entry.id)}
              className="p-2 text-destructive hover:bg-destructive/10 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={onAddMethod}
        className="text-sm text-primary hover:underline"
      >
        + Agregar otro método de pago
      </button>

      <div className="flex gap-4 text-sm">
        <span>Total ingresado: S/ {totalEntered.toFixed(2)}</span>
      </div>
    </div>
    
  );
}

// Get payment method name by code
function getPaymentMethodName(code: string, paymentMethods: { value: string; label: string }[]): string {
  const method = paymentMethods.find((m) => m.value === code);
  return method?.label || code;
}

export function ChargesPaymentPanel({ payableId, chargeTypeFilter, submitEndpoint }: ChargesPaymentPanelProps) {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedChargeIds, setSelectedChargeIds] = useState<number[]>([]);
  const [paymentMethodEntries, setPaymentMethodEntries] = useState<PaymentMethodFormEntry[]>([
    { id: generateEntryId(), paymentMethodCode: "", amount: 0, reference: null },
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentBatchResult | null>(null);

  // Load payment methods using useOptions (auto-fetch on mount for visible dropdowns)
  const { options: paymentMethods, isLoading: methodsLoading } = useOptions<PaymentMethod>(
    ENDPOINTS.paymentMethods,
    (m) => ({ label: m.name, value: m.code }),
    true // Auto-fetch on mount for payment method dropdowns
  );

  // Load charges on mount
  useEffect(() => {
    loadCharges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payableId, chargeTypeFilter]);

  const loadCharges = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentsService.getCharges(payableId, chargeTypeFilter);
      console.log(chargeTypeFilter)
      setCharges(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los cargos.");
    } finally {
      setIsLoading(false);
    }
  }, [payableId, chargeTypeFilter]);

  // Get pending charges (not Paid)
  const pendingCharges = useMemo( () => charges.filter((c) => c.status !== "Paid"), [charges]);

  // Calculate total selected (sum of balance for selected charges)
  const totalSelected = useMemo(
    () => charges
      .filter((c) => selectedChargeIds.includes(c.id))
      .reduce((sum, c) => sum + (c.balance ?? c.amount), 0),
    [charges, selectedChargeIds]
  );

  // Calculate total entered (sum of amounts in payment method entries)
  const totalEntered = useMemo(
    () => paymentMethodEntries.reduce((sum, e) => sum + (e.amount || 0), 0),
    [paymentMethodEntries]
  );

  // Handle charge selection
  const handleChargeSelect = useCallback((chargeId: number, checked: boolean) => {
    setSelectedChargeIds((prev) =>
      checked ? [...prev, chargeId] : prev.filter((id) => id !== chargeId)
    );
  }, []);

  // Handle "select all pending" checkbox
  const handleSelectAllPending = useCallback((checked: boolean) => {
    if (checked) {
      const pendingIds = pendingCharges.map((c) => c.id);
      setSelectedChargeIds(pendingIds);
    } else {
      setSelectedChargeIds([]);
    }
  }, [pendingCharges]);

  // Handle payment method change
  const handleMethodChange = useCallback((entryId: string, field: keyof PaymentMethodFormEntry, value: string | number | null) => {
    setPaymentMethodEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    );
  }, []);

  // Add new payment method row
  const addPaymentMethod = useCallback(() => {
    setPaymentMethodEntries((prev) => [
      ...prev,
      { id: generateEntryId(), paymentMethodCode: "", amount: 0, reference: null },
    ]);
  }, []);

  // Remove payment method row
  const removePaymentMethod = useCallback((entryId: string) => {
    if (paymentMethodEntries.length === 1) return;
    setPaymentMethodEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  }, [paymentMethodEntries.length]);

  // Validation: at least one method with amount > 0, and non-CASH methods need reference
  const methodsWithAmount = useMemo(
    () => paymentMethodEntries.filter((e) => e.amount > 0),
    [paymentMethodEntries]
  );
  
  const hasValidReference = useMemo(
    () => methodsWithAmount.every(
      (e) => e.paymentMethodCode === "CASH" || (e.reference && e.reference.trim() !== "")
    ),
    [methodsWithAmount]
  );
  
  const canSubmit = useMemo(
    () => methodsWithAmount.length > 0 && hasValidReference,
    [methodsWithAmount.length, hasValidReference]
  );

  // Handle payment submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Map frontend fields to API format (snake_case)
      const methodsForApi: PaymentMethodEntryPayload[] = methodsWithAmount.map((entry) => ({
        payment_method_code: entry.paymentMethodCode,
        amount: entry.amount,
        reference: entry.reference,
      }));
      const result = await paymentsService.register(submitEndpoint, {
        payableType: "enrollment",
        payableId,
        methods: methodsForApi,
        chargeIds: selectedChargeIds.length ? selectedChargeIds : null,
        chargeTypeCode: chargeTypeFilter ?? null,
      });
      setPaymentResult(result);
      // Refresh charges
      await loadCharges();
      // Reset form
      setSelectedChargeIds([]);
      setPaymentMethodEntries([{ id: generateEntryId(), paymentMethodCode: "", amount: 0, reference: null }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al registrar el pago.");
    } finally {
      setIsSubmitting(false);
    }
  }, [methodsWithAmount, submitEndpoint, payableId, selectedChargeIds, chargeTypeFilter, loadCharges]);

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
                    <ChargeStatusBadge status={charge.status} />
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
      <PaymentMethodsSection
        entries={paymentMethodEntries}
        paymentMethods={paymentMethods}
        onMethodChange={handleMethodChange}
        onAddMethod={addPaymentMethod}
        onRemoveMethod={removePaymentMethod}
      />

      {/* Totals */}
      <div className="flex gap-4 text-sm">
        <span>Total ingresado: S/ {totalEntered.toFixed(2)}</span>
        {selectedChargeIds.length > 0 && (
          <span className={totalEntered !== totalSelected ? "text-yellow-600" : ""}>
            Total seleccionado: S/ {totalSelected.toFixed(2)}
          </span>
        )}
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
              <p className="font-medium">S/ {payment.amount.toFixed(2)} vía {getPaymentMethodName(payment.method, paymentMethods)}</p>
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