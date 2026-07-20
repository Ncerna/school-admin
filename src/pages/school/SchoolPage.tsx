import { useEffect, useState, type FormEvent, useRef } from "react";
import { Save, X, Image as ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Button } from "@/components/ui/button";
import { schoolService } from "@/services/school.service";
import { ApiError } from "@/types/api";
import { useToast } from "@/components/ui/toast";
import type { School, SchoolPayload } from "@/types";

const emptySchool: SchoolPayload = {
  name: "",
  address: "",
  phone: "",
  ugel: "",
  email: "",
  mission: "",
  vision: "",
  objectives: "",
  values: "",
  logo: "",
  banner: "",
};

export default function SchoolPage() {
  const { showToast } = useToast();
  const [values, setValues] = useState<School | SchoolPayload>(emptySchool);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setIsLoading(true);
      schoolService
        .get()
        .then((school) => {
          setValues(school);
          if (typeof school.logo === "string") {
            setLogoPreview(school.logo);
          }
          if (typeof school.banner === "string") {
            setBannerPreview(school.banner);
          }
        })
        .catch(() => {
          // No existe información, se mantiene el formulario vacío
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  function updateField(key: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setValues((prev) => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setValues((prev) => ({ ...prev, banner: file }));
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleRemoveLogo() {
    setValues((prev) => ({ ...prev, logo: "", logoRemove: true }));
    setLogoPreview(null);
  }

  function handleRemoveBanner() {
    setValues((prev) => ({ ...prev, banner: "", bannerRemove: true }));
    setBannerPreview(null);
  }

async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors(null);
    setGeneralError(null);
    setIsSaving(true);
    try {
      const payload: SchoolPayload = "id" in values ? values : values;
      if ("id" in values) {
        await schoolService.update(payload);
      } else {
        await schoolService.create(payload);
      }
      showToast("Información guardada correctamente.", "success");
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
        title="Configuración del Colegio"
        description="Registra o actualiza la información institucional del colegio."
      />

      {generalError && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {generalError}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando información del colegio...</p>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6">
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <h3 className="col-span-full text-sm font-semibold text-muted-foreground">Datos obligatorios</h3>

              <div className="grid gap-1.5">
                <Label>Nombre de la institución <span className="text-destructive">*</span></Label>
                <Input value={values.name} required onChange={(e) => updateField("name", e.target.value)} />
                {fieldError("name") && <p className="text-xs text-destructive">{fieldError("name")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Dirección <span className="text-destructive">*</span></Label>
                <Input value={values.address} required onChange={(e) => updateField("address", e.target.value)} />
                {fieldError("address") && <p className="text-xs text-destructive">{fieldError("address")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Teléfono <span className="text-destructive">*</span></Label>
                <Input type="tel" value={values.phone} required onChange={(e) => updateField("phone", e.target.value)} />
                {fieldError("phone") && <p className="text-xs text-destructive">{fieldError("phone")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>UGEL <span className="text-destructive">*</span></Label>
                <Input value={values.ugel} required onChange={(e) => updateField("ugel", e.target.value)} />
                {fieldError("ugel") && <p className="text-xs text-destructive">{fieldError("ugel")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Correo electrónico <span className="text-destructive">*</span></Label>
                <Input type="email" value={values.email} required onChange={(e) => updateField("email", e.target.value)} />
                {fieldError("email") && <p className="text-xs text-destructive">{fieldError("email")}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4 pt-6">
              <h3 className="col-span-full text-sm font-semibold text-muted-foreground">Información institucional</h3>

              <div className="grid gap-1.5">
                <Label>Misión <span className="text-destructive">*</span></Label>
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={values.mission}
                  required
                  onChange={(e) => updateField("mission", e.target.value)}
                  placeholder="Misión del colegio..."
                />
                {fieldError("mission") && <p className="text-xs text-destructive">{fieldError("mission")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Visión <span className="text-destructive">*</span></Label>
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={values.vision}
                  required
                  onChange={(e) => updateField("vision", e.target.value)}
                  placeholder="Visión del colegio..."
                />
                {fieldError("vision") && <p className="text-xs text-destructive">{fieldError("vision")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Objetivos <span className="text-destructive">*</span></Label>
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={values.objectives}
                  required
                  onChange={(e) => updateField("objectives", e.target.value)}
                  placeholder="Objetivos del colegio..."
                />
                {fieldError("objectives") && <p className="text-xs text-destructive">{fieldError("objectives")}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label>Valores <span className="text-destructive">*</span></Label>
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={values.values}
                  required
                  onChange={(e) => updateField("values", e.target.value)}
                  placeholder="Valores del colegio..."
                />
                {fieldError("values") && <p className="text-xs text-destructive">{fieldError("values")}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <h3 className="col-span-full text-sm font-semibold text-muted-foreground">Archivos opcionales</h3>

              <div className="grid gap-1.5">
                <Label>Logo institucional</Label>
                {logoPreview ? (
                  <div className="relative mb-2">
                    <img src={logoPreview} alt="Logo preview" className="h-24 w-auto rounded-md object-contain" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-input bg-muted/50 hover:bg-muted"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        setValues((prev) => ({ ...prev, logo: file }));
                        const reader = new FileReader();
                        reader.onload = () => setLogoPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    onClick={() => document.getElementById("logo-upload")?.click()}
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-1 text-center text-xs text-muted-foreground">Arrastra o haz clic</p>
                  </div>
                )}
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Banner institucional</Label>
                {bannerPreview ? (
                  <div className="relative mb-2">
                    <img src={bannerPreview} alt="Banner preview" className="h-24 w-full rounded-md object-cover" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={handleRemoveBanner}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-input bg-muted/50 hover:bg-muted"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        setValues((prev) => ({ ...prev, banner: file }));
                        const reader = new FileReader();
                        reader.onload = () => setBannerPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    onClick={() => document.getElementById("banner-upload")?.click()}
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-1 text-center text-xs text-muted-foreground">Arrastra o haz clic</p>
                  </div>
                )}
                <Input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerChange}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <LoadingButton type="submit" isLoading={isSaving}>
              <Save className="h-4 w-4" />
              Guardar información
            </LoadingButton>
          </div>
        </form>
      )}
    </div>
  );
}