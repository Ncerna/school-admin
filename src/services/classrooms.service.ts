import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Classroom } from "@/types";

export const classroomsService = createCrudService<Classroom>(ENDPOINTS.classrooms);
