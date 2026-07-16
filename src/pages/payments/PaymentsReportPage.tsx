import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Search } from "lucide-react";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
import { paymentsReportService } from "@/services/payments-report.service";
import { useCrudResource } from "@/hooks/useCrudResource";
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

// API wrapper for useCrudResource (read-only report)
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
  // Use useCallback to prevent infinite loop in useOptions hook
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

  // Use the hook with summary support
  const {
    items: reportRows,
    pagination,
    page,
    setPage,
    search,
    setSearch,
    isLoading,
    error,
    refetch,
    setExtraParams,
    summary,
  } = useCrudResource<PaymentReportRow, never, PaymentReportSummary>(reportApi, {
    limit: 10,
  });

  // Update extraParams when date filters change (only on mount and when dates actually change)
  // Use ref to avoid infinite loop from setExtraParams being a dependency
  const prevDateFromRef = useRef<string | null>(null);
  const prevDateToRef = useRef<string | null>(null);
  const setExtraParamsRef = useRef(setExtraParams);
  
  // Keep the ref updated
  useEffect(() => {
    setExtraParamsRef.current = setExtraParams;
  }, [setExtraParams]);
  
  useEffect(() => {
    // Only update if dates actually changed
    if (prevDateFromRef.current !== dateFrom || prevDateToRef.current !== dateTo) {
      prevDateFromRef.current = dateFrom;
      prevDateToRef.current = dateTo;
      setExtraParamsRef.current({ dateFrom, dateTo });
    }
  }, [dateFrom, dateTo]);

  // Group rows by paymentId for visual grouping
  const groupedRows = useMemo(() => {
    const groups: Record<number, PaymentReportRow[]> = {};
    reportRows.forEach((row) => {
      if (!groups[row.paymentId]) {
        groups[row.paymentId] = [];
      }
      groups[row.paymentId].push(row);
    });
    return groups;
  }, [reportRows]);

  // Custom render for table with grouping
  function renderReportTable() {
    if (isLoading) {
      return (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      );
    }

    if (reportRows.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm font-medium">No hay registros de pagos.</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((col) => (
                <th key={String(col.accessor)} className={`px-4 py-2 text-left text-sm font-medium ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportRows.map((row, index) => {
              const isFirstInGroup = index === 0 || reportRows[index - 1].paymentId !== row.paymentId;
              const isLastInGroup = index === reportRows.length - 1 || reportRows[index + 1].paymentId !== row.paymentId;
              
              return (
                <tr 
                  key={index} 
                  className={`border-b ${isFirstInGroup ? "border-t-2 border-t-primary/20" : ""} ${isLastInGroup ? "border-b-2" : ""}`}
                >
                  {columns.map((col) => (
                    <td key={String(col.accessor)} className={`px-4 py-2 text-sm ${col.className || ""}`}>
                      {col.render ? col.render(row) : String(row[col.accessor] ?? "—")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reporte de pagos</h1>
      <p className="text-sm text-muted-foreground">
        Vista de solo lectura para verificar pagos registrados.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="dateFrom">Fecha desde</Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
              refetch();
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
              setDateTo(e.target.value);
              setPage(1);
              refetch();
            }}
            className="w-[160px]"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="paymentMethodId">Método de pago</Label>
          <Select
            value={""}
            onValueChange={(v) => {
              setExtraParams({ paymentMethodId: v ? Number(v) : undefined });
              setPage(1);
              refetch();
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
              setExtraParams({ chargeTypeId: v ? Number(v) : undefined });
              setPage(1);
              refetch();
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
            placeholder="Nombre o DNI..."
          />
        </div>

        <Button variant="outline" size="icon" aria-label="Buscar" onClick={() => {
          setPage(1);
          refetch();
        }}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary Card */}
      {summary && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium">
              Total del periodo filtrado: <span className="text-lg font-bold">S/ {summary.totalAmount.toFixed(2)}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Report Table */}
      {renderReportTable()}

      {/* Pagination */}
      {pagination.totalPage > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm py-1">
            Página {page} de {pagination.totalPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPage}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}