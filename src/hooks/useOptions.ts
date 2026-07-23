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
  // Use a ref to track if we've already fetched (for StrictMode compatibility)
  const hasFetchedRef = useRef(false);
  // Store mapToOption in a ref to avoid it changing between renders
  // This prevents the fetch callback from being recreated on every render
  const mapToOptionRef = useRef(mapToOption);
  mapToOptionRef.current = mapToOption;

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      // apiClient.get already extracts the `data` property from the response
      const data = await apiClient.get<T[]>(`${endpoint}/options`);
      // Ensure all values are strings - protect against undefined data
      // Use ref to get the latest mapToOption without causing re-renders
      setOptions((data ?? []).map((item) => {
        const mapped = mapToOptionRef.current(item);
        return {
          ...mapped,
          value: String(mapped.value),
        };
      }));
    } catch (err) {
      console.error(`Error fetching options from ${endpoint}/options:`, err);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  // Auto-fetch on mount only if autoFetch is true (only once, not in StrictMode)
  useEffect(() => {
    if (autoFetch && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetch();
    }
  }, [autoFetch, fetch]);

  return { options, isLoading, fetch };
}