import { useState, useCallback } from "react";
import { ApiCrudPage } from "@/components/shared/ApiCrudPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { enrollmentsService } from "@/services/enrollments.service";
import { useOptions } from "@/hooks/useOptions";
import { ENDPOINTS } from "@/lib/endpoints";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/SearchInput";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/common/LoadingButton";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AsyncSelectField } from "@/components/common/AsyncSelectField";
import { useToast } from "@/components/ui/toast";
import type { ColumnDef, EnrollmentListItem, EnrollmentPreview, EnrollmentConfirmed, EnrollmentPayload, GeneratedCharge } from "@/types";

// Columns for the enrollment table
const columns: ColumnDef<EnrollmentListItem>[] = [
  { header: "Estudiante", accessor: "studentName", sortable: true },
  { header: "Grado", accessor: "gradeName", sortable: true },
  { header: "Año", accessor: "yearName", sortable: true },
  { 
    header: "Fecha de matrícula", 
    accessor: "enrolledAt",
    render: (item) => new Date(item.enrolledAt).toLocaleDateString()
  },
  { header: "Estado", accessor: "status", render: (item) => <StatusBadge estado={item.status} /> },
];

// Charge type labels
const chargeTypeLabels: Record<string, string> = {
  ENROLLMENT: "Matrícula",
  TUITION: "Pensión",
  SUPPLIES: "Útiles",
};

// Columns for the preview/confirm charges table
const chargeColumns: ColumnDef<GeneratedCharge>[] = [
  { 
    header: "Tipo", 
    accessor: "chargeType",
    render: (item) => chargeTypeLabels[item.chargeType || item.charge_type] || item.chargeType || item.charge_type
  },
  { 
    header: "Cuota", 
    accessor: "installmentNumber",
    render: (item) => item.quota ?? (item.installmentNumber ?? item.installment_number ?? "-")
  },
  { header: "Periodo", accessor: "period", render: (item) => item.period || "-" },
  { 
    header: "Monto", 
    accessor: "amount",
    render: (item) => `S/ ${item.amount.toFixed(2)}`,
    className: "text-right"
  },
  { 
    header: "Vencimiento", 
    accessor: "dueDate",
    render: (item) => new Date((item.dueDate || item.due_date) || "").toLocaleDateString()
  },
];

// Enrollment form dialog (modal)
function EnrollmentFormDialog({
  open,
  onOpenChange,
  yearOptions,
  gradeOptions,
  isFormLoading,
  onPreview,
  onConfirm,
  previewData,
  confirmedData,
  viewState,
  setViewState,
  error,
  onRegisterPayment,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  yearOptions: { value: string; label: string }[];
  gradeOptions: { value: string; label: string }[];
  isFormLoading: boolean;
  onPreview: (payload: EnrollmentPayload) => Promise<void>;
  onConfirm: (payload: EnrollmentPayload) => Promise<void>;
  previewData: EnrollmentPreview | null;
  confirmedData: EnrollmentConfirmed | null;
  viewState: "form" | "review" | "success";
  setViewState: (state: "form" | "review" | "success") => void;
  error: string | null;
  onRegisterPayment?: (enrollmentId: string, enrollmentInstallments: number) => void;
  onSuccess?: () => void;
}) {
  const [formValues, setFormValues] = useState<EnrollmentPayload>({
    studentId: "",
    gradeId: "",
    yearId: "",
    enrolledAt: new Date().toISOString().split("T")[0],
    willPayTuition: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstallments, setShowInstallments] = useState(false);

  // Reset form when dialog opens
  // Note: This is handled by the parent component via onFormOpen callback

  async function handlePreview() {
    setIsSubmitting(true);
    try {
      const payload: EnrollmentPayload = {
        ...formValues,
        enrollmentInstallments: showInstallments ? formValues.enrollmentInstallments : undefined,
      };
      await onPreview(payload);
    } catch (err) {
      console.error("Preview error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

async function handleConfirm() {
    setIsSubmitting(true);
    try {
      const payload: EnrollmentPayload = {
        ...formValues,
        enrollmentInstallments: showInstallments ? formValues.enrollmentInstallments : undefined,
      };
      await onConfirm(payload);
      // Close dialog and show toast on success
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Confirm error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <div className="flex flex-col h-full">
          <DialogHeader>
            <DialogTitle>
              {viewState === "form" && "Nueva matrícula"}
              {viewState === "review" && "Revisar matrícula"}
              {viewState === "success" && "Matrícula confirmada"}
            </DialogTitle>
            <DialogDescription>
              {viewState === "form" && "Complete los datos para crear la matrícula."}
              {viewState === "review" && "Verifique los cargos que se generarán."}
              {viewState === "success" && "La matrícula se ha confirmado exitosamente."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="grid gap-4">
            {viewState === "form" && (
              <>
                <AsyncSelectField
                  name="studentId"
                  label="Estudiante"
                  value={formValues.studentId}
                  onChange={(v) => setFormValues((p) => ({ ...p, studentId: v }))}
                  placeholder="Buscar estudiante por nombre o DNI..."
                  required
                  disabled={isFormLoading || isSubmitting}
                  searchEndpoint={ENDPOINTS.students}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="yearId">Año Académico *</Label>
                    <Select
                      value={formValues.yearId}
                      onValueChange={(v) => setFormValues((p) => ({ ...p, yearId: v }))}
                      disabled={isFormLoading || isSubmitting}
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
                    <Label htmlFor="gradeId">Grado *</Label>
                    <Select
                      value={formValues.gradeId}
                      onValueChange={(v) => setFormValues((p) => ({ ...p, gradeId: v }))}
                      disabled={isFormLoading || isSubmitting}
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
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="enrolledAt">Fecha de matrícula *</Label>
                  <Input
                    id="enrolledAt"
                    type="date"
                    value={formValues.enrolledAt}
                    onChange={(e) => setFormValues((p) => ({ ...p, enrolledAt: e.target.value }))}
                    disabled={isFormLoading || isSubmitting}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="installments"
                    checked={showInstallments}
                    onCheckedChange={(checked) => setShowInstallments(checked as boolean)}
                    disabled={isFormLoading || isSubmitting}
                  />
                  <Label htmlFor="installments">¿Matrícula en cuotas?</Label>
                </div>

                {showInstallments && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="enrollmentInstallments">Número de cuotas *</Label>
                    <Input
                      id="enrollmentInstallments"
                      type="number"
                      min="2"
                      value={formValues.enrollmentInstallments || ""}
                      onChange={(e) => setFormValues((p) => ({ ...p, enrollmentInstallments: Number(e.target.value) }))}
                      disabled={isFormLoading || isSubmitting}
                      required
                    />
                  </div>
                )}

                <div className="grid gap-1.5">
                  <Label htmlFor="willPayTuition">¿Pagará pensiones mensuales? *</Label>
                  <Select
                    value={formValues.willPayTuition ? "true" : "false"}
                    onValueChange={(v) => setFormValues((p) => ({ ...p, willPayTuition: v === "true" }))}
                    disabled={isFormLoading || isSubmitting}
                  >
                    <SelectTrigger id="willPayTuition">
                      <SelectValue placeholder="Seleccionar opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sí</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
              </>
            )}

            {viewState === "review" && previewData && (
              <>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Estudiante:</strong> {previewData.studentName || previewData.student_name}
                  </div>
                  <div>
                    <strong>Grado:</strong> {previewData.gradeName || previewData.grade_name}
                  </div>
                  <div>
                    <strong>Año:</strong> {previewData.yearName || previewData.year_name}
                  </div>
                </div>

                <div className="rounded-lg border bg-card">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        {chargeColumns.map((col) => (
                          <th key={String(col.accessor)} className={`px-4 py-2 text-left text-sm font-medium ${col.className || ""}`}>
                            {col.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.charges.map((item, index) => (
                        <tr key={index} className="border-b">
                          {chargeColumns.map((col) => (
                            <td key={String(col.accessor)} className={`px-4 py-2 text-sm ${col.className || ""}`}>
                              {col.render ? col.render(item) : String(item[col.accessor] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.charges.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay cargos generados.</p>
                )}
              </>
            )}

            {viewState === "success" && confirmedData && (
              <>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Estudiante:</strong> {confirmedData.studentName || confirmedData.student_name}
                  </div>
                  <div>
                    <strong>Grado:</strong> {confirmedData.gradeName || confirmedData.grade_name}
                  </div>
                  <div>
                    <strong>Año:</strong> {confirmedData.yearName || confirmedData.year_name}
                  </div>
                </div>

                <div className="rounded-lg border bg-card">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        {chargeColumns.map((col) => (
                          <th key={String(col.accessor)} className={`px-4 py-2 text-left text-sm font-medium ${col.className || ""}`}>
                            {col.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {confirmedData.charges.map((item, index) => (
                        <tr key={index} className="border-b">
                          {chargeColumns.map((col) => (
                            <td key={String(col.accessor)} className={`px-4 py-2 text-sm ${col.className || ""}`}>
                              {col.render ? col.render(item) : String(item[col.accessor] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {confirmedData.charges.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay cargos generados.</p>
                )}
              </>
            )}
          </DialogBody>

          <DialogFooter>
            {viewState === "form" && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || isFormLoading}>
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <LoadingButton
                  isLoading={isSubmitting || isFormLoading}
                  onClick={handlePreview}
                  disabled={!formValues.studentId || !formValues.yearId || !formValues.gradeId}
                >
                  Continuar
                </LoadingButton>
              </>
            )}

            {viewState === "review" && (
              <>
                <Button variant="outline" onClick={() => setViewState("form")} disabled={isSubmitting}>
                  Volver a editar
                </Button>
                <LoadingButton
                  isLoading={isSubmitting}
                  onClick={handleConfirm}
                >
                  Confirmar matrícula
                </LoadingButton>
              </>
            )}

{viewState === "success" && (
              <>
                <Button variant="outline" onClick={() => {
                  onOpenChange(false);
                  onSuccess?.();
                }}>
                  Cerrar
                </Button>
                <Button onClick={() => window.open(confirmedData?.pdfUrl || confirmedData?.pdf_url || "", "_blank")}>
                  Descargar PDF
                </Button>
                {onRegisterPayment && (
                  <Button onClick={() => onRegisterPayment(confirmedData?.id || "", formValues.enrollmentInstallments || 0)}>
                    Registrar pago
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EnrollmentFormPage() {
  const { showToast } = useToast();
  
  // Load options for filters (auto-fetch on mount)
  const { options: filterYearOptions, isLoading: filterYearsLoading } = useOptions<{ id: string; name: string }>(
    ENDPOINTS.AcademicYears,
    (n) => ({ label: n.name, value: String(n.id) }),
    true // Auto-fetch for filter dropdowns
  );
  const { options: filterGradeOptions, isLoading: filterGradesLoading } = useOptions<{ id: string; name: string }>(
    ENDPOINTS.grades,
    (g) => ({ label: g.name, value: String(g.id) }),
    true // Auto-fetch for filter dropdowns
  );

  // Load options for the form (lazy loading)
  const { options: formYearOptions, isLoading: formYearsLoading, fetch: fetchYears } = useOptions<{ id: string; name: string }>(
    ENDPOINTS.AcademicYears,
    (n) => ({ label: n.name, value: String(n.id) })
  );
  const { options: formGradeOptions, isLoading: formGradesLoading, fetch: fetchGrades } = useOptions<{ id: string; name: string }>(
    ENDPOINTS.grades,
    (g) => ({ label: g.name, value: String(g.id) })
  );

  // Callback to load options when the form dialog opens
  const handleFormOpen = useCallback(() => {
    fetchYears();
    fetchGrades();
  }, [fetchYears, fetchGrades]);

  // Combined loading state for the form
  const isFormLoading = formYearsLoading || formGradesLoading;

  // Form state
  const [previewData, setPreviewData] = useState<EnrollmentPreview | null>(null);
  const [confirmedData, setConfirmedData] = useState<EnrollmentConfirmed | null>(null);
  const [viewState, setViewState] = useState<"form" | "review" | "success">("form");
  const [error, setError] = useState<string | null>(null);

  // Handle preview
  async function handlePreview(payload: EnrollmentPayload) {
    setError(null);
    try {
      const response = await enrollmentsService.preview(payload);
      setPreviewData(response);
      setViewState("review");
    } catch (err: any) {
      setError(err.message || "Error al previsualizar la matrícula");
    }
  }

// Handle confirm
  async function handleConfirm(payload: EnrollmentPayload) {
    setError(null);
    try {
      const response = await enrollmentsService.confirm(payload);
      setConfirmedData(response);
      setViewState("success");
    } catch (err: any) {
      setError(err.message || "Error al confirmar la matrícula");
    }
  }

  // Handle success - show toast and close dialog
  function handleSuccess() {
    showToast("Matrícula confirmada exitosamente", "success");
    setViewState("form");
    setPreviewData(null);
    setConfirmedData(null);
  }

  // Handle register payment
  function handleRegisterPayment(enrollmentId: string, enrollmentInstallments: number) {
    // If there are installments, go to enrollment payment page, otherwise go to generic payment page
    if (enrollmentInstallments > 0) {
      window.location.href = `/pagos/matricula/${enrollmentId}`;
    } else {
      window.location.href = `/pagos/registrar/${enrollmentId}`;
    }
  }

  return (
    <>
      <ApiCrudPage<EnrollmentListItem>
        title="Matrículas"
        description="Gestiona las matrículas de estudiantes."
        columns={columns}
        fields={[]}
        api={enrollmentsService}
        emptyItem={{ studentName: "", gradeName: "", yearName: "", enrolledAt: "", status: "Activo" }}
        searchPlaceholder="Buscar matrícula..."
        newLabel="Nueva matrícula"
        onFormOpen={handleFormOpen}
        isFormLoading={isFormLoading}
        filterComponent={({ setExtraParams, search, setSearch, refetch, searchPlaceholder }) => (
          <div className="mb-4 flex items-center justify-end gap-2">
            <Select value={""} onValueChange={(v) => setExtraParams({ yearId: v || undefined })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Año académico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los años</SelectItem>
                {filterYearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={""} onValueChange={(v) => setExtraParams({ gradeId: v || undefined })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Grado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los grados</SelectItem>
                {filterGradeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
renderFormDialog={({ open, onOpenChange, refetch }) => (
          <EnrollmentFormDialog
            open={open}
            onOpenChange={onOpenChange}
            yearOptions={formYearOptions}
            gradeOptions={formGradeOptions}
            isFormLoading={isFormLoading}
            onPreview={handlePreview}
            onConfirm={handleConfirm}
            previewData={previewData}
            confirmedData={confirmedData}
            viewState={viewState}
            setViewState={setViewState}
            error={error}
            onRegisterPayment={handleRegisterPayment}
            onSuccess={() => {
              showToast("Matrícula confirmada exitosamente", "success");
              setViewState("form");
              setPreviewData(null);
              setConfirmedData(null);
              refetch();
            }}
          />
        )}
      />
    </>
  );
}