import { useMemo, useCallback } from "react";
import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { feeSchedulesService } from "@/services/fee-schedules.service";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
import type { ColumnDef, FieldDef, FeeSchedule, FeeSchedulePayload, AcademicYear, Grade } from "@/types";

// Memoize the empty item to prevent unnecessary re-renders
const emptyFeeSchedule: FeeSchedulePayload = {
  yearId: "",
  gradeId: "",
  chargeTypeId: "",
  amount: 0,
};

export default function FeeSchedulePage() {
  // Load options dynamically when the modal opens
  const { options: yearOptions, isLoading: yearsLoading, fetch: fetchYears } = useOptions<AcademicYear>(
    ENDPOINTS.AcademicYears,
    (n) => ({ label: n.name, value: String(n.id) })
  );
  const { options: gradeOptions, isLoading: gradesLoading, fetch: fetchGrades } = useOptions<Grade>(
    ENDPOINTS.grades,
    (g) => ({ label: g.name, value: String(g.id) })
  );
  const { options: chargeTypeOptions, isLoading: chargeTypesLoading, fetch: fetchChargeTypes } = useOptions<{ id: string; name: string }>(
    ENDPOINTS.chargeTypes,
    (c) => ({ label: c.name, value: String(c.id) })
  );

  // Callback to load options when the form dialog opens
  const handleFormOpen = useCallback(() => {
    fetchYears();
    fetchGrades();
    fetchChargeTypes();
  }, [fetchYears, fetchGrades, fetchChargeTypes]);

  // Combined loading state for the form
  const isFormLoading = yearsLoading || gradesLoading || chargeTypesLoading;

  const columns: ColumnDef<FeeSchedule>[] = [
    { header: "Año Académico", accessor: "yearName", sortable: true },
    { header: "Grado", accessor: "gradeName", sortable: true },
    { header: "Tipo de Cobro", accessor: "chargeTypeCode", sortable: true },
    {
      header: "Monto",
      accessor: "amount",
      render: (item) => `S/ ${item.amount.toFixed(2)}`,
      className: "text-right",
    },
  ];

  // Memoize fields to avoid re-creating on each render
  const fields = useMemo<FieldDef<FeeSchedule>[]>(() => {
    return [
      {
        name: "yearId",
        label: "Año Académico",
        type: "select",
        required: true,
        options: [{ label: "--- Seleccione ---", value: "" }, ...yearOptions],
      },
      {
        name: "gradeId",
        label: "Grado",
        type: "select",
        options: [{ label: "--- Seleccione ---", value: "" }, ...gradeOptions],
      },
      {
        name: "chargeTypeId",
        label: "Tipo de Cobro",
        type: "select",
        required: true,
        options: [{ label: "--- Seleccione ---", value: "" }, ...chargeTypeOptions],
      },
      {
        name: "amount",
        label: "Monto",
        type: "number",
        placeholder: "Ej. 150.00",
        required: true,
      },
    ];
  }, [yearOptions, gradeOptions, chargeTypeOptions]);

  return (
    <ApiCrudPage<FeeSchedule, FeeSchedulePayload>
      title="Tarifas"
      description="Configura los montos de cargos por año académico y grado."
      columns={columns}
      fields={fields}
      api={feeSchedulesService}
      emptyItem={emptyFeeSchedule}
      searchPlaceholder="Buscar tarifa..."
      newLabel="Nueva tarifa"
      onFormOpen={handleFormOpen}
      isFormLoading={isFormLoading}
    />
  );
}