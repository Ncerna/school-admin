import type { ReactNode } from "react";

// Tipos de dominio del sistema escolar.
// Centralizar los tipos aquí facilita escalar el proyecto: cualquier
// módulo nuevo (por ejemplo "Matrículas" o "Asistencias") puede
// reutilizar estas mismas convenciones.

export type Estado = "Activo" | "Inactivo";

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: "Administrador" | "Secretaría" | "Director";
  avatarUrl?: string;
}

export interface Nivel {
  id: string;
  nombre: string;
  descripcion: string;
  estado: Estado;
}

export interface Grado {
  id: string;
  nombre: string;
  nivelId: string;
  seccion: string;
  aulaId: string;
  vacantes: number;
  estado: Estado;
}

export interface Aula {
  id: string;
  nombre: string;
  estado: Estado;
}

export interface Curso {
  id: string;
  nombre: string;
  codigo?: string;
  estado: Estado;
}

export interface Turno {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  estado: Estado;
}

export interface AnioAcademico {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: Estado;
  estadoMatricula: Estado;
  turnoIds: string[];
}

export interface TipoEvaluacion {
  id: string;
  nombre: string;
  cantidadPeriodos: number;
  estado: Estado;
  enUso?: boolean;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface MenuAcceso {
  id: string;
  nombre: string;
  asignado: boolean;
}

export interface Docente {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  especialidad: string;
  correo: string;
  telefono: string;
  estado: Estado;
}

export type Sexo = "Masculino" | "Femenino";
export type TipoParentesco = "Padre" | "Madre" | "Tutor" | "Abuelo(a)" | "Otro";

export interface Apoderado {
  nombres: string;
  apellidos: string;
  telefono: string;
  tipoParentesco: TipoParentesco | "";
}

export interface Estudiante {
  id: string;
  // Datos obligatorios
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono: string;
  sexo: Sexo | "";
  gradoId: string;
  aulaId: string;
  estado: Estado;
  // Datos opcionales
  pais?: string;
  direccion?: string;
  fechaNacimiento?: string;
  contactoEmergencia?: string;
  viveConPadres?: boolean;
  // Información del apoderado
  apoderado: Apoderado;
}

// Definición genérica de una columna de tabla, reutilizada por todos los módulos.
export interface ColumnDef<T> {
  header: string;
  accessor: keyof T;
  render?: (item: T) => ReactNode;
  className?: string;
  /** Enables click-to-sort on this column header (server-side sorting). */
  sortable?: boolean;
}

// Definición genérica de un campo de formulario, usado en los modales de crear/editar.
export type FieldType = "text" | "email" | "number" | "select" | "textarea";

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldDef<T> {
  name: keyof T;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: SelectOption[];
  required?: boolean;
}
