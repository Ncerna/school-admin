import * as React from "react";
import { menusService } from "@/services/menus.service";
import type { Menu } from "@/types";
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
  /** Sidebar de escritorio expandido u ocupando solo iconos */
  collapsed: boolean;
  toggleCollapsed: () => void;
  /** Sidebar móvil (sheet) abierto o cerrado */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  /** Estado de los submenús expandidos (clave: url del item padre) */
  expandedItems: Record<string, boolean>;
  /** Toggle submenu expansion */
  toggleSubmenu: (url: string) => void;
  /** Set submenu expanded state */
  setSubmenuExpanded: (url: string, expanded: boolean) => void;
  /** Dynamic menu items loaded from API */
  menuItems: NavItem[];
  /** Loading state for menus */
  isLoadingMenus: boolean;
  /** Refresh menus from API */
  refetchMenus: () => Promise<void>;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

// Map icon names to Lucide icons
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
};

function mapMenuToNavItem(menu: Menu): NavItem {
  const IconComponent = iconMap[menu.icon] || LayoutDashboard;
  return {
    title: menu.title,
    url: menu.url,
    icon: IconComponent,
    items: menu.items?.map(mapMenuToNavItem),
  };
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});
  const [menuItems, setMenuItems] = React.useState<NavItem[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = React.useState(true);

  const fetchMenus = React.useCallback(async () => {
    setIsLoadingMenus(true);
    try {
      const menus = await menusService.getMenus();
      // If API returns empty, use static fallback
      if (menus && menus.length > 0) {
        setMenuItems(menus.map(mapMenuToNavItem));
      }
      // If API fails or returns empty, use static mainNavItems (no error thrown)
    } catch (err) {
      // Silently use static fallback - API endpoint may not exist
    } finally {
      setIsLoadingMenus(false);
    }
  }, []);

  // Load menus on mount
  React.useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

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
      isLoadingMenus,
      refetchMenus: fetchMenus,
    }),
    [collapsed, mobileOpen, expandedItems, menuItems, isLoadingMenus, fetchMenus]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar debe usarse dentro de <SidebarProvider>");
  return ctx;
}
