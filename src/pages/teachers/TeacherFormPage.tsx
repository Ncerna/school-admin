import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Button } from "@/components/ui/button";
import { teachersService } from "@/services/teachers.service";
import { ApiError } from "@/types/api";
import type { Teacher } from "@/types";

type TeacherPayload = Omit<Teacher, "id">;

const emptyTeacher: TeacherPayload = {
  names: "",
  surnames: "",
  dni: "",
  specialty: "",
  email: "",
  phone: "",
  status: "Activo",
};

// Map API error field names to local field names
const errorFieldMap: Record<string, string> = {
  names: "names",
  surnames: "surnames",
  dni: "dni",
  email: "email",
  phone: "phone",
  specialty: "specialty",
};

export default function TeacherFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [values, setValues] = useState<TeacherPayload>(emptyTeacher);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    teachersService
      .getById(id)
      .then((teacher) => setValues(teacher))
      .catch((err) => setGeneralError(err instanceof ApiError ? err.message : "No se pudo cargar el docente."))
      .finally(() => setIsLoading(false));
  }, [id]);

  function updateField(key: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors(null);
    setGeneralError(null);
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await teachersService.update(id, values);
      } else {
        await teachersService.create(values);
      }
      navigate("/docentes");
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
        title={isEditing ? "Editar docente" : "Nuevo docente"}
        description="Completa la información del docente."
        action={
          <Button variant="outline" asChild>
            <Link to="/docentes">
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
        <p className="text-sm text-muted-foreground">Cargando información del docente...</p>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6">
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <h3 className="col-span-full text-sm font-semibold text-muted-foreground">Datos obligatorios</h3>

              <div className="grid gap-1.5">
                <Label>Nombres <span className="text-destructive">*</span></Label>
                <Input value={values.names} required onChange={(e) => updateField("names", e.target.value)} />
                {fieldError("names") && <p className="text-xs text-destructive">{fieldError("names")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Apellidos <span className="text-destructive">*</span></Label>
                <Input value={values.surnames} required onChange={(e) => updateField("surnames", e.target.value)} />
                {fieldError("surnames") && <p className="text-xs text-destructive">{fieldError("surnames")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>DNI <span className="text-destructive">*</span></Label>
                <Input value={values.dni} required onChange={(e) => updateField("dni", e.target.value)} />
                {fieldError("dni") && <p className="text-xs text-destructive">{fieldError("dni")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Correo electrónico <span className="text-destructive">*</span></Label>
                <Input type="email" value={values.email} required onChange={(e) => updateField("email", e.target.value)} />
                {fieldError("email") && <p className="text-xs text-destructive">{fieldError("email")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Teléfono <span className="text-destructive">*</span></Label>
                <Input value={values.phone} required onChange={(e) => updateField("phone", e.target.value)} />
                {fieldError("phone") && <p className="text-xs text-destructive">{fieldError("phone")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Especialidad <span className="text-destructive">*</span></Label>
                <Select value={values.specialty} onValueChange={(v) => updateField("specialty", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nombrado">Nombrado</SelectItem>
                    <SelectItem value="Contratado">Contratado</SelectItem>
                    <SelectItem value="Auxiliar">Auxiliar</SelectItem>
                  </SelectContent>
                </Select>
                {fieldError("specialty") && <p className="text-xs text-destructive">{fieldError("specialty")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Estado <span className="text-destructive">*</span></Label>
                <Select value={values.status} onValueChange={(v) => updateField("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/docentes")} disabled={isSaving}>
              Cancelar
            </Button>
            <LoadingButton type="submit" isLoading={isSaving}>
              <Save className="h-4 w-4" />
              {isEditing ? "Guardar cambios" : "Registrar docente"}
            </LoadingButton>
          </div>
        </form>
      )}
    </div>
  );
}