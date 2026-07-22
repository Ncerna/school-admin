import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/common/LoadingButton";
import { AlertTriangle, Info, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import { coursesService } from "@/services/courses.service";
import { ConflictDeleteDialog, type DependencyInfo } from "@/components/shared/ConflictDeleteDialog";
import type { Course } from "@/types";

interface CourseDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onSuccess: () => void;
}

export function CourseDeleteDialog({ open, onOpenChange, course, onSuccess }: CourseDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dependencies, setDependencies] = useState<DependencyInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"confirm" | "dependencies">("confirm");

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setDependencies(null);
      setError(null);
      setIsLoading(false);
      setStep("confirm");
    }
  }, [open]);

  const handleInitialDelete = async () => {
    if (!course) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use requestWithData to capture the full response including error data
      const response = await apiClient.requestWithData<any>(`${ENDPOINTS.courses}/${course.id}`, {
        method: "DELETE",
      });
      
      if (response.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        // Check if this is a dependency error
        const responseData = response as any;
        
        if (responseData.requires_confirmation) {
          // Dependencies are in response.dependencies
          const deps = responseData.dependencies || {};
          setDependencies(deps);
          setError(response.message || "Este registro tiene datos dependientes.");
          setStep("dependencies");
        } else if (response.errors && typeof response.errors === 'object' && (response.errors as any).requires_confirmation) {
          // Fallback: check in errors object
          const deps = (response.errors as any).dependencies || {};
          setDependencies(deps);
          setError(response.message || "Este registro tiene datos dependientes.");
          setStep("dependencies");
        } else {
          setError(response.message || "No se pudo eliminar el registro.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el registro.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceDelete = async () => {
    if (!course) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await coursesService.removeForce(course.id);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el registro.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasDependencies = dependencies && Object.values(dependencies).some(v => v && v > 0);

  // Step 1: Initial confirmation dialog (like the original ConfirmDialog)
  if (step === "confirm" && !hasDependencies) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <DialogTitle>¿Eliminar este registro?</DialogTitle>
            </div>
            <DialogDescription className="mt-2">
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="mx-6 mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <LoadingButton variant="destructive" isLoading={isLoading} onClick={handleInitialDelete}>
              Eliminar
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 2: Dependencies dialog (using the generic component)
  return (
    <ConflictDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="¿Eliminar este curso?"
      message={error || "Este registro tiene datos dependientes. ¿Desea eliminarlo de todas formas?"}
      dependencies={dependencies}
      onConfirm={handleForceDelete}
      isLoading={isLoading}
      confirmLabel="Eliminar de todas formas"
    />
  );
}