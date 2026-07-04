import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Grado } from "@/types";

export const gradesService = createCrudService<Grado>(ENDPOINTS.grades);
