import { useEffect, useState, type FormEvent, useRef, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Button } from "@/components/ui/button";
import { staffService } from "@/services/staff.service";
import { rolesService } from "@/services/roles.service";
import { ApiError } from "@/types/api";
import type { Staff, StaffPayload, Role } from "@/types";
import { useToast } from "@/components/ui/toast";

const emptyStaff: StaffPayload = {
  firstName: "",
  lastName: "",
  dni: "",
  email: "",
  phone: "",
  position: "",
  role: "",
};

// Map API error field names to local field names
const errorFieldMap: Record<string, string> = {
  first_name: "firstName",
  last_name: "lastName",
};

export default function StaffFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const staffId = (location.state as { staffId?: string })?.staffId;
  const isEditing = Boolean(staffId);

  const [values, setValues] = useState<StaffPayload>(emptyStaff);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [roleOptions, setRoleOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  // Fetch roles using rolesService.list (paginated endpoint)
  const fetchRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    try {
      const response = await rolesService.list();
      setRoleOptions(response.items.map((r: Role) => ({
        label: r.name,
        value: String(r.id),
      })));
    } catch (err) {
      console.error("Error fetching roles:", err);
      setRoleOptions([]);
    } finally {
      setIsLoadingRoles(false);
    }
  }, []);

  // Use a ref to track if this is the first render to avoid double fetch in StrictMode
  const isFirstRender = useRef(true);
  const hasFetchedRoles = useRef(false);

  useEffect(() => {
    // Fetch roles on mount (lazy loading)
    if (!hasFetchedRoles.current) {
      hasFetchedRoles.current = true;
      fetchRoles();
    }
  }, [fetchRoles]);

  useEffect(() => {
    if (!staffId) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setIsLoading(true);
      staffService
        .getById(staffId)
        .then((staff) => setValues(staff))
        .catch((err) => setGeneralError(err instanceof ApiError ? err.message : "No se pudo cargar el personal."))
        .finally(() => setIsLoading(false));
    }
  }, [staffId]);

  function updateField(key: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors(null);
    setGeneralError(null);
    setIsSaving(true);
    try {
      if (isEditing && staffId) {
        await staffService.update(staffId, values);
      } else {
        await staffService.create(values);
        showToast("Personal creado. Se enviaron las credenciales de acceso al correo registrado.", "success");
      }
      navigate("/personal-administrativo");
    } catch (err) {
      if (err instanceof ApiError) {
        // Map API error field names to local field names
        const mappedErrors: Record<string, string[]> = {};
        for (const [apiField, messages] of Object.entries(err.errors || {})) {
          const localField = errorFieldMap[apiField] || apiField;
          mappedErrors[localField] = messages;
        }
        setErrors(mappedErrors);
        setGeneralError(err.message);
      }
    } finally {
      setIsSaving(false);
    }
  }

  function fieldError(name: string) {
    return errors?.[name]?.[0];
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? "Editar personal" : "Nuevo personal"}
        description="Completa la información del personal administrativo."
        action={
          <Button variant="outline" asChild>
            <Link to="/personal-administrativo">
              <ArrowLeft className="h-4 w-4" />
              Volver al listado
            </Link>
          </Button>
        }
      />

      {generalError && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {generalError}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando información del personal...</p>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6">
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <h3 className="col-span-full text-sm font-semibold text-muted-foreground">Datos obligatorios</h3>

              <div className="grid gap-1.5">
                <Label>Nombres <span className="text-destructive">*</span></Label>
                <Input value={values.firstName} required onChange={(e) => updateField("firstName", e.target.value)} />
                {fieldError("firstName") && <p className="text-xs text-destructive">{fieldError("firstName")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Apellidos <span className="text-destructive">*</span></Label>
                <Input value={values.lastName} required onChange={(e) => updateField("lastName", e.target.value)} />
                {fieldError("lastName") && <p className="text-xs text-destructive">{fieldError("lastName")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>DNI <span className="text-destructive">*</span></Label>
                <Input type="number" value={values.dni} required onChange={(e) => updateField("dni", e.target.value)} />
                {fieldError("dni") && <p className="text-xs text-destructive">{fieldError("dni")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Correo electrónico <span className="text-destructive">*</span></Label>
                <Input type="email" value={values.email} required onChange={(e) => updateField("email", e.target.value)} />
                {fieldError("email") && <p className="text-xs text-destructive">{fieldError("email")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Teléfono <span className="text-destructive">*</span></Label>
                <Input type="number" value={values.phone} required onChange={(e) => updateField("phone", e.target.value)} />
              </div>

              <div className="grid gap-1.5">
                <Label>Cargo <span className="text-destructive">*</span></Label>
                <Input value={values.position} required onChange={(e) => updateField("position", e.target.value)} />
              </div>

              <div className="grid gap-1.5">
                <Label>Rol <span className="text-destructive">*</span></Label>
                <Select 
                  value={values.role} 
                  onValueChange={(v) => updateField("role", v)}
                  disabled={isLoadingRoles}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions
                      .filter(role => role.label !== "ALUM" && role.label !== "DOC")
                      .map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/personal-administrativo")} disabled={isSaving}>
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <LoadingButton type="submit" isLoading={isSaving}>
              <Save className="h-4 w-4" />
              {isEditing ? "Guardar cambios" : "Registrar personal"}
            </LoadingButton>
          </div>
        </form>
      )}
    </div>
  );
}