import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Course } from "@/types";

export const coursesService = createCrudService<Course>(ENDPOINTS.courses);
