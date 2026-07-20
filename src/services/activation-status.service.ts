import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { AccountActivationStatus } from "@/types/auth";

export const activationStatusService = createCrudService<AccountActivationStatus>(ENDPOINTS.accounts.activationStatus);