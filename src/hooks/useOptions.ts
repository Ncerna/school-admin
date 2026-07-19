import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import type { SelectOption } from "@/types";

/**
 * Fetches options from a /options endpoint (e.g., /levels/options, /classrooms/options).
 * These endpoints return data directly in the `data` property, not paginated.
 * Reused by any form that needs to populate a dropdown from a catalog.
 * Call the returned `fetch` function when the form dialog opens (lazy loading).
 * 
 * @param autoFetch - If true, fetches options on mount. Default: false (lazy loading).
 */
export function useOptions<T extends { id: string | number }>(
  endpoint: string,
  mapToOption: (item: T) => SelectOption,
  autoFetch: boolean = false
) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      // apiClient.get already extracts the `data` property from the response
      const data = await apiClient.get<T[]>(`${endpoint}/options`);
      // Ensure all values are strings - protect against undefined data
      setOptions((data ?? []).map((item) => ({
        ...mapToOption(item),
        value: String(mapToOption(item).value),
      })));
    } catch (err) {
      console.error(`Error fetching options from ${endpoint}/options:`, err);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, mapToOption]);

  // Auto-fetch on mount only if autoFetch is true (only once, not in StrictMode)
  useEffect(() => {
    if (autoFetch && isFirstRender.current) {
      isFirstRender.current = false;
      fetch();
    }
  }, [autoFetch, fetch]);

  return { options, isLoading, fetch };
}
