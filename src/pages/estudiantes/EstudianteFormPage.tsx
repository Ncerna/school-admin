import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Button } from "@/components/ui/button";
import { useLookupOptions } from "@/hooks/useLookupOptions";
import { studentsService } from "@/services/students.service";
import { gradesService } from "@/services/grades.service";
import { classroomsService } from "@/services/classrooms.service";
import { ApiError } from "@/types/api";
import type { Aula, Estudiante, Grado } from "@/types";

type StudentPayload = Omit<Estudiante, "id">;

const emptyStudent: StudentPayload = {
  nombres: "",
  apellidos: "",
  dni: "",
  correo: "",
  telefono: "",
  sexo: "",
  gradoId: "",
  aulaId: "",
  estado: "Activo",
  pais: "",
  direccion: "",
  fechaNacimiento: "",
  contactoEmergencia: "",
  viveConPadres: true,
  apoderado: { nombres: "", apellidos: "", telefono: "", tipoParentesco: "" },
};

export default function EstudianteFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [values, setValues] = useState<StudentPayload>(emptyStudent);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const { options: gradoOptions } = useLookupOptions<Grado>(gradesService, (g) => ({
    label: g.nombre,
    value: g.id,
  }));
  const { options: aulaOptions } = useLookupOptions<Aula>(classroomsService, (a) => ({
    label: a.nombre,
    value: a.id,
  }));

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    studentsService
      .getById(id)
      .then((student) => setValues(student))
      .catch((err) => setGeneralError(err instanceof ApiError ? err.message : "No se pudo cargar el estudiante."))
      .finally(() => setIsLoading(false));
  }, [id]);

  function update<K extends keyof StudentPayload>(key: K, value: StudentPayload[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateApoderado<K extends keyof StudentPayload["apoderado"]>(
    key: K,
    value: StudentPayload["apoderado"][K]
  ) {
    setValues((prev) => ({ ...prev, apoderado: { ...prev.apoderado, [key]: value } }));
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
        setErrors(err.errors);
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
                <Label>Nombres *</Label>
                <Input value={values.nombres} required onChange={(e) => update("nombres", e.target.value)} />
                {fieldError("nombres") && <p className="text-xs text-destructive">{fieldError("nombres")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Apellidos *</Label>
                <Input value={values.apellidos} required onChange={(e) => update("apellidos", e.target.value)} />
                {fieldError("apellidos") && <p className="text-xs text-destructive">{fieldError("apellidos")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>DNI *</Label>
                <Input value={values.dni} required onChange={(e) => update("dni", e.target.value)} />
                {fieldError("dni") && <p className="text-xs text-destructive">{fieldError("dni")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Correo electrónico *</Label>
                <Input type="email" value={values.correo} required onChange={(e) => update("correo", e.target.value)} />
                {fieldError("correo") && <p className="text-xs text-destructive">{fieldError("correo")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Teléfono *</Label>
                <Input value={values.telefono} required onChange={(e) => update("telefono", e.target.value)} />
              </div>

              <div className="grid gap-1.5">
                <Label>Sexo *</Label>
                <Select value={values.sexo} onValueChange={(v) => update("sexo", v as StudentPayload["sexo"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label>Grado *</Label>
                <Select value={values.gradoId} onValueChange={(v) => update("gradoId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradoOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label>Aula *</Label>
                <Select value={values.aulaId} onValueChange={(v) => update("aulaId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un aula" />
                  </SelectTrigger>
                  <SelectContent>
                    {aulaOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label>Estado *</Label>
                <Select value={values.estado} onValueChange={(v) => update("estado", v as StudentPayload["estado"])}>
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

          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <h3 className="col-span-full text-sm font-semibold text-muted-foreground">Datos opcionales</h3>

              <div className="grid gap-1.5">
                <Label>País</Label>
                <Input value={values.pais} onChange={(e) => update("pais", e.target.value)} />
              </div>

              <div className="grid gap-1.5">
                <Label>Dirección</Label>
                <Input value={values.direccion} onChange={(e) => update("direccion", e.target.value)} />
              </div>

              <div className="grid gap-1.5">
                <Label>Fecha de nacimiento</Label>
                <Input type="date" value={values.fechaNacimiento} onChange={(e) => update("fechaNacimiento", e.target.value)} />
              </div>

              <div className="grid gap-1.5">
                <Label>Contacto de emergencia</Label>
                <Input value={values.contactoEmergencia} onChange={(e) => update("contactoEmergencia", e.target.value)} />
              </div>

              <label className="col-span-full flex items-center gap-2 text-sm">
                <Checkbox
                  checked={Boolean(values.viveConPadres)}
                  onCheckedChange={(checked) => update("viveConPadres", Boolean(checked))}
                />
                Vive con sus padres
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <h3 className="col-span-full text-sm font-semibold text-muted-foreground">Información del apoderado</h3>

              <div className="grid gap-1.5">
                <Label>Nombres</Label>
                <Input
                  value={values.apoderado.nombres}
                  onChange={(e) => updateApoderado("nombres", e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Apellidos</Label>
                <Input
                  value={values.apoderado.apellidos}
                  onChange={(e) => updateApoderado("apellidos", e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Teléfono</Label>
                <Input
                  value={values.apoderado.telefono}
                  onChange={(e) => updateApoderado("telefono", e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Tipo de parentesco</Label>
                <Select
                  value={values.apoderado.tipoParentesco}
                  onValueChange={(v) => updateApoderado("tipoParentesco", v as StudentPayload["apoderado"]["tipoParentesco"])}
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
