import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Staff } from "@/types";

export const staffService = createCrudService<Staff>(ENDPOINTS.staff);