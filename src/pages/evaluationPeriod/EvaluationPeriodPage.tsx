import { useState, useEffect, useRef } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { evaluationPeriodsService } from "@/services/evaluation-periods.service";
import { EvaluationPeriodFormDialog } from "./EvaluationPeriodFormDialog";
import type { ColumnDef, EvaluationPeriod, AcademicYearOption, EvaluationTypeOption } from "@/types";
import { ApiError } from "@/types/api";

export default function EvaluationPeriodPage() {
  const [deleteTarget, setDeleteTarget] = useState<EvaluationPeriod | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EvaluationPeriod | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [evaluationTypes, setEvaluationTypes] = useState<EvaluationTypeOption[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);

  // List state
  const [items, setItems] = useState<EvaluationPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // Use a ref to track if this is the first render to avoid double fetch in StrictMode
  const isFirstRender = useRef(true);

  // Load options and data on first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      loadOptions();
      fetchList();
    }
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (!isFirstRender.current) {
      fetchList();
    }
  }, [selectedYearId, selectedTypeId, debouncedSearch]);

  async function loadOptions() {
    setIsOptionsLoading(true);
    try {
      const [years, types] = await Promise.all([
        evaluationPeriodsService.getAcademicYearsOptions(),
        evaluationPeriodsService.getEvaluationTypesOptions(),
      ]);
      setAcademicYears(years);
      setEvaluationTypes(types);
    } catch {
      // Error handled by error state
    } finally {
      setIsOptionsLoading(false);
    }
  }

  async function fetchList() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await evaluationPeriodsService.list({
        yearId: selectedYearId || undefined,
        evaluationTypeId: selectedTypeId || undefined,
      });
      setItems(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar la información.");
    } finally {
      setIsLoading(false);
    }
  }

  const columns: ColumnDef<EvaluationPeriod>[] = [
    { header: "Código", accessor: "code", sortable: true },
    { header: "Período", accessor: "name", sortable: true },
    { header: "Año Académico", accessor: "academicYear", sortable: true },
    { header: "Tipo", accessor: "typeName", sortable: true },
    { header: "Fecha Inicio", accessor: "startDate" },
    { header: "Fecha Fin", accessor: "endDate" },
    {
      header: "Cursando",
      accessor: "isCurrent",
      render: (item) => (item.isCurrent ? "Sí" : "No"),
    },
  ];

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await evaluationPeriodsService.remove(deleteTarget.id);
      setDeleteTarget(null);
      fetchList();
    } catch {
      // se mantiene abierto el diálogo para reintentar
    }
  }

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(item: EvaluationPeriod) {
    setEditingItem(item);
    setFormOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Períodos de Evaluación"
        description="Configura y gestiona los períodos de evaluación académica."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nuevo período
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex items-end justify-end gap-4">
        <div className="w-64">
          <Select value={selectedYearId} onValueChange={setSelectedYearId}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por año académico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los años</SelectItem>
              {academicYears.map((year) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-64">
          <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los tipos</SelectItem>
              {evaluationTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar períodos..."
        />
        <Button variant="outline" size="icon" aria-label="Buscar" onClick={fetchList}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        onEdit={openEdit}
        onDelete={(item) => setDeleteTarget(item)}
        emptyMessage={search ? "No se encontraron resultados." : "No hay períodos de evaluación registrados todavía."}
        isLoading={isLoading}
        deletingId={deletingId}
        currentPage={1}
        itemsPerPage={10}
      />

      <EvaluationPeriodFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingItem={editingItem}
        academicYears={academicYears}
        evaluationTypes={evaluationTypes}
        isOptionsLoading={isOptionsLoading}
        onSuccess={() => {
          fetchList();
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="¿Eliminar este período de evaluación?"
        description="Esta acción no se puede deshacer. El período será marcado como inactivo."
        onConfirm={handleDelete}
        isLoading={deletingId === deleteTarget?.id}
      />
    </div>
  );
}