import { NavLink } from "react-router-dom";
import { School, ChevronsLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { mainNavItems } from "./nav-items";
import { useSidebar } from "./sidebar-context";

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn("flex h-14 items-center gap-2 px-4", collapsed && "justify-center px-0")}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <School className="h-4 w-4" />
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-sidebar-foreground">I.E. San Martín</span>
          <span className="text-xs text-sidebar-foreground/60">Panel administrativo</span>
        </div>
      )}
    </div>
  );
}

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
      {!collapsed && (
        <span className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Main
        </span>
      )}
      {mainNavItems.map((item) => (
        <NavLink
          key={item.url}
          to={item.url}
          onClick={onNavigate}
          title={collapsed ? item.title : undefined}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-0",
              isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
            )
          }
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{item.title}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

/** Sidebar de escritorio: fijo, colapsable a modo icono. */
export function AppSidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden md:flex md:flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <Brand collapsed={collapsed} />
      <NavList collapsed={collapsed} />
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={toggleCollapsed}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Contraer menú</span>}
        </button>
      </div>
    </aside>
  );
}

/** Sidebar móvil: se muestra como panel deslizante (Sheet) sobre el contenido. */
export function AppSidebarMobile() {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="bg-sidebar border-sidebar-border flex flex-col">
        <Brand collapsed={false} />
        <NavList collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
