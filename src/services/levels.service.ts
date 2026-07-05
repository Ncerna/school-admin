import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Level } from "@/types";

export const levelsService = createCrudService<Level>(ENDPOINTS.levels);
