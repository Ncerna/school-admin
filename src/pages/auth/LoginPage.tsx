import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Lock, User, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/common/LoadingButton";
import { useAuth } from "@/context/AuthContext";
import type { LoginStatus } from "@/types/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, pendingUsername } = useAuth();
  const [identifier, setIdentifier] = useState(pendingUsername ?? "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await login({ identifier, password });
      
      switch (result.status) {
        case "COMPLETE":
          navigate("/dashboard", { replace: true });
          break;
        case "ACCOUNT_NOT_ACTIVATED":
          navigate("/activar-cuenta", { replace: true });
          break;
        case "PASSWORD_CHANGE_REQUIRED":
          navigate("/cambiar-contrasena", { replace: true });
          break;
        case "USER_NOT_FOUND":
        case "INVALID_PASSWORD":
        case "INVALID_CREDENTIALS":
        case "ACCOUNT_INACTIVE":
          setError(result.message ?? "Error de autenticación");
          break;
      }
    } catch {
      setError("No se pudo iniciar sesión. Inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">I.E.P Isaac Newton</h1>
          <p className="text-sm text-muted-foreground">Ingresa con tu usuario o correo institucional.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="identifier">Usuario o correo electrónico</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="identifier"
                required
                autoComplete="username"
                className="pl-8"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="usuario@colegio.edu.pe"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className="pl-8"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <LoadingButton type="submit" isLoading={isSubmitting} className="w-full">
            <LogIn className="h-4 w-4" />
            Ingresar
          </LoadingButton>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          <Link to="/activar-cuenta" className="text-muted-foreground hover:text-foreground hover:underline">
            ¿Necesitas activar tu cuenta?
          </Link>
          <Link to="/" className="text-muted-foreground hover:text-foreground hover:underline">
            Ir al Portal Institucional
          </Link>
        </div>
      </div>
    </div>
  );
}