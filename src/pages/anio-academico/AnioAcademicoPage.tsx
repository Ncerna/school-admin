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
import { academicYearsService } from "@/services/academic-years.service";
import { shiftsService } from "@/services/shifts.service";
import { ApiError } from "@/types/api";
import type { AnioAcademico, ColumnDef, Turno } from "@/types";

type AnioAcademicoPayload = Omit<AnioAcademico, "id">;

const emptyItem: AnioAcademicoPayload = {
  nombre: "",
  fechaInicio: "",
  fechaFin: "",
  estado: "Activo",
  estadoMatricula: "Activo",
  turnoIds: [],
};

export default function AnioAcademicoPage() {
  const resource = useCrudResource<AnioAcademico, AnioAcademicoPayload>(academicYearsService);
  const { options: turnoOptions } = useLookupOptions<Turno>(shiftsService, (t) => ({
    label: t.nombre,
    value: t.id,
  }));

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnioAcademico | null>(null);
  const [values, setValues] = useState<AnioAcademicoPayload>(emptyItem);
  const [deleteTarget, setDeleteTarget] = useState<AnioAcademico | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  useEffect(() => {
    if (formOpen) setValues(editingItem ?? emptyItem);
  }, [formOpen, editingItem]);

  const columns: ColumnDef<AnioAcademico>[] = [
    { header: "Año académico", accessor: "nombre", sortable: true },
    { header: "Inicio", accessor: "fechaInicio" },
    { header: "Fin", accessor: "fechaFin" },
    { header: "Matrícula", accessor: "estadoMatricula", render: (item) => <StatusBadge estado={item.estadoMatricula} /> },
    {
      header: "Estado",
      accessor: "estado",
      render: (item) => (
        <div className="flex items-center gap-2">
          <StatusBadge estado={item.estado} />
          {item.estado !== "Activo" && (
            <LoadingButton
              size="sm"
              variant="outline"
              isLoading={activatingId === item.id}
              onClick={async () => {
                setActivatingId(item.id);
                try {
                  await academicYearsService.activate(item.id);
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

  function toggleTurno(id: string) {
    setValues((prev) => ({
      ...prev,
      turnoIds: prev.turnoIds.includes(id) ? prev.turnoIds.filter((t) => t !== id) : [...prev.turnoIds, id],
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
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar año académico" : "Nuevo año académico"}</DialogTitle>
            <DialogDescription>Selecciona uno o varios turnos activos para este año.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label>Nombre</Label>
              <Input value={values.nombre} onChange={(e) => setValues((p) => ({ ...p, nombre: e.target.value }))} placeholder="Ej. 2026" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Fecha de inicio</Label>
                <Input type="date" value={values.fechaInicio} onChange={(e) => setValues((p) => ({ ...p, fechaInicio: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Fecha de finalización</Label>
                <Input type="date" value={values.fechaFin} onChange={(e) => setValues((p) => ({ ...p, fechaFin: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Estado de matrícula</Label>
              <Select value={values.estadoMatricula} onValueChange={(v) => setValues((p) => ({ ...p, estadoMatricula: v as "Activo" | "Inactivo" }))}>
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
              <div className="flex flex-col gap-2 rounded-md border p-3">
                {turnoOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={values.turnoIds.includes(option.value)}
                      onCheckedChange={() => toggleTurno(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
                {turnoOptions.length === 0 && (
                  <p className="text-xs text-muted-foreground">No hay turnos registrados todavía.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={resource.isSaving}>
              Cancelar
            </Button>
            <LoadingButton isLoading={resource.isSaving} onClick={handleSubmit}>
              <Save className="h-4 w-4" />
              {editingItem ? "Guardar cambios" : "Crear"}
            </LoadingButton>
          </DialogFooter>
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
