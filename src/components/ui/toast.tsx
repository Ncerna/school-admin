import * as React from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = React.createContext<{
  showToast: (message: string, variant?: "default" | "success" | "error") => void;
} | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    // Return a no-op function if used outside provider (for safety)
    return { showToast: () => {} };
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<{ id: number; message: string; variant: string }>>([]);

  const showToast = (message: string, variant: "default" | "success" | "error" = "default") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md shadow-md text-sm animate-in slide-in-from-right",
              toast.variant === "success" && "bg-emerald-100 text-emerald-800",
              toast.variant === "error" && "bg-destructive/10 text-destructive",
              toast.variant === "default" && "bg-popover text-popover-foreground"
            )}
          >
            {toast.variant === "success" && <CheckCircle className="h-4 w-4" />}
            {toast.variant === "error" && <XCircle className="h-4 w-4" />}
            {toast.variant === "default" && <Info className="h-4 w-4" />}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}