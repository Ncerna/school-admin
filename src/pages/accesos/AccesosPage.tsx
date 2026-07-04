import { useEffect, useState } from "react";
import { KeyRound, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { useCrudResource } from "@/hooks/useCrudResource";
import { rolesService } from "@/services/roles.service";
import { ApiError } from "@/types/api";
import type { ColumnDef, MenuAcceso, Rol } from "@/types";

// Los roles se listan pero no se crean/editan/eliminan desde esta pantalla
// (RF-HU-006 solo pide gestionar accesos), así que reutilizamos el hook de
// paginación/búsqueda con acciones de escritura deshabilitadas.
const noopApi = {
  create: async () => {
    throw new Error("not supported");
  },
  update: async () => {
    throw new Error("not supported");
  },
  remove: async () => {
    throw new Error("not supported");
  },
};

export default function AccesosPage() {
  const resource = useCrudResource<Rol>({ list: rolesService.list, ...noopApi });

  const [selectedRole, setSelectedRole] = useState<Rol | null>(null);
  const [menus, setMenus] = useState<MenuAcceso[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedRole) return;
    setIsLoadingMenus(true);
    setError(null);
    setSuccessMessage(null);
    rolesService
      .getAccessList(selectedRole.id)
      .then(setMenus)
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudo cargar los accesos."))
      .finally(() => setIsLoadingMenus(false));
  }, [selectedRole]);

  function toggleMenu(id: string) {
    setMenus((prev) => prev.map((m) => (m.id === id ? { ...m, asignado: !m.asignado } : m)));
  }

  async function handleSave() {
    if (!selectedRole) return;
    setIsSaving(true);
    setError(null);
    try {
      const menuIds = menus.filter((m) => m.asignado).map((m) => m.id);
      await rolesService.updateAccessList(selectedRole.id, menuIds);
      setSuccessMessage("Accesos actualizados correctamente.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  }

  const columns: ColumnDef<Rol>[] = [
    { header: "Rol", accessor: "nombre", sortable: true },
    { header: "Descripción", accessor: "descripcion", render: (item) => item.descripcion || "—" },
    {
      header: "Acción",
      accessor: "id",
      render: (item) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedRole(item)}>
          <KeyRound className="h-3.5 w-3.5" />
          Gestionar accesos
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Gestionar accesos" description="Controla qué menús están disponibles para cada rol." />

      <div className="mb-4 flex items-center gap-2">
        <SearchInput value={resource.search} onChange={resource.setSearch} placeholder="Buscar rol..." />
      </div>

      <DataTable
        columns={columns}
        data={resource.items}
        onEdit={() => {}}
        onDelete={() => {}}
        isLoading={resource.isLoading}
        hideRowActions
      />

      <Pagination pagination={resource.pagination} onPageChange={resource.setPage} disabled={resource.isLoading} />

      <Dialog open={!!selectedRole} onOpenChange={(open) => !open && setSelectedRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accesos de "{selectedRole?.nombre}"</DialogTitle>
            <DialogDescription>Marca los menús a los que este rol podrá acceder.</DialogDescription>
          </DialogHeader>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}

          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto rounded-md border p-3">
            {isLoadingMenus ? (
              <p className="text-sm text-muted-foreground">Cargando menús...</p>
            ) : (
              menus.map((menu) => (
                <label key={menu.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={menu.asignado} onCheckedChange={() => toggleMenu(menu.id)} />
                  {menu.nombre}
                </label>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRole(null)} disabled={isSaving}>
              Cerrar
            </Button>
            <LoadingButton isLoading={isSaving} onClick={handleSave}>
              <Save className="h-4 w-4" />
              Guardar cambios
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
