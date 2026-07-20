export interface AuthUser {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  usuario: string;
  rol: string;
  avatarUrl?: string;
  requiresActivation?: boolean;
}

export interface MenuPermission {
  id: string;
  nombre: string;
  ruta: string;
  icono?: string;
  acciones: string[];
}

// API response types (snake_case from backend)
export interface ApiUser {
  id: number;
  username: string;
  email: string;
  status: string;
  role: string;
}

export interface ApiMenu {
  id: number;
  name: string;
  icon: string;
  route: string;
  parent_id: number | null;
  order: number;
  children: ApiMenu[];
}

export interface ApiLoginResponse {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  user: ApiUser;
  menus: ApiMenu[];
  permissions: string[];
}

export interface ApiLoginStepResponse {
  auth_step: LoginStatus;
  username: string;
}

export interface LoginPayload {
  identifier: string; // usuario o correo
  password: string;
}

export type LoginStatus = "USER_NOT_FOUND" | "INVALID_CREDENTIALS" | "INVALID_PASSWORD" | "ACCOUNT_INACTIVE" | "ACCOUNT_NOT_ACTIVATED" | "PASSWORD_CHANGE_REQUIRED" | "COMPLETE";

export interface LoginResult {
  status: LoginStatus;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string; // ISO date-time
  user?: AuthUser;
  menu?: MenuPermission[];
  message?: string;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface ActivateAccountPayload {
  token: string;
  password: string;
  passwordConfirmation: string;
}

export type ActivationStatus = "PENDING_ACTIVATION" | "ACTIVE" | "INACTIVE";

export interface AccountActivationStatus {
  id: string;
  username: string;
  email: string;
  status: ActivationStatus;
  role: string;
}
