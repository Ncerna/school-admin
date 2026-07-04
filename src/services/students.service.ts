import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Estudiante } from "@/types";

export const studentsService = createCrudService<Estudiante>(ENDPOINTS.students);
