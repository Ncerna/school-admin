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

export interface LoginPayload {
  identifier: string; // usuario o correo
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO date-time
  user: AuthUser;
  menu: MenuPermission[];
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

export interface AccountActivationStatus {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  estadoActivacion: "Pendiente" | "Activado";
  fechaEnvio?: string;
  fechaActivacion?: string;
}
