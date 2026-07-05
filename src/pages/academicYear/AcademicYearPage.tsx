import { useEffect, useState } from "react";
import { Plus, Save, CheckCircle2 } from "lucide-react";
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
import { useLookupOptions } from "@/hooks/useLookupOptions";
import { AcademicYearsService } from "@/services/academic-years.service";
import { shiftsService } from "@/services/shifts.service";
import { ApiError } from "@/types/api";
import type { AcademicYear, ColumnDef, Shift } from "@/types";

type AcademicYearPayload = Omit<AcademicYear, "id">;

const emptyItem: AcademicYearPayload = {
  name: "",
  startDate: "",
  endDate: "",
  status: "Activo",
  enrollmentStatus: "Activo",
  shiftIds: [],
};

export default function AcademicYearPage() {
  const resource = useCrudResource<AcademicYear, AcademicYearPayload>(AcademicYearsService);
  const { options: shiftOptions } = useLookupOptions<Shift>(shiftsService, (t) => ({
    label: t.name,
    value: t.id,
  }));

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicYear | null>(null);
  const [values, setValues] = useState<AcademicYearPayload>(emptyItem);
  const [deleteTarget, setDeleteTarget] = useState<AcademicYear | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  useEffect(() => {
    if (formOpen) setValues(editingItem ?? emptyItem);
  }, [formOpen, editingItem]);

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

  function toggleShift(id: string) {
    setValues((prev) => ({
      ...prev,
      shiftIds: prev.shiftIds.includes(id) ? prev.shiftIds.filter((t) => t !== id) : [...prev.shiftIds, id],
    }));
  }

  async function handleSubmit() {
    try {
      if (editingItem) {
        await resource.update(editingItem.id, values);
      } else {
        await resource.create(values);
      }
      setFormOpen(false);
    } catch (err) {
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
      // se mantiene el diálogo abierto para reintentar
    }
  }

  return (
    <div>
      <PageHeader
        title="Años académicos"
        description="Organiza los períodos lectivos y los turnos activos por año."
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
              <div className="grid gap-1.5">
                <Label>Nombre</Label>
                <Input value={values.name} onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))} placeholder="Ej. 2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>Fecha de inicio</Label>
                  <Input type="date" value={values.startDate} onChange={(e) => setValues((p) => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Fecha de finalización</Label>
                  <Input type="date" value={values.endDate} onChange={(e) => setValues((p) => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Estado de matrícula</Label>
                <Select value={values.enrollmentStatus} onValueChange={(v) => setValues((p) => ({ ...p, enrollmentStatus: v as "Activo" | "Inactivo" }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Turnos activos</Label>
                <div className="flex max-h-60 flex-col gap-2 overflow-y-auto rounded-md border p-3">
                  {shiftOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={values.shiftIds.includes(option.value)}
                        onCheckedChange={() => toggleShift(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                  {shiftOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">No hay turnos registrados todavía.</p>
                  )}
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)} disabled={resource.isSaving}>
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