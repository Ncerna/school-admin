import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar, AppSidebarMobile } from "./AppSidebar";
import { Navbar } from "./Navbar";
import { SidebarProvider } from "./sidebar-context";
import { mainNavItems } from "./nav-items";
import { SessionExpiryModal } from "@/components/common/SessionExpiryModal";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { useAuth } from "@/context/AuthContext";

function usePageTitle() {
  const { pathname } = useLocation();
  if (pathname === "/dashboard") return "Panel general";
  
  // Search in main items and submenu items
  for (const item of mainNavItems) {
    if (pathname.startsWith(item.url)) {
      return item.title;
    }
    if (item.items) {
      const subMatch = item.items.find((sub) => pathname.startsWith(sub.url));
      if (subMatch) {
        return subMatch.title;
      }
    }
  }
  
  return "Panel general";
}

function LayoutContent() {
  const pageTitle = usePageTitle();
  const { isAuthenticated } = useAuth();
  const { showWarning, dismissWarning } = useSessionMonitor(isAuthenticated);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/20">
      <AppSidebar />
      <AppSidebarMobile />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Monitoreo de sesión: modal de aviso a 5 minutos de expirar (RF-HU-007) */}
      <SessionExpiryModal open={showWarning} onRefreshed={dismissWarning} />
    </div>
  );
}

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}
