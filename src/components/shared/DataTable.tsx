import { Pencil, Trash2, Inbox, ArrowUp, ArrowDown, ArrowUpDown, Loader2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ColumnDef } from "@/types";

interface DataTableProps<T extends { id: string }> {
  columns: ColumnDef<T>[];
  data: T[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  /** id of the row currently being deleted, to show a per-row spinner. */
  deletingId?: string | null;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort?: (accessor: string) => void;
  /** Hides the built-in Editar/Eliminar column for read-only tables. */
  hideRowActions?: boolean;
  /** Current page number (1-based) for row numbering. */
  currentPage?: number;
  /** Number of items per page. */
  itemsPerPage?: number;
  /** Callback for viewing item details. */
  onViewDetails?: (item: T) => void;
  /** Custom render function for row actions (overrides default edit/delete buttons). */
  renderActions?: (item: T) => React.ReactNode | null;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  onViewDetails,
  renderActions,
  emptyMessage = "No hay registros todavía.",
  isLoading = false,
  deletingId = null,
  sortBy,
  sortDir,
  onSort,
  hideRowActions = false,
  currentPage = 1,
  itemsPerPage = 10,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.accessor)} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
              {!hideRowActions && <TableHead className="w-[100px] text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="h-10">
                {columns.map((col) => (
                  <TableCell key={String(col.accessor)} className="py-2">
                    <Skeleton className="h-3 w-full max-w-[160px]" />
                  </TableCell>
                ))}
                {!hideRowActions && <TableCell className="py-2" />}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <Inbox className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{emptyMessage}</p>
        <p className="text-xs text-muted-foreground">Usa el botón "Nuevo" para agregar el primer registro.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            {columns.map((col) => {
              const key = String(col.accessor);
              const isActive = sortBy === key;
              return (
                <TableHead key={key} className={col.className}>
                  {col.sortable && onSort ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                      onClick={() => onSort(key)}
                    >
                      {col.header}
                      {isActive ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              );
            })}
            {!hideRowActions && <TableHead className="w-[100px] text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} className="h-10">
              <TableCell className="py-2 font-mono text-sm">{currentPage * itemsPerPage - itemsPerPage + index + 1}</TableCell>
              {columns.map((col) => (
                <TableCell key={String(col.accessor)} className="py-2">
                  {col.render ? col.render(item) : String(item[col.accessor] ?? "—")}
                </TableCell>
              ))}
              {!hideRowActions && (
                <TableCell className="text-right py-2">
                  {renderActions ? (
                    renderActions(item)
                  ) : onViewDetails ? (
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label="Ver detalles" onClick={() => onViewDetails(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => onEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Eliminar"
                        disabled={deletingId === item.id}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(item)}
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => onEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Eliminar"
                        disabled={deletingId === item.id}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(item)}
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}