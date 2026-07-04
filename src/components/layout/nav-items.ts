import {
  GraduationCap,
  UserCog,
  Layers,
  DoorOpen,
  BookMarked,
  BookOpen,
  Clock,
  CalendarRange,
  ClipboardCheck,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

// Ítems del sidebar, agrupados bajo una sola sección "Main". Agregar un
// módulo nuevo es tan simple como añadir una entrada aquí y crear su
// página correspondiente en `src/pages`.
export const mainNavItems: NavItem[] = [
  { title: "Estudiantes", url: "/estudiantes", icon: GraduationCap },
  { title: "Docentes", url: "/docentes", icon: UserCog },
  { title: "Niveles", url: "/niveles", icon: Layers },
  { title: "Aulas", url: "/aulas", icon: DoorOpen },
  { title: "Grados", url: "/grados", icon: BookMarked },
  { title: "Cursos", url: "/cursos", icon: BookOpen },
  { title: "Turnos", url: "/turnos", icon: Clock },
  { title: "Años académicos", url: "/anio-academico", icon: CalendarRange },
  { title: "Tipos de evaluación", url: "/tipos-evaluacion", icon: ClipboardCheck },
  { title: "Accesos", url: "/accesos", icon: ShieldCheck },
  { title: "Activación de cuentas", url: "/activacion-cuentas", icon: UserCheck },
];
