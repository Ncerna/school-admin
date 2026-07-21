import { useState } from "react";
import { RefreshCw, LogOut, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/common/LoadingButton";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

interface SessionExpiryModalProps {
  open: boolean;
  onRefreshed: () => void;
}

export function SessionExpiryModal({ open, onRefreshed }: SessionExpiryModalProps) {
  const { logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefresh() {
    setIsRefreshing(true);
    setError(null);
    try {
      // apiClient.refresh will update tokens in storage
      await apiClient.refresh();
      onRefreshed();
    } catch {
      setError("El refresh token es inválido o expiró. Cerrando sesión...");
      setTimeout(() => logout(), 1500);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm" hideCloseButton onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Tu sesión está por expirar
          </DialogTitle>
          <DialogDescription>
            Quedan menos de 5 minutos de sesión activa. Puedes refrescarla para continuar trabajando o cerrar
            sesión ahora.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <LoadingButton variant="outline" isLoading={isLoggingOut} onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </LoadingButton>
          <LoadingButton isLoading={isRefreshing} onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            Refrescar sesión
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
