import { useEffect, useState } from "react";
import type { SelectOption } from "@/types";

interface ListLikeService<T> {
  list: (params?: { limit?: number }) => Promise<{ items: T[] }>;
}

/**
 * Fetches every record of a small catalog (levels, classrooms, shifts...)
 * and maps it into `<Select>` options. Reused by every form that needs to
 * populate a dropdown from another module's catalog.
 */
export function useLookupOptions<T>(
  service: ListLikeService<T>,
  mapToOption: (item: T) => SelectOption
) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    service
      .list({ limit: 200 })
      .then((result) => {
        if (active) setOptions(result.items.map(mapToOption));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { options, isLoading };
}
