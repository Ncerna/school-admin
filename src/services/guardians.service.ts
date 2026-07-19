import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Guardian } from "@/types";

export const guardiansService = createCrudService<Guardian>(ENDPOINTS.guardians);