import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";

export interface VerifyCodePayload {
  identifier: string;
  code: string;
}

export const accountActivationService = {
  verifyCode: (payload: VerifyCodePayload) =>
    apiClient.requestWithData<void>(ENDPOINTS.auth.verifyCode, { method: "POST", body: payload, requiresAuth: false }),
};
