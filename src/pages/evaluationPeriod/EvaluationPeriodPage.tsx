import { useState, useCallback } from "react";
import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { evaluationPeriodsService } from "@/services/evaluation-periods.service";
import { EvaluationPeriodFormDialog } from "./EvaluationPeriodFormDialog";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Search } from "lucide-react";
import type { ColumnDef, EvaluationPeriod, EvaluationPeriodPayload, AcademicYearOption, EvaluationTypeOption } from "@/types";

const columns: ColumnDef<EvaluationPeriod>[] = [
  
 
  { header: "Año Académico", accessor: "yearName", sortable: true },
   { header: "Cantidad de períodos", accessor: "periodsCount"},
  { header: "Tipo", accessor: "typeName", sortable: true },
  { header: "Fecha Inicio", accessor: "startDate" },
  { header: "Fecha Fin", accessor: "endDate" },
  { header: "Estado", accessor: "status", render: (item) => <StatusBadge estado={item.status} /> },

  {
    header: "Cursando",
    accessor: "isCurrent",
    render: (item) => (item.isCurrent ? "Sí" : "No"),
  },
];


export default function EvaluationPeriodPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [evaluationTypes, setEvaluationTypes] = useState<EvaluationTypeOption[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);

  const loadOptions = useCallback(async () => {
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
  }, []);

  return (
    <ApiCrudPage<EvaluationPeriod, EvaluationPeriodPayload>
      title="Períodos de Evaluación"
      description="Configura y gestiona los períodos de evaluación académica."
      columns={columns}
      fields={[]}
      api={evaluationPeriodsService}
      emptyItem={{} as EvaluationPeriodPayload}
      searchPlaceholder="Buscar períodos..."
      newLabel="Nuevo período"
      onFormOpen={loadOptions}
      isFormLoading={isOptionsLoading}
      filterComponent={({ setExtraParams, search, setSearch, refetch, searchPlaceholder }) => (
        <div className="mb-4 flex items-center justify-end gap-2">
          <Select value={selectedYearId} onValueChange={(value) => {
            setSelectedYearId(value);
            setExtraParams({ yearId: value || undefined, evaluationTypeId: selectedTypeId || undefined });
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Año académico" />
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

          <Select value={selectedTypeId} onValueChange={(value) => {
            setSelectedTypeId(value);
            setExtraParams({ yearId: selectedYearId || undefined, evaluationTypeId: value || undefined });
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
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

          <SearchInput value={search} onChange={setSearch} placeholder={searchPlaceholder} />
          <Button variant="outline" size="icon" aria-label="Buscar" onClick={refetch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      )}
      renderFormDialog={({ open, onOpenChange, editingItem, isSaving, refetch }) => (
        <EvaluationPeriodFormDialog
          open={open}
          onOpenChange={onOpenChange}
          editingItem={editingItem}
          academicYears={academicYears}
          evaluationTypes={evaluationTypes}
          isOptionsLoading={isOptionsLoading}
          onSuccess={() => {
            onOpenChange(false);
            refetch();
          }}
        />
      )}
    />
  );
}