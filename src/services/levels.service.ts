import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Nivel } from "@/types";

export const levelsService = createCrudService<Nivel>(ENDPOINTS.levels);
