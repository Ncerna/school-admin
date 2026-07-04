import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Docente } from "@/types";

export const teachersService = createCrudService<Docente>(ENDPOINTS.teachers);
