import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Curso } from "@/types";

export const coursesService = createCrudService<Curso>(ENDPOINTS.courses);
