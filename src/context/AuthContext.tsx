import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/lib/token-storage";
import type { AuthUser, LoginPayload, MenuPermission } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  menu: MenuPermission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() => tokenStorage.getUser());
  const [menu, setMenu] = useState<MenuPermission[]>(() => tokenStorage.getMenu());
  const [isLoading, setIsLoading] = useState(false);

  // The API client dispatches this when a refresh attempt fails, so the
  // context (which owns navigation) can clear state and redirect to /login
  // from anywhere in the app, including background requests.
  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
      setMenu([]);
      navigate("/login", { replace: true });
    }
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, [navigate]);

  async function login(payload: LoginPayload) {
    setIsLoading(true);
    try {
      const result = await authService.login(payload);
      tokenStorage.save(result);
      setUser(result.user);
      setMenu(result.menu);
      return result.user;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // Continue clearing the local session even if the backend call fails.
    } finally {
      tokenStorage.clear();
      setUser(null);
      setMenu([]);
      navigate("/login", { replace: true });
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, menu, isAuthenticated: Boolean(user), isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
