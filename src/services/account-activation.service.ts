import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";

export interface VerifyCodePayload {
  identifier: string;
  code: string;
}

export interface VerifyCodeResult {
  success: boolean;
  message?: string;
}

export const accountActivationService = {
  verifyCode: (payload: VerifyCodePayload) =>
    apiClient.post<VerifyCodeResult>(ENDPOINTS.auth.verifyCode, payload, { requiresAuth: false }),
};