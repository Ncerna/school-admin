import { NavLink, useLocation } from "react-router-dom";
import { School, ChevronsLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mainNavItems, type NavItem } from "./nav-items";
import { useSidebar } from "./sidebar-context";

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex h-20 items-center border-b border-sidebar-border bg-sidebar/50">
      <div className={cn("flex w-full items-center gap-3 px-4", collapsed && "justify-center px-0")}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg">
          <School className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-sidebar-foreground">I.E.P Isaac Newton </span>
            <span className="text-xs font-medium text-sidebar-foreground/60">Panel administrativo</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SubMenuItem({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === item.url;

  return (
    <NavLink
      to={item.url}
      onClick={onNavigate}
      className={({ isActive: navActive }) =>
        cn(
          "flex items-center gap-3 rounded-md py-1.5 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "ml-4",
          collapsed && "ml-2 justify-center px-2",
          navActive && "text-sidebar-accent-foreground"
        )
      }
    >
      <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center", collapsed && "mx-auto")}>
        <item.icon className="h-3.5 w-3.5" />
      </span>
      {!collapsed && <span className="truncate">{item.title}</span>}
    </NavLink>
  );
}

function NavItemComponent({ item, collapsed, onNavigate, level = 0 }: { item: NavItem; collapsed: boolean; onNavigate?: () => void; level?: number }) {
  const location = useLocation();
  const { expandedItems, toggleSubmenu } = useSidebar();
  const hasSubmenu = item.items && item.items.length > 0;
  const isExpanded = expandedItems[item.url] || false;
  const isActive = location.pathname === item.url || (hasSubmenu && item.items?.some(sub => location.pathname === sub.url));

  if (hasSubmenu) {
    return (
      <div>
        <button
          onClick={() => toggleSubmenu(item.url)}
          className={cn(
            "flex w-full items-center gap-3 rounded-md py-2 text-sm font-medium text-sidebar-foreground/80 transition-all duration-200",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2",
            "px-3"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-left">{item.title}</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isExpanded && "rotate-180")} />
            </>
          )}
        </button>
        {!collapsed && isExpanded && (
          <div className="mt-1 space-y-0.5 pl-4">
            {item.items!.map((subItem) => (
              <SubMenuItem key={subItem.url} item={subItem} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.url}
      onClick={onNavigate}
      className={({ isActive: navActive }) =>
        cn(
          "flex items-center gap-3 rounded-md py-2 text-sm font-medium text-sidebar-foreground/80 transition-all duration-200",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          collapsed && "justify-center px-2",
          "px-3",
          navActive && "bg-sidebar-accent text-sidebar-accent-foreground"
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.title}</span>}
    </NavLink>
  );
}

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent hover:scrollbar-thumb-sidebar-foreground/20">
      <div className="space-y-1 px-2">
        {mainNavItems.map((item) => (
          <NavItemComponent key={item.url} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>
    </nav>
  );
}

/** Tooltip wrapper for collapsed state */
function CollapsedTooltip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right" className="ml-2 border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg">
          <p className="text-sm font-medium">{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Sidebar de escritorio: fijo, colapsable a modo icono. */
export function AppSidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden md:flex md:flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <Brand collapsed={collapsed} />
      <NavList collapsed={collapsed} />
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={toggleCollapsed}
          className={cn(
            "flex w-full items-center gap-2 rounded-md py-2 text-sm text-sidebar-foreground/70 transition-all duration-200",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
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
      <SheetContent side="left" className="w-64 bg-sidebar border-sidebar-border flex flex-col p-0">
        <Brand collapsed={false} />
        <NavList collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}