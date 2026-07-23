import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import type { MenuPermission } from "@/types/auth";
import type { NavItem } from "./nav-items";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  UserCog,
  ShieldCheck,
  Settings,
  Users,
  School,
  Newspaper,
  Wallet,
  FileText,
  FileBarChart,
  CreditCard,
  ListChecks,
  CalendarRange,
  CalendarCheck,
  ClipboardCheck,
  DoorOpen,
  BookMarked,
  BookCopy,
  Clock,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

interface SidebarContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  expandedItems: Record<string, boolean>;
  toggleSubmenu: (url: string) => void;
  setSubmenuExpanded: (url: string, expanded: boolean) => void;
  menuItems: NavItem[];
  /** Indica si el menú del usuario ya se cargó desde el API */
  isMenuLoaded: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

// Map icon names to Lucide icons (both PascalCase and kebab-case)
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  UserCog,
  ShieldCheck,
  Settings,
  Users,
  School,
  Newspaper,
  Wallet,
  FileText,
  FileBarChart,
  CreditCard,
  ListChecks,
  CalendarRange,
  CalendarCheck,
  ClipboardCheck,
  DoorOpen,
  BookMarked,
  BookCopy,
  Clock,
  Briefcase,
  "layout-dashboard": LayoutDashboard,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  "user-cog": UserCog,
  "shield-check": ShieldCheck,
  "settings": Settings,
  "users": Users,
  "school": School,
  "newspaper": Newspaper,
  "wallet": Wallet,
  "file-text": FileText,
  "file-bar-chart": FileBarChart,
  "credit-card": CreditCard,
  "list-checks": ListChecks,
  "calendar-range": CalendarRange,
  "calendar-check": CalendarCheck,
  "clipboard-check": ClipboardCheck,
  "door-open": DoorOpen,
  "book-marked": BookMarked,
  "book-copy": BookCopy,
  "clock": Clock,
  "briefcase": Briefcase,
};

function mapMenuPermissionToNavItem(menu: MenuPermission): NavItem {
  const IconComponent = iconMap[menu.icono || ""] || LayoutDashboard;
  const result: NavItem = {
    title: menu.nombre,
    url: menu.ruta,
    icon: IconComponent,
  };
  if (menu.children && menu.children.length > 0) {
    result.items = menu.children.map(mapMenuPermissionToNavItem);
  }
  return result;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const { menu: userMenu } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});
  const [menuItems, setMenuItems] = React.useState<NavItem[]>([]);
  const [isMenuLoaded, setIsMenuLoaded] = React.useState(false);

  React.useEffect(() => {
   
    if (userMenu && userMenu.length > 0) {
      const mapped = userMenu.map(mapMenuPermissionToNavItem);
     
      setMenuItems(mapped);
      setIsMenuLoaded(true);
    } else if (userMenu && userMenu.length === 0) {
      // Menú vacío del API - no mostrar nada
     
      setMenuItems([]);
      setIsMenuLoaded(true);
    } else {
      // userMenu es null o undefined - aún no cargado
     
      setIsMenuLoaded(false);
    }
  }, [userMenu]);

  const toggleSubmenu = React.useCallback((url: string) => {
    setExpandedItems((prev) => ({ ...prev, [url]: !prev[url] }));
  }, []);

  const setSubmenuExpanded = React.useCallback((url: string, expanded: boolean) => {
    setExpandedItems((prev) => ({ ...prev, [url]: expanded }));
  }, []);

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      toggleCollapsed: () => setCollapsed((prev) => !prev),
      mobileOpen,
      setMobileOpen,
      expandedItems,
      toggleSubmenu,
      setSubmenuExpanded,
      menuItems,
      isMenuLoaded,
    }),
    [collapsed, mobileOpen, expandedItems, menuItems, isMenuLoaded]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar debe usarse dentro de <SidebarProvider>");
  return ctx;
}