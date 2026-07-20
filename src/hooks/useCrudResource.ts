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
 * 
 * TExtra is an optional third generic parameter to capture a top-level `summary`
 * field from the list response (used by PaymentsReportPage).
 */
export function useCrudResource<TEntity extends { id: string }, TPayload = Partial<TEntity>, TExtra = undefined>(
   api: CrudResourceApi<TEntity, TPayload>,
   options?: { limit?: number; extraParams?: Record<string, unknown>; realtimeSearch?: boolean }
 ) {
const limit = options?.limit ?? 10;
   const realtimeSearch = options?.realtimeSearch ?? true;

const [items, setItems] = useState<TEntity[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [summary, setSummary] = useState<TExtra>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  // When realtimeSearch is false, use searchToApply (set by applySearch)
  // When realtimeSearch is true, debounce search with 400ms delay
  const debouncedSearch = useDebounce(search, realtimeSearch ? 400 : 0);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [extraParams, setExtraParams] = useState<Record<string, unknown>>(options?.extraParams ?? {});

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track if we should use the search value (for non-realtime search)
  // When realtimeSearch is true, this mirrors debouncedSearch
  // When realtimeSearch is false, this is set by applySearch()
  const [searchToApply, setSearchToApply] = useState<string>(realtimeSearch ? debouncedSearch : "");

  // Initialize searchToApply on mount for non-realtime search
  useEffect(() => {
    if (!realtimeSearch) {
      setSearchToApply("");
    }
  }, [realtimeSearch]);

  const fetchPage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.list({
        page,
        limit,
        search: searchToApply,
        sortBy,
        sortDir,
        ...extraParams,
      });
      // Handle case when API returns undefined or malformed response
      if (result && result.pagination) {
        setItems(result.items);
        setPagination(result.pagination);
        // Capture summary if present (TExtra)
        if (result && typeof result === 'object' && 'summary' in result) {
          setSummary((result as any).summary);
        }
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
  }, [page, limit, searchToApply, sortBy, sortDir, JSON.stringify(extraParams)]);

  // Fetch on mount and when params change
  useEffect(() => {
    fetchPage();
  }, [page, limit, searchToApply, sortBy, sortDir, JSON.stringify(extraParams)]);

  // Reset to page 1 whenever the search term changes so results aren't empty.
  // Use a ref to prevent triggering fetch on initial mount
  const isFirstSearch = useRef(true);
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }
    setPage(1);
  }, [searchToApply]);

  // Function to apply search (used when realtimeSearch is false)
  const applySearch = useCallback(() => {
    setSearchToApply(search);
    setPage(1);
  }, [search]);

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
    applySearch,
    extraParams,
    setExtraParams,
    summary,
  };
}
