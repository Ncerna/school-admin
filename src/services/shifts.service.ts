import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Shift } from "@/types";

export const shiftsService = createCrudService<Shift>(ENDPOINTS.shifts);
