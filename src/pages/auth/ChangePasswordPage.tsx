import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { KeyRound, CheckCircle2, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/common/LoadingButton";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/types/api";

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const masked = user.slice(0, 2) + "****@" + domain;
  return masked;
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { pendingUsername, clearPendingUsername } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!pendingUsername) {
      navigate("/login", { replace: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);

    setIsSubmitting(true);
    try {
      await authService.changePassword({ 
        identifier: pendingUsername, 
        currentPassword, 
        newPassword 
      });
      setSuccess(true);
      setTimeout(() => {
        clearPendingUsername();
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña. Inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!pendingUsername) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm text-center">
          <p className="text-sm text-muted-foreground">
            No hay una cuenta pendiente.{" "}
            <Link to="/login" className="text-primary hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">Establecer nueva contraseña</h1>
          <p className="text-sm text-muted-foreground">
            Tu contraseña temporal expiró. Crea una nueva contraseña.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span>{maskEmail(pendingUsername)}</span>
          </div>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center text-sm">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p>Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="currentPassword">Contraseña actual (temporal)</Label>
              <Input
                id="currentPassword"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              {mismatch && <p className="text-xs text-destructive">Las contraseñas no coinciden.</p>}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <LoadingButton type="submit" isLoading={isSubmitting} className="w-full">
              <KeyRound className="h-4 w-4" />
              Cambiar contraseña
            </LoadingButton>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="text-muted-foreground hover:text-foreground hover:underline">
            Volver a inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}