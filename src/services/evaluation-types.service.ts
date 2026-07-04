import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { TipoEvaluacion } from "@/types";

export const evaluationTypesService = createCrudService<TipoEvaluacion>(ENDPOINTS.evaluationTypes);
