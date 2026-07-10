import { useState, useCallback } from "react";
import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { evaluationPeriodsService } from "@/services/evaluation-periods.service";
import { EvaluationPeriodFormDialog } from "./EvaluationPeriodFormDialog";
import type { ColumnDef, EvaluationPeriod, EvaluationPeriodPayload, AcademicYearOption, EvaluationTypeOption } from "@/types";

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

export default function EvaluationPeriodPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [evaluationTypes, setEvaluationTypes] = useState<EvaluationTypeOption[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);

  const loadOptions = useCallback(async () => {
      console.log("loadOptions");
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
      filterComponent={({ setExtraParams }) => (
        <div className="mb-4 flex items-end justify-end gap-4">
          <div className="w-64">
            <Select value={selectedYearId} onValueChange={(value) => {
              setSelectedYearId(value);
              setExtraParams({ yearId: value || undefined, evaluationTypeId: selectedTypeId || undefined });
            }}>
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
            <Select value={selectedTypeId} onValueChange={(value) => {
              setSelectedTypeId(value);
              setExtraParams({ yearId: selectedYearId || undefined, evaluationTypeId: value || undefined });
            }}>
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
        </div>
      )}
      renderFormDialog={({ open, onOpenChange, editingItem, isSaving }) => (
        <EvaluationPeriodFormDialog
          open={open}
          onOpenChange={onOpenChange}
          editingItem={editingItem}
          academicYears={academicYears}
          evaluationTypes={evaluationTypes}
          isOptionsLoading={isOptionsLoading}
          onSuccess={() => {
            onOpenChange(false);
          }}
        />
      )}
    />
  );
}
