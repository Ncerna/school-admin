import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Aula } from "@/types";

export const classroomsService = createCrudService<Aula>(ENDPOINTS.classrooms);
