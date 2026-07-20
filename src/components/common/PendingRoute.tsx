import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function PendingRoute() {
  const { isAuthenticated, pendingUsername } = useAuth();
  // Allow access if there's a pending username (from login flow) or redirect to login
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  if (!pendingUsername) return <Navigate to="/login" replace />;
  return <Outlet />;
}