import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { SelectOption } from "@/types";

/**
 * Fetches options from a /options endpoint (e.g., /levels/options, /classrooms/options).
 * These endpoints return data directly in the `data` property, not paginated.
 * Reused by any form that needs to populate a dropdown from a catalog.
 */
export function useOptions<T extends { id: string | number; name: string }>(
  endpoint: string,
  mapToOption: (item: T) => SelectOption
) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      // apiClient.get already extracts the `data` property from the response
      const data = await apiClient.get<T[]>(`${endpoint}/options`);
      // Ensure all values are strings
      setOptions(data.map((item) => ({
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

  return { options, isLoading, fetch };
}
