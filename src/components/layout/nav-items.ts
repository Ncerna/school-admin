import {
  GraduationCap,
  UserCog,
  Layers,
  DoorOpen,
  BookMarked,
  BookOpen,
  BookCopy,
  Clock,
  CalendarRange,
  ClipboardCheck,
  CalendarCheck,
  ShieldCheck,
  UserCheck,
  School,
  Newspaper,
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Submenu items (optional) */
  items?: NavItem[];
}

// Ítems del sidebar, agrupados bajo secciones con submenús.
export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Académico",
    url: "/academico",
    icon: BookOpen,
    items: [
      { title: "Años académicos", url: "/anio-academico", icon: CalendarRange },
      { title: "Tipos de evaluación", url: "/tipos-evaluacion", icon: ClipboardCheck },
      { title: "Períodos de evaluación", url: "/periodos-evaluacion", icon: CalendarCheck },
      { title: "Niveles", url: "/niveles", icon: Layers },
      { title: "Grados", url: "/grados", icon: BookMarked },
      { title: "Aulas", url: "/aulas", icon: DoorOpen },
      { title: "Cursos", url: "/cursos", icon: BookOpen },
      { title: "Asignar cursos a grados", url: "/grade-courses", icon: BookCopy },
    ],
  },
  {
    title: "Estudiantes",
    url: "/estudiantes",
    icon: GraduationCap,
    items: [
      { title: "Estudiantes", url: "/estudiantes", icon: GraduationCap },
      { title: "Apoderados", url: "/apoderados", icon: Users },
    ],
  },
  {
    title: "Docentes",
    url: "/docentes",
    icon: UserCog,
  },
  {
    title: "Matrícula",
    url: "/matricula",
    icon: GraduationCap,
  },
  {
    title: "Pagos",
    url: "/pagos",
    icon: Wallet,
    items: [
      { title: "Tarifas", url: "/fee-schedules", icon: FileText },
    ],
  },
  {
    title: "Administración",
    url: "/administracion",
    icon: ShieldCheck,
    items: [
      { title: "Colegio", url: "/colegio", icon: School },
      { title: "Publicaciones", url: "/publicaciones", icon: Newspaper },
      { title: "Accesos", url: "/accesos", icon: ShieldCheck },
      { title: "Activación de cuentas", url: "/activacion-cuentas", icon: UserCheck },
    ],
  },
  {
    title: "Configuración",
    url: "/configuracion",
    icon: Settings,
    items: [
      { title: "Perfil", url: "/perfil", icon: Users },
      { title: "Preferencias", url: "/preferencias", icon: Settings },
    ],
  },
];