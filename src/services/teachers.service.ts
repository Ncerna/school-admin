import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Teacher } from "@/types";

export const teachersService = createCrudService<Teacher>(ENDPOINTS.teachers);
