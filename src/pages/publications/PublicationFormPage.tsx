import { useEffect, useState, type FormEvent, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, X, Image as ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Button } from "@/components/ui/button";
import { publicationService } from "@/services/publication.service";
import { ApiError } from "@/types/api";
import type { Publication, PublicationPayload, PublicationStatus, PublicationSection } from "@/types";

const emptyPublication: PublicationPayload = {
  title: "",
  date: "",
  section: "Noticias",
  targetAudience: "",
  status: "Pendiente",
  color: "",
  description: "",
  isVirtual: false,
  image: "",
  url: "",
};

export default function PublicationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [values, setValues] = useState<PublicationPayload>(emptyPublication);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!id) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setIsLoading(true);
      publicationService
        .getById(id)
        .then((publication) => {
          setValues(publication);
          if (typeof publication.image === "string") {
            setImagePreview(publication.image);
          }
        })
        .catch((err) => setGeneralError(err instanceof ApiError ? err.message : "No se pudo cargar la publicación."))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  function updateField(key: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setValues((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleRemoveImage() {
    setValues((prev) => ({ ...prev, image: "", imgRemove: true }));
    setImagePreview(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors(null);
    setGeneralError(null);
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await publicationService.update(id, values);
      } else {
        await publicationService.create(values);
      }
      navigate("/publicaciones");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors || {});
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
        title={isEditing ? "Editar publicación" : "Nueva publicación"}
        description="Completa la información de la publicación o evento."
        action={
          <Button variant="outline" asChild>
            <Link to="/publicaciones">
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
        <p className="text-sm text-muted-foreground">Cargando información de la publicación...</p>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6">
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <h3 className="col-span-full text-sm font-semibold text-muted-foreground">Datos obligatorios</h3>

              <div className="grid gap-1.5">
                <Label>Título <span className="text-destructive">*</span></Label>
                <Input value={values.title} required onChange={(e) => updateField("title", e.target.value)} />
                {fieldError("title") && <p className="text-xs text-destructive">{fieldError("title")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Fecha del evento <span className="text-destructive">*</span></Label>
                <Input type="date" value={values.date} required onChange={(e) => updateField("date", e.target.value)} />
              </div>

              <div className="grid gap-1.5">
                <Label>Ubicación</Label>
                <Input value={values.location} onChange={(e) => updateField("location", e.target.value)} />
                {fieldError("location") && <p className="text-xs text-destructive">{fieldError("location")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Color <span className="text-destructive">*</span></Label>
                <Input type="color" value={values.color} required onChange={(e) => updateField("color", e.target.value)} />
              </div>

              <div className="grid gap-1.5">
                <Label>Sección <span className="text-destructive">*</span></Label>
                <Select value={values.section} onValueChange={(v) => updateField("section", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Noticias">Noticias</SelectItem>
                    <SelectItem value="Eventos">Eventos</SelectItem>
                    <SelectItem value="Logros">Logros</SelectItem>
                    <SelectItem value="Trabajos">Trabajos</SelectItem>
                    <SelectItem value="Avisos">Avisos</SelectItem>
                  </SelectContent>
                </Select>
                {fieldError("section") && <p className="text-xs text-destructive">{fieldError("section")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Público objetivo <span className="text-destructive">*</span></Label>
                <Input value={values.targetAudience} required onChange={(e) => updateField("targetAudience", e.target.value)} />
                {fieldError("targetAudience") && <p className="text-xs text-destructive">{fieldError("targetAudience")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Estado <span className="text-destructive">*</span></Label>
                <Select value={values.status} onValueChange={(v) => updateField("status", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Aprobado">Aprobado</SelectItem>
                    <SelectItem value="Archivado">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
              <h3 className="col-span-full text-sm font-semibold text-muted-foreground">Datos opcionales</h3>

              <div className="grid gap-1.5">
                <Label>Descripción <span className="text-destructive">*</span></Label>
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={values.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Escribe la descripción de la publicación..."
                  required
                />
                {fieldError("description") && <p className="text-xs text-destructive">{fieldError("description")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Imagen</Label>
                {imagePreview ? (
                  <div className="relative mb-2">
                    <img src={imagePreview} alt="Preview" className="h-48 w-full rounded-md object-cover" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-input bg-muted/50 hover:bg-muted"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        setValues((prev) => ({ ...prev, image: file }));
                        const reader = new FileReader();
                        reader.onload = () => setImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-center text-sm text-muted-foreground">Arrastra una imagen o haz clic para seleccionar</p>
                  </div>
                )}
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Evento virtual</Label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={Boolean(values.isVirtual)}
                    onCheckedChange={(checked) => updateField("isVirtual", Boolean(checked))}
                  />
                  Evento virtual
                </label>

                {values.isVirtual && (
                  <div className="grid gap-1.5 mt-2">
                    <Label>URL <span className="text-destructive">*</span></Label>
                    <Input
                      type="url"
                      value={values.url}
                      required
                      onChange={(e) => updateField("url", e.target.value)}
                      placeholder="https://"
                    />
                    {fieldError("url") && <p className="text-xs text-destructive">{fieldError("url")}</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/publicaciones")} disabled={isSaving}>
              Cancelar
            </Button>
            <LoadingButton type="submit" isLoading={isSaving}>
              <Save className="h-4 w-4" />
              {isEditing ? "Guardar cambios" : "Registrar publicación"}
            </LoadingButton>
          </div>
        </form>
      )}
    </div>
  );
}