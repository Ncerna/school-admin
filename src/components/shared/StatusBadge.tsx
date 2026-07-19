import { Badge } from "@/components/ui/badge";
import type { Status, PublicationStatus } from "@/types";

type BadgeStatus = Status | PublicationStatus;

export function StatusBadge({ estado }: { estado: BadgeStatus }) {
  const variant = estado === "Activo" || estado === "Aprobado" ? "success" : "secondary";
  return <Badge variant={variant}>{estado}</Badge>;
}