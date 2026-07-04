import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Turno } from "@/types";

export const shiftsService = createCrudService<Turno>(ENDPOINTS.shifts);
