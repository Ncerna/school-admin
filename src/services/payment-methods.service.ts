import { createCrudService } from "@/lib/crud-service";
import { ENDPOINTS } from "@/lib/endpoints";
import type { PaymentMethod } from "@/types";

export const paymentMethodsService = createCrudService<PaymentMethod>(
  ENDPOINTS.paymentMethods
);