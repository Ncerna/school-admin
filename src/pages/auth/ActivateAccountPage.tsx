import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/common/LoadingButton";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/types/api";

export default function ActivateAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setMismatch(true);
      return;
    }
    setMismatch(false);

    setIsSubmitting(true);
    try {
      await authService.activateAccount({ token, password, passwordConfirmation });
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo activar la cuenta. Inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">Activar cuenta</h1>
          <p className="text-sm text-muted-foreground">Establece tu contraseña personal para acceder al sistema.</p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center text-sm">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p>Cuenta activada correctamente. Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="passwordConfirmation">Confirmar contraseña</Label>
              <Input
                id="passwordConfirmation"
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••"
              />
              {mismatch && <p className="text-xs text-destructive">Las contraseñas no coinciden.</p>}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <LoadingButton type="submit" isLoading={isSubmitting} className="w-full">
              <KeyRound className="h-4 w-4" />
              Activar cuenta
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
