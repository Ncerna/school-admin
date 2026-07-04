import * as React from "react";

interface SidebarContextValue {
  /** Sidebar de escritorio expandido u ocupando solo iconos */
  collapsed: boolean;
  toggleCollapsed: () => void;
  /** Sidebar móvil (sheet) abierto o cerrado */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      toggleCollapsed: () => setCollapsed((prev) => !prev),
      mobileOpen,
      setMobileOpen,
    }),
    [collapsed, mobileOpen]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar debe usarse dentro de <SidebarProvider>");
  return ctx;
}
