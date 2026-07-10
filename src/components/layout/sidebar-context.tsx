import * as React from "react";

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
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

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
    }),
    [collapsed, mobileOpen, expandedItems, toggleSubmenu, setSubmenuExpanded]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar debe usarse dentro de <SidebarProvider>");
  return ctx;
}