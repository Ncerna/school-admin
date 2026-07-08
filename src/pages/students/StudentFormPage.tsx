import { useEffect, useState, type FormEvent, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Button } from "@/components/ui/button";
import { studentsService } from "@/services/students.service";
import { ApiError } from "@/types/api";
import type { Student, StudentPayload } from "@/types";

const emptyStudent: StudentPayload = {
  firstName: "",
  lastName: "",
  dni: "",
  email: "",
  phone: "",
  gender: "",
  country: "",
  address: "",
  birthDate: "",
  emergencyContact: "",
  livesWithParents: true,
  guardian: { names: "", surnames: "", dni: "", phone: "", relationshipType: "" },
};

// Map API error field names to local field names
const errorFieldMap: Record<string, string> = {
  first_name: "names",
  last_name: "surnames",
  guardian_name: "guardian.names",
  guardian_dni: "guardian.dni",
  guardian_phone: "guardian.phone",
};

export default function StudentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [values, setValues] = useState<StudentPayload>(emptyStudent);

  // Ensure guardian is always defined (handles case when API returns undefined)
  const safeValues = {
    ...values,
    guardian: values.guardian ?? { names: "", surnames: "", dni: "", phone: "", relationshipType: "" },
  };
 
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Use a ref to track if this is the first render to avoid double fetch in StrictMode
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!id) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setIsLoading(true);
      studentsService
        .getById(id)
        .then((student) => setValues(student))
        .catch((err) => setGeneralError(err instanceof ApiError ? err.message : "No se pudo cargar el estudiante."))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  function updateField(key: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateGuardian(key: string, value: string) {
    setValues((prev) => ({
      ...prev,
      guardian: { ...(prev.guardian ?? { names: "", surnames: "", dni: "", phone: "", relationshipType: "" }), [key]: value },
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors(null);
    setGeneralError(null);
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await studentsService.update(id, values);
      } else {
        await studentsService.create(values);
      }
      navigate("/estudiantes");
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
        title={isEditing ? "Editar estudiante" : "Nuevo estudiante"}
        description="Completa la información del estudiante y su apoderado."
        action={
          <Button variant="outline" asChild>
            <Link to="/estudiantes">
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
        <p className="text-sm text-muted-foreground">Cargando información del estudiante...</p>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6">
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <h3 className="col-span-full text-sm font-semibold text-muted-foreground">Datos obligatorios</h3>

              <div className="grid gap-1.5">
                <Label>Nombres <span className="text-destructive">*</span></Label>
                <Input value={values.firstName } required onChange={(e) => updateField("firstName", e.target.value)} />
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
                <Label>Sexo <span className="text-destructive">*</span></Label>
                <Select value={values.gender} onValueChange={(v) => updateField("gender", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <h3 className="col-span-full text-sm font-semibold text-muted-foreground">Datos opcionales</h3>

              <div className="grid gap-1.5">
                <Label>País</Label>
                <Input value={values.country} onChange={(e) => updateField("country", e.target.value)} />
              </div>

              <div className="grid gap-1.5">
                <Label>Dirección</Label>
                <Input value={values.address} onChange={(e) => updateField("address", e.target.value)} />
              </div>

              <div className="grid gap-1.5">
                <Label>Fecha de nacimiento</Label>
                <Input type="date" value={values.birthDate} onChange={(e) => updateField("birthDate", e.target.value)} />
              </div>

              <div className="grid gap-1.5">
                <Label>Contacto de emergencia</Label>
                <Input value={values.emergencyContact} onChange={(e) => updateField("emergencyContact", e.target.value)} />
                {fieldError("emergencyContact") && <p className="text-xs text-destructive">{fieldError("emergencyContact")}</p>}
              </div>

              <label className="col-span-full flex items-center gap-2 text-sm">
                <Checkbox
                  checked={Boolean(values.livesWithParents)}
                  onCheckedChange={(checked) => updateField("livesWithParents", Boolean(checked))}
                />
                Vive con sus padres
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <h3 className="col-span-full text-sm font-semibold text-muted-foreground">Información del apoderado</h3>

              <div className="grid gap-1.5">
                <Label>Nombres <span className="text-destructive">*</span></Label>
                <Input
                  value={safeValues.guardian.names}
                  onChange={(e) => updateGuardian("names", e.target.value)}
                />
                {fieldError("guardian.names") && <p className="text-xs text-destructive">{fieldError("guardian.names")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Apellidos</Label>
                <Input
                  value={safeValues.guardian.surnames}
                  onChange={(e) => updateGuardian("surnames", e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>DNI <span className="text-destructive">*</span></Label>
                <Input type="number"
                  value={safeValues.guardian.dni}
                  onChange={(e) => updateGuardian("dni", e.target.value)}
                />
                {fieldError("guardian.dni") && <p className="text-xs text-destructive">{fieldError("guardian.dni")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Teléfono <span className="text-destructive">*</span></Label>
                <Input type="number"
                  value={safeValues.guardian.phone}
                  onChange={(e) => updateGuardian("phone", e.target.value)}
                />
                {fieldError("guardian.phone") && <p className="text-xs text-destructive">{fieldError("guardian.phone")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Tipo de parentesco</Label>
                <Select
                  value={safeValues.guardian.relationshipType}
                  onValueChange={(v) => updateGuardian("relationshipType", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Padre">Padre</SelectItem>
                    <SelectItem value="Madre">Madre</SelectItem>
                    <SelectItem value="Tutor">Tutor</SelectItem>
                    <SelectItem value="Abuelo(a)">Abuelo(a)</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/estudiantes")} disabled={isSaving}>
              Cancelar
            </Button>
            <LoadingButton type="submit" isLoading={isSaving}>
              <Save className="h-4 w-4" />
              {isEditing ? "Guardar cambios" : "Registrar estudiante"}
            </LoadingButton>
          </div>
        </form>
      )}
    </div>
  );
}