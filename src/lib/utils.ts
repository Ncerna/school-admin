import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind evitando conflictos.
 * Utilidad estándar usada por todos los componentes de UI (shadcn).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
