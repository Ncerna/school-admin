import { useEffect, useState, type ReactNode } from "react";
import { KeyRound, Save, ChevronDown, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
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
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { useCrudResource } from "@/hooks/useCrudResource";
import { rolesService } from "@/services/roles.service";
import { ApiError } from "@/types/api";
import { useToast } from "@/components/ui/toast";
import type { ColumnDef, MenuAccess, Role } from "@/types";

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

export default function AccessPage() {
  const resource = useCrudResource<Role>({ list: rolesService.list, ...noopApi });

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [menus, setMenus] = useState<MenuAccess[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const { showToast } = useToast();

  useEffect(() => {
    if (!selectedRole) return;
    setIsLoadingMenus(true);
    setError(null);
    setExpandedMenus(new Set()); // Reset expanded state when changing role
    rolesService
      .getAccessList(selectedRole.id)
      .then(setMenus)
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudo cargar los accesos."))
      .finally(() => setIsLoadingMenus(false));
  }, [selectedRole]);

  // Recursively toggle all children of a menu
  function toggleAllChildren(items: MenuAccess[], value: boolean): MenuAccess[] {
    return items.map((item) => ({
      ...item,
      assigned: value,
      children: item.children ? toggleAllChildren(item.children, value) : undefined,
    }));
  }

  // Recursively find and toggle a child by id
  function toggleChildRecursive(items: MenuAccess[], id: string): MenuAccess[] {
    return items.map((item) => {
      if (item.id === id) {
        return { ...item, assigned: !item.assigned };
      }
      if (item.children) {
        return { ...item, children: toggleChildRecursive(item.children, id) };
      }
      return item;
    });
  }

  // Check if all children in a menu are selected
  function areAllChildrenSelected(menu: MenuAccess): boolean {
    if (!menu.children || menu.children.length === 0) return false;
    return menu.children.every((child) => child.assigned) &&
      menu.children.every((child) => !child.children || areAllChildrenSelected(child));
  }

  // Check if some children are selected (for indeterminate state)
  function isSomeChildrenSelected(menu: MenuAccess): boolean {
    if (!menu.children || menu.children.length === 0) return false;
    return menu.children.some((child) => child.assigned) && !areAllChildrenSelected(menu);
  }

  // Toggle a menu and all its children recursively
  function toggleMenu(id: string) {
    setMenus((prev) => {
      return prev.map((m) => {
        if (m.id === id) {
          const newAssigned = !m.assigned;
          // If toggling parent, also toggle all children recursively
          return {
            ...m,
            assigned: newAssigned,
            children: m.children ? toggleAllChildren(m.children, newAssigned) : undefined,
          };
        }
        // If menu has children, check if the toggled item is a child
        if (m.children) {
          const hasChild = m.children.some((c) => c.id === id || (c.children && c.children.some((gc) => gc.id === id)));
          if (hasChild) {
            const newChildren = toggleChildRecursive(m.children, id);
            const allSelected = newChildren.every((c) => c.assigned);
            return { ...m, children: newChildren, assigned: allSelected };
          }
        }
        return m;
      });
    });
  }

  // Toggle expand/collapse for menu with children
  function toggleExpand(id: string) {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  // Recursive component to render menu items
  function renderMenuItems(items: MenuAccess[], level = 0): ReactNode {
    return items.map((menu) => {
      const hasChildren = menu.children && menu.children.length > 0;
      const isExpanded = expandedMenus.has(menu.id);

      return (
        <div key={menu.id}>
          <label className="flex items-center gap-2 text-sm py-1" style={{ paddingLeft: `${level * 20}px` }}>
            {hasChildren && (
              <button
                type="button"
                onClick={() => toggleExpand(menu.id)}
                className="p-0.5 hover:bg-gray-100 rounded"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
            )}
            {!hasChildren && <span className="w-4" />}
            <Checkbox
              checked={menu.assigned}
              onCheckedChange={() => toggleMenu(menu.id)}
              ref={(el) => {
                if (el && isSomeChildrenSelected(menu)) {
                  // Set indeterminate state
                  const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
                  if (checkbox) checkbox.indeterminate = true;
                }
              }}
            />
            <span className="font-medium">{menu.name}</span>
          </label>
          {hasChildren && isExpanded && menu.children && renderMenuItems(menu.children, level + 1)}
        </div>
      );
    });
  }

  async function handleSave() {
    if (!selectedRole) return;
    setIsSaving(true);
    setError(null);
    try {
      // Collect all assigned menu IDs including children
      const collectAssignedIds = (items: MenuAccess[]): string[] => {
        return items.flatMap((m) => {
          const ids: string[] = m.assigned ? [m.id] : [];
          if (m.children) {
            ids.push(...collectAssignedIds(m.children));
          }
          return ids;
        });
      };
      const menuIds = collectAssignedIds(menus);
      await rolesService.updateAccessList(selectedRole.id, menuIds);
      showToast("Accesos actualizados correctamente.", "success");
      // Cerrar el modal automáticamente después de guardar exitosamente
      setTimeout(() => {
        setSelectedRole(null);
      }, 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  }

  const columns: ColumnDef<Role>[] = [
    { header: "Rol", accessor: "name", sortable: true },
    { header: "Descripción", accessor: "description", render: (item) => item.description || "—" },
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
          <div className="flex flex-col h-full">
            <DialogHeader>
              <DialogTitle>Accesos de "{selectedRole?.name}"</DialogTitle>
              <DialogDescription>Marca los menús a los que este rol podrá acceder.</DialogDescription>
            </DialogHeader>

            {error && <p className="text-sm text-destructive px-6">{error}</p>}

            <DialogBody>
              <div className="flex flex-col gap-1 rounded-md border p-3 max-h-96 overflow-y-auto">
                {isLoadingMenus ? (
                  <p className="text-sm text-muted-foreground">Cargando menús...</p>
                ) : (
                  renderMenuItems(menus)
                )}
              </div>
            </DialogBody>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRole(null)} disabled={isSaving}>
                Cerrar
              </Button>
              <LoadingButton isLoading={isSaving} onClick={handleSave}>
                <Save className="h-4 w-4" />
                Guardar cambios
              </LoadingButton>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}