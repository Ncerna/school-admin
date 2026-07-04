import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingLabel?: string;
}

/**
 * Every action button in the app (create, save, delete...) goes through this
 * component so the "Loading State after click" requirement is met in one
 * single place instead of being re-implemented per screen.
 */
export function LoadingButton({
  isLoading = false,
  loadingLabel,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={isLoading || disabled} className={cn(className)} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
