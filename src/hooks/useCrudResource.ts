import { useCallback, useEffect, useState, useRef } from "react";
import { useDebounce } from "./useDebounce";
import { ApiError } from "@/types/api";
import type { ListParams, PaginatedData, PaginationMeta } from "@/types/api";

interface CrudResourceApi<TEntity, TPayload> {
  list: (params?: ListParams) => Promise<PaginatedData<TEntity>>;
  create: (payload: TPayload) => Promise<TEntity>;
  update: (id: string, payload: TPayload) => Promise<TEntity>;
  remove: (id: string) => Promise<null>;
}

const EMPTY_PAGINATION: PaginationMeta = { currentPage: 1, limit: 10, total: 0, totalPage: 1 };

/**
 * Encapsulates every concern shared by list screens: fetching a page of data,
 * debounced search, sortable columns, and create/update/delete actions each
 * with their own loading flag (used to drive per-button Loading States).
 */
export function useCrudResource<TEntity extends { id: string }, TPayload = Partial<TEntity>>(
  api: CrudResourceApi<TEntity, TPayload>,
  options?: { limit?: number; extraParams?: Record<string, unknown> }
) {
  const limit = options?.limit ?? 10;

  const [items, setItems] = useState<TEntity[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [extraParams, setExtraParams] = useState<Record<string, unknown>>(options?.extraParams ?? {});

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to track if this is the first render to avoid double fetch in StrictMode
  const isFirstRender = useRef(true);

  const fetchPage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.list({
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        sortDir,
        ...extraParams,
      });
      // Handle case when API returns undefined or malformed response
      if (result && result.pagination) {
        setItems(result.items);
        setPagination(result.pagination);
      } else {
        // If no data or malformed response, set empty state
        setItems([]);
        setPagination(EMPTY_PAGINATION);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar la información.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch, sortBy, sortDir, JSON.stringify(extraParams)]);

  useEffect(() => {
    // In StrictMode, effects run twice in development. This ref prevents the second run.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset to page 1 whenever the search term changes so results aren't empty.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  function toggleSort(column: string) {
    if (sortBy !== column) {
      setSortBy(column);
      setSortDir("asc");
    } else {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    }
  }

  async function create(payload: TPayload) {
    setIsSaving(true);
    setError(null);
    try {
      await api.create(payload);
      await fetchPage();
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el registro.");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  async function update(id: string, payload: TPayload) {
    setIsSaving(true);
    setError(null);
    try {
      await api.update(id, payload);
      await fetchPage();
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el registro.");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      await api.remove(id);
      await fetchPage();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar el registro.");
      throw err;
    } finally {
      setDeletingId(null);
    }
  }

  return {
    items,
    pagination,
    page,
    setPage,
    search,
    setSearch,
    sortBy,
    sortDir,
    toggleSort,
    isLoading,
    isSaving,
    deletingId,
    error,
    create,
    update,
    remove,
    refetch: fetchPage,
    setExtraParams,
  };
}
