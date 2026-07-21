import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/lib/token-storage";
import type { AuthUser, LoginPayload, MenuPermission, LoginResult } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  menu: MenuPermission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingUsername: string | null;
  login: (payload: LoginPayload) => Promise<LoginResult>;
  logout: () => Promise<void>;
  clearPendingUsername: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() => tokenStorage.getUser());
  const [menu, setMenu] = useState<MenuPermission[]>(() => tokenStorage.getMenu());
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);

  // The API client dispatches this when a refresh attempt fails, so the
  // context (which owns navigation) can clear state and redirect to /login
  // from anywhere in the app, including background requests.
  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
      setMenu([]);
      setPendingUsername(null);
      navigate("/login", { replace: true });
    }
    function handleTokensUpdated() {
      // Tokens were updated (e.g., via refresh), re-read from storage
      // Note: user and menu don't change on refresh, only tokens
    }
    window.addEventListener("auth:session-expired", handleSessionExpired);
    window.addEventListener("auth:tokens-updated", handleTokensUpdated);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
      window.removeEventListener("auth:tokens-updated", handleTokensUpdated);
    };
  }, [navigate]);

async function login(payload: LoginPayload): Promise<LoginResult> {
    setIsLoading(true);
    try {
      const result = await authService.login(payload);
      
      // Handle different login response statuses
      if (result.status === "COMPLETE") {
        if (result.accessToken && result.refreshToken && result.expiresAt && result.user && result.menu) {
          tokenStorage.save({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresAt: result.expiresAt,
            user: result.user,
            menu: result.menu,
          });
          setUser(result.user);
          setMenu(result.menu);
        }
        setPendingUsername(null);
      } else if (result.status === "ACCOUNT_NOT_ACTIVATED") {
        setPendingUsername(payload.identifier);
      } else if (result.status === "PASSWORD_CHANGE_REQUIRED") {
        setPendingUsername(payload.identifier);
      }
      
      return result;
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
      setPendingUsername(null);
      navigate("/login", { replace: true });
    }
  }

  function clearPendingUsername() {
    setPendingUsername(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, menu, isAuthenticated: Boolean(user), isLoading, pendingUsername, login, logout, clearPendingUsername }}
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
