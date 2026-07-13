import { useState, useEffect, useCallback } from "react";
import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { feeSchedulesService } from "@/services/fee-schedules.service";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/components/common/LoadingButton";
import { X, Save } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { ColumnDef, FeeSchedule, FeeSchedulePayload } from "@/types";

// Columns for the fee schedule table
const columns: ColumnDef<FeeSchedule>[] = [
  { header: "Año Académico", accessor: "yearName", sortable: true },
  { header: "Grado", accessor: "gradeName", sortable: true },
  { header: "Tipo de Cobro", accessor: "chargeTypeName", sortable: true },
  { 
    header: "Monto", 
    accessor: "amount",
    render: (item) => `S/ ${item.amount.toFixed(2)}`,
    className: "text-right"
  },
];

// Custom form dialog for fee schedule (with dynamic selects)
function FeeScheduleFormDialog({
  open,
  onOpenChange,
  editingItem,
  isSaving,
  onSave,
  yearOptions,
  gradeOptions,
  chargeTypeOptions,
  isFormLoading,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: FeeSchedule | null;
  isSaving: boolean;
  onSave: (values: FeeSchedulePayload) => Promise<void>;
  yearOptions: { value: string; label: string }[];
  gradeOptions: { value: string; label: string }[];
  chargeTypeOptions: { value: string; label: string }[];
  isFormLoading: boolean;
  onSuccess?: () => void;
}) {
  const [formValues, setFormValues] = useState<FeeSchedulePayload>({
    yearId: "",
    gradeId: "",
    chargeTypeId: "",
    amount: 0,
  });

  // Update form values when dialog opens
  useEffect(() => {
    if (open) {
      setFormValues({
        yearId: editingItem?.yearId ?? "",
        gradeId: editingItem?.gradeId ?? "",
        chargeTypeId: editingItem?.chargeTypeId ?? "",
        amount: editingItem?.amount ?? 0,
      });
    }
  }, [open, editingItem]);

  async function handleSubmit() {
    try {
      await onSave(formValues);
      onSuccess?.();
    } catch (err) {
      console.error("Error saving fee schedule:", err);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col h-full">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar tarifa" : "Nueva tarifa"}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Actualiza la información de la tarifa."
                : "Completa los datos para crear la tarifa."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="yearId">Año Académico *</Label>
              <Select
                value={formValues.yearId}
                onValueChange={(v) => setFormValues((p) => ({ ...p, yearId: v }))}
                disabled={isFormLoading || isSaving}
              >
                <SelectTrigger id="yearId">
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="gradeId">Grado</Label>
              <Select
                value={formValues.gradeId}
                onValueChange={(v) => setFormValues((p) => ({ ...p, gradeId: v }))}
                disabled={isFormLoading || isSaving}
              >
                <SelectTrigger id="gradeId">
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>
                <SelectContent>
                  {gradeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="chargeTypeId">Tipo de Cobro *</Label>
              <Select
                value={formValues.chargeTypeId}
                onValueChange={(v) => setFormValues((p) => ({ ...p, chargeTypeId: v }))}
                disabled={isFormLoading || isSaving}
              >
                <SelectTrigger id="chargeTypeId">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {chargeTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formValues.amount}
                onChange={(e) => setFormValues((p) => ({ ...p, amount: Number(e.target.value) }))}
                disabled={isFormLoading || isSaving}
                required
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving || isFormLoading}>
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <LoadingButton
              isLoading={isSaving || isFormLoading}
              onClick={handleSubmit}
              disabled={!formValues.yearId || !formValues.chargeTypeId || formValues.amount <= 0}
            >
              <Save className="h-4 w-4" />
              {editingItem ? "Guardar cambios" : "Crear"}
            </LoadingButton>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FeeSchedulePage() {
  // Load options for the form
  const { options: yearOptions, isLoading: yearsLoading, fetch: fetchYears } = useOptions<{ id: string; name: string }>(
    ENDPOINTS.AcademicYears,
    (n) => ({ label: n.name, value: String(n.id) })
  );
  const { options: gradeOptions, isLoading: gradesLoading, fetch: fetchGrades } = useOptions<{ id: string; name: string }>(
    ENDPOINTS.grades,
    (g) => ({ label: g.name, value: String(g.id) })
  );
  const { options: chargeTypeOptions, isLoading: chargeTypesLoading, fetch: fetchChargeTypes } = useOptions<{ id: string; name: string }>(
    ENDPOINTS.chargeTypes,
    (c) => ({ label: c.name, value: String(c.id) })
  );

  const isFormLoading = yearsLoading || gradesLoading || chargeTypesLoading;

  // Custom form dialog handler
  const renderFormDialog = useCallback(
    ({
      open,
      onOpenChange,
      editingItem,
      isSaving,
      onSave,
      refetch,
    }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      editingItem: FeeSchedule | null;
      isSaving: boolean;
      onSave: (values: FeeSchedulePayload) => Promise<void>;
      refetch: () => void;
    }) => {
      return (
        <FeeScheduleFormDialog
          open={open}
          onOpenChange={onOpenChange}
          editingItem={editingItem}
          isSaving={isSaving}
          onSave={onSave}
          yearOptions={yearOptions}
          gradeOptions={gradeOptions}
          chargeTypeOptions={chargeTypeOptions}
          isFormLoading={isFormLoading}
          onSuccess={() => {
            onOpenChange(false);
            refetch();
          }}
        />
      );
    },
    [yearOptions, gradeOptions, chargeTypeOptions, isFormLoading]
  );

  // State for delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<FeeSchedule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete
  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await feeSchedulesService.remove(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting fee schedule:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <ApiCrudPage<FeeSchedule, FeeSchedulePayload>
        title="Tarifas"
        description="Configura los montos de cargos por año académico y grado."
        columns={columns}
        fields={[]}
        api={feeSchedulesService}
        emptyItem={{ yearId: "", gradeId: "", chargeTypeId: "", amount: 0 }}
        searchPlaceholder="Buscar tarifa..."
        newLabel="Nueva tarifa"
        isFormLoading={isFormLoading}
        renderFormDialog={renderFormDialog}
        onCustomDelete={(item) => {
          setDeleteTarget(item);
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="¿Eliminar esta tarifa?"
        description="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}