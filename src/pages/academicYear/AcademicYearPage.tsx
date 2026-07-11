import { useEffect, useState, useRef, useCallback } from "react";
import { Plus, Save, CheckCircle2, X } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { useCrudResource } from "@/hooks/useCrudResource";
import { useOptions } from "@/hooks/useOptions";
import { AcademicYearsService } from "@/services/academic-years.service";
import { ENDPOINTS } from "@/lib/endpoints";
import { ApiError } from "@/types/api";
import type { AcademicYear, ColumnDef, Shift } from "@/types";

type AcademicYearPayload = Omit<AcademicYear, "id">;

const emptyItem: AcademicYearPayload = {
  name: "",
  startDate: "",
  endDate: "",
  status: "Activo",
  enrollmentStatus: "OPEN",
  shiftIds: [],
  periodCount: 1,
};

export default function AcademicYearPage() {
  const resource = useCrudResource<AcademicYear, AcademicYearPayload>(AcademicYearsService);
  const mapShiftToOption = useCallback((t: Shift) => ({
    label: t.name,
    value: String(t.id),
  }), []);
  const { options: shiftOptions, isLoading: shiftsLoading, fetch: fetchShifts } = useOptions<Shift>(ENDPOINTS.shifts, mapShiftToOption);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicYear | null>(null);
  const [values, setValues] = useState<AcademicYearPayload>(emptyItem);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AcademicYear | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const hasFetchedShifts = useRef(false);

  // Cargar turnos cuando se abre el modal (solo una vez por apertura)
  useEffect(() => {
    if (formOpen) {
      // Ensure shiftIds are always numbers (API may return numbers)
      // Ensure periodCount has a default value
      const itemData = editingItem
        ? { ...editingItem, shiftIds: editingItem.shiftIds.map(Number), periodCount: editingItem.periodCount ?? 1 }
        : emptyItem;
      setValues(itemData);
      setFieldErrors({});
      setFormError(null);
      if (!hasFetchedShifts.current) {
        hasFetchedShifts.current = true;
        fetchShifts();
      }
    } else {
      hasFetchedShifts.current = false;
    }
  }, [formOpen, editingItem, fetchShifts]);

  const columns: ColumnDef<AcademicYear>[] = [
    { header: "Año académico", accessor: "name", sortable: true },
    { header: "Inicio", accessor: "startDate" },
    { header: "Fin", accessor: "endDate" },
    { header: "Matrícula", accessor: "enrollmentStatus", render: (item) => <StatusBadge estado={item.enrollmentStatus} /> },
    {
      header: "Estado",
      accessor: "status",
      render: (item) => (
        <div className="flex items-center gap-2">
          <StatusBadge estado={item.status} />
          {item.status !== "Activo" && (
            <LoadingButton
              size="sm"
              variant="outline"
              isLoading={activatingId === item.id}
              onClick={async () => {
                setActivatingId(item.id);
                try {
                  await AcademicYearsService.activate(item.id);
                  await resource.refetch();
                } finally {
                  setActivatingId(null);
                }
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Activar
            </LoadingButton>
          )}
        </div>
      ),
    },
  ];

  function toggleShift(id: number) {
    setValues((prev) => ({
      ...prev,
      shiftIds: prev.shiftIds.includes(id) ? prev.shiftIds.filter((t) => t !== id) : [...prev.shiftIds, id],
    }));
  }

  // Convert snake_case field names to camelCase for matching with form fields
  function convertFieldErrors(errors: Record<string, string[]>): Record<string, string[]> {
    const converted: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(errors)) {
      // Convert snake_case to camelCase (e.g., enrollment_status -> enrollmentStatus)
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      // For array fields like shift_ids.0, map to the base field (shiftIds)
      if (camelKey.startsWith("shiftIds")) {
        converted.shiftIds = converted.shiftIds ?? value;
      } else {
        converted[camelKey] = value;
      }
    }
    return converted;
  }

  async function handleSubmit() {
    setFieldErrors({});
    setFormError(null);
    try {
      if (editingItem) {
        await resource.update(editingItem.id, values);
      } else {
        await resource.create(values);
      }
      setFormOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          setFieldErrors(convertFieldErrors(err.errors));
        } else if (err.message) {
          // Handle API errors with message but no field errors (e.g., 409 Conflict)
          setFormError(err.message);
        }
      }
      // El mensaje ya queda expuesto en resource.error para mostrarlo en pantalla.
      if (!(err instanceof ApiError)) throw err;
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await resource.remove(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Se mantiene el diálogo abierto para reintentar
    }
  }


  return (
    <div>
      <PageHeader
        title="Años académicos"
        description="Organiza periodos académicos y turnos activos durante el año."
        action={
          <Button
            onClick={() => {
              setEditingItem(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nuevo año académico
          </Button>
        }
      />

      {resource.error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {resource.error}
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <SearchInput value={resource.search} onChange={resource.setSearch} placeholder="Buscar año académico..." />
      </div>

      <DataTable
        columns={columns}
        data={resource.items}
        onEdit={(item) => {
          setEditingItem(item);
          setFormOpen(true);
        }}
        onDelete={(item) => setDeleteTarget(item)}
        isLoading={resource.isLoading}
        deletingId={resource.deletingId}
        sortBy={resource.sortBy}
        sortDir={resource.sortDir}
        onSort={resource.toggleSort}
      />

      <Pagination pagination={resource.pagination} onPageChange={resource.setPage} disabled={resource.isLoading} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <div className="flex flex-col h-full">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar año académico" : "Nuevo año académico"}</DialogTitle>
              <DialogDescription>Selecciona uno o varios turnos activos para este año.</DialogDescription>
            </DialogHeader>

            <DialogBody className="grid gap-4">
              {formError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </div>
              )}
              <div className="grid gap-1.5">
                <Label>Nombre</Label>
                <Input value={values.name} onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))} placeholder="Ej. 2026" />
                {fieldErrors.name && (
                  <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>Fecha de inicio</Label>
                  <Input type="date" value={values.startDate} onChange={(e) => setValues((p) => ({ ...p, startDate: e.target.value }))} />
                  {fieldErrors.startDate && (
                    <p className="text-xs text-destructive">{fieldErrors.startDate[0]}</p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label>Fecha de finalización</Label>
                  <Input type="date" value={values.endDate} onChange={(e) => setValues((p) => ({ ...p, endDate: e.target.value }))} />
                  {fieldErrors.endDate && (
                    <p className="text-xs text-destructive">{fieldErrors.endDate[0]}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>Estado de matrícula</Label>
                  <Select value={values.enrollmentStatus} onValueChange={(v) => setValues((p) => ({ ...p, enrollmentStatus: v as "OPEN" | "CLOSED" }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Activo</SelectItem>
                      <SelectItem value="CLOSED">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.enrollmentStatus && (
                    <p className="text-xs text-destructive">{fieldErrors.enrollmentStatus[0]}</p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label>Cantidad de períodos</Label>
                  <Input
                    type="number"
                    min="1"
                    value={values.periodCount}
                    onChange={(e) => setValues((p) => ({ ...p, periodCount: parseInt(e.target.value) || 1 }))}
                    placeholder="Ej. 3"
                  />
                  {fieldErrors.periodCount && (
                    <p className="text-xs text-destructive">{fieldErrors.periodCount[0]}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Turnos activos</Label>
                <div className="flex max-h-60 flex-col gap-2 overflow-y-auto rounded-md border p-3">
                  {shiftsLoading ? (
                    <p className="text-xs text-muted-foreground">Cargando turnos...</p>
                  ) : (
                    shiftOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={values.shiftIds.includes(Number(option.value))}
                          onCheckedChange={() => toggleShift(Number(option.value))}
                        />
                        {option.label}
                      </label>
                    ))
                  )}
                  {!shiftsLoading && shiftOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">No hay turnos registrados todavía.</p>
                  )}
                </div>
                {fieldErrors.shiftIds && (
                  <p className="text-xs text-destructive">{fieldErrors.shiftIds[0]}</p>
                )}
              </div>
            </DialogBody>

            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)} disabled={resource.isSaving}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <LoadingButton isLoading={resource.isSaving} onClick={handleSubmit}>
                <Save className="h-4 w-4" />
                {editingItem ? "Guardar cambios" : "Crear"}
              </LoadingButton>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="¿Eliminar este año académico?"
        description="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        isLoading={resource.deletingId === deleteTarget?.id}
      />
    </div>
  );
}