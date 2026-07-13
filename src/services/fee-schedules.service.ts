import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { FeeSchedule, FeeSchedulePayload } from "@/types";

export const feeSchedulesService = createCrudService<FeeSchedule, FeeSchedulePayload>(ENDPOINTS.feeSchedules);