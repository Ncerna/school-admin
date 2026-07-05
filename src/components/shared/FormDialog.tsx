import { useEffect, useState, type FormEvent, useMemo } from "react";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldDef } from "@/types";

interface FormDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FieldDef<T>[];
  initialValues: T;
  onSubmit: (values: T) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  /** Backend field-level validation errors, e.g. { name: ["is required"] }. */
  serverErrors?: Record<string, string[]> | null;
  /** Whether the form options are still loading. */
  isFormLoading?: boolean;
}

export function FormDialog<T extends Record<string, any>>({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialValues,
  onSubmit,
  submitLabel = "Guardar",
  isSubmitting = false,
  serverErrors,
  isFormLoading = false,
}: FormDialogProps<T>) {
  const [values, setValues] = useState<T>(initialValues);

  // Sincroniza el formulario cada vez que se abre con un registro distinto
  // (creación vs. edición), evitando que queden datos de una sesión previa.
  useEffect(() => {
    if (open) setValues(initialValues);
  }, [open, initialValues]);

  function handleChange(name: keyof T, value: string | number) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  // Memoizar los fields para evitar que se recreen en cada renderizado
  const memoizedFields = useMemo(() => fields, [fields]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <DialogBody className="grid gap-4 sm:grid-cols-2">
            {memoizedFields.map((field) => {
              const name = String(field.name);
              const value = values[field.name] ?? "";
              const fieldErrors = serverErrors?.[name];

              return (
                <div key={name} className="grid gap-1.5">
                  <Label htmlFor={name}>
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </Label>

                  {field.type === "select" ? (
                    <Select
                      value={value || undefined}
                      onValueChange={(v) => handleChange(field.name, v)}
                    >
                      <SelectTrigger id={name} aria-invalid={Boolean(fieldErrors)}>
                        <SelectValue placeholder={field.placeholder ?? "Selecciona una opción"} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={name}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={value}
                      aria-invalid={Boolean(fieldErrors)}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={name}
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={value}
                      aria-invalid={Boolean(fieldErrors)}
                      onChange={(e) =>
                        handleChange(
                          field.name,
                          field.type === "number" ? Number(e.target.value) : e.target.value
                        )
                      }
                    />
                  )}

                  {/* Mensajes de validación devueltos por el backend. */}
                  {fieldErrors?.map((message) => (
                    <p key={message} className="text-xs text-destructive">
                      {message}
                    </p>
                  ))}
                </div>
              );
            })}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || isFormLoading}>
              Cancelar
            </Button>
            <LoadingButton type="submit" isLoading={isSubmitting || isFormLoading}>
              <Save className="h-4 w-4" />
              {submitLabel}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}