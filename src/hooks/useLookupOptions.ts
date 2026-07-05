import { useState, useCallback } from "react";
import type { SelectOption } from "@/types";

interface ListLikeService<T> {
  list: (params?: { limit?: number }) => Promise<{ items: T[] }>;
}

/**
 * Fetches every record of a small catalog (levels, classrooms, shifts...)
 * and maps it into `<Select>` options. Reused by every form that needs to
 * populate a dropdown from another module's catalog.
 * 
 * By default, options are NOT loaded automatically. Call `fetch()` to load them,
 * which is useful for lazy-loading when a form dialog opens.
 */
export function useLookupOptions<T>(
  service: ListLikeService<T>,
  mapToOption: (item: T) => SelectOption
) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await service.list({ limit: 200 });
      setOptions(result.items.map(mapToOption));
    } catch (err) {
      console.error("Error fetching lookup options:", err);
    } finally {
      setIsLoading(false);
    }
  }, [service, mapToOption]);

  return { options, isLoading, fetch };
}