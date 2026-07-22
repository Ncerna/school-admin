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

export interface DependencyInfo {
  [key: string]: number | undefined;
}

export interface ConflictDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  dependencies: DependencyInfo | null;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
}

export function ConflictDeleteDialog({
  open,
  onOpenChange,
  title,
  message,
  dependencies,
  onConfirm,
  isLoading = false,
  confirmLabel = "Eliminar de todas formas",
}: ConflictDeleteDialogProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setLocalError(null);
    }
  }, [open]);

  const hasDependencies = dependencies && Object.values(dependencies).some(v => v && v > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="mt-2">
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {dependencies && Object.keys(dependencies).length > 0 && (
          <div className="mx-6 mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  {message}
                </p>
                <div className="mt-3 space-y-1.5">
                  {Object.entries(dependencies).map(([key, value]) => {
                    const label = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim();
                    return (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label}:</span>
                        <span className="font-medium">{value ?? 0}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {localError && !hasDependencies && (
          <div className="mx-6 mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {localError}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          {hasDependencies ? (
            <LoadingButton
              variant="destructive"
              isLoading={isLoading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </LoadingButton>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}