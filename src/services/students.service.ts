import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Student } from "@/types";

export const studentsService = createCrudService<Student>(ENDPOINTS.students);
