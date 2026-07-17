import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Search } from "lucide-react";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
import { paymentsReportService } from "@/services/payments-report.service";
import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/SearchInput";
import { Card, CardContent } from "@/components/ui/card";
import type { ColumnDef, PaymentReportRow, PaymentReportSummary } from "@/types";

// Charge type labels mapping
const chargeTypeLabels: Record<string, string> = {
  ENROLLMENT: "Matrícula",
  TUITION: "Pensión",
  SUPPLIES: "Útiles",
};

// Get default date range (last 30 days)
function getDefaultDateRange() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  return {
    dateFrom: thirtyDaysAgo.toISOString().split("T")[0],
    dateTo: today.toISOString().split("T")[0],
  };
}

// Format concept: combines chargeType with period/installmentNumber
function formatConcept(row: PaymentReportRow): string {
  const typeLabel = chargeTypeLabels[row.chargeType] || row.chargeType;
  const details = row.period || (row.installmentNumber ? `Cuota ${row.installmentNumber}` : "");
  return details ? `${typeLabel} — ${details}` : typeLabel;
}

// Columns for the report table
const columns: ColumnDef<PaymentReportRow>[] = [
  { 
    header: "Fecha", 
    accessor: "paidAt",
    render: (item) => new Date(item.paidAt).toLocaleDateString()
  },
  { 
    header: "Estudiante", 
    accessor: "student",
    sortable: true
  },
  { 
    header: "Concepto", 
    accessor: "chargeType",
    render: (item) => formatConcept(item)
  },
  { 
    header: "Monto aplicado", 
    accessor: "amount",
    render: (item) => `S/ ${item.amount.toFixed(2)}`,
    className: "text-right"
  },
  { header: "Método", accessor: "method" },
  { header: "Cobrado por", accessor: "collectedBy" },
  { 
    header: "Referencia", 
    accessor: "reference",
    render: (item) => item.reference || "—"
  },
];

// API wrapper for ApiCrudPage (read-only report)
const reportApi = {
  list: (params: any) => paymentsReportService.get(params),
  create: async () => { throw new Error("Not implemented"); },
  update: async () => { throw new Error("Not implemented"); },
  remove: async () => { throw new Error("Not implemented"); },
};

export default function PaymentsReportPage() {
  // Default date range
  const { dateFrom: defaultFrom, dateTo: defaultTo } = getDefaultDateRange();
  
  // Date filters
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(defaultTo);
  
  // Load options for filters (useOptions auto-fetches on mount)
  const mapPaymentMethodToOption = useCallback((m: { id: number; name: string }) => ({
    label: m.name,
    value: String(m.id),
  }), []);
  
  const mapChargeTypeToOption = useCallback((t: { id: number; name: string }) => ({
    label: t.name,
    value: String(t.id),
  }), []);

  const { options: paymentMethodOptions, isLoading: methodsLoading } = useOptions<{ id: number; name: string }>(
    ENDPOINTS.paymentMethods,
    mapPaymentMethodToOption,
    true // Auto-fetch on mount for filter dropdowns
  );
  const { options: chargeTypeOptions, isLoading: typesLoading } = useOptions<{ id: number; name: string }>(
    ENDPOINTS.chargeTypes,
    mapChargeTypeToOption,
    true // Auto-fetch on mount for filter dropdowns
  );

  // Summary component
  function renderSummary(summary: PaymentReportSummary) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-sm font-medium">
            Total del periodo filtrado: <span className="text-lg font-bold">S/ {summary.totalAmount.toFixed(2)}</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ApiCrudPage<PaymentReportRow, never>
      title="Reporte de pagos"
      description="Vista de solo lectura para verificar pagos registrados."
      columns={columns}
      fields={[]}
      api={reportApi}
      emptyItem={{} as never}
      searchPlaceholder="Buscar estudiante..."
      readOnly={true}
      filterComponent={({ setExtraParams, search, setSearch, refetch, searchPlaceholder, setPage }) => {
        return (
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="dateFrom">Fecha desde</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  const newDateFrom = e.target.value;
                  setDateFrom(newDateFrom);
                  setExtraParams({ dateFrom: newDateFrom, dateTo });
                  setPage(1);
                }}
                className="w-[160px]"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="dateTo">Fecha hasta</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  const newDateTo = e.target.value;
                  setDateTo(newDateTo);
                  setExtraParams({ dateFrom, dateTo: newDateTo });
                  setPage(1);
                }}
                className="w-[160px]"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="paymentMethodId">Método de pago</Label>
              <Select
                value={""}
                onValueChange={(v) => {
                  setExtraParams({ paymentMethodId: v ? Number(v) : undefined, dateFrom, dateTo });
                  setPage(1);
                }}
                disabled={methodsLoading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos los métodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los métodos</SelectItem>
                  {paymentMethodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="chargeTypeId">Tipo de cargo</Label>
              <Select
                value={""}
                onValueChange={(v) => {
                  setExtraParams({ chargeTypeId: v ? Number(v) : undefined, dateFrom, dateTo });
                  setPage(1);
                }}
                disabled={typesLoading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  {chargeTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="studentSearch">Buscar estudiante</Label>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={searchPlaceholder}
              />
            </div>

            <Button variant="outline" size="icon" aria-label="Buscar" onClick={() => {
              setPage(1);
            }}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        );
      }}
      summaryComponent={renderSummary}
    />
  );
}