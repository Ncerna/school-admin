import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/api";

interface PaginationProps {
  pagination: PaginationMeta | null | undefined;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

/**
 * Generic pagination control reused by every table in the app (students,
 * teachers, classrooms, grades, courses, shifts...). Only needs the
 * `pagination` meta block returned by the API wrapper.
 */
export function Pagination({ pagination, onPageChange, disabled }: PaginationProps) {
  // Handle case when pagination is undefined or null
  if (!pagination) return null;

  const { currentPage, totalPage, total, limit } = pagination;

  if (total === 0) return null;

  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Mostrando <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span> de{" "}
        <span className="font-medium">{total}</span> registros
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPage}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || currentPage >= totalPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
