import { Badge } from "@/components/ui/badge";
import type { Status, PublicationStatus } from "@/types";

type BadgeStatus = Status | PublicationStatus;

export function StatusBadge({ estado }: { estado: BadgeStatus | string }) {
  const isActive = estado === "Activo" || estado === "Active" || estado === "Aprobado";
  const variant = isActive ? "success" : "secondary";
  const label = estado === "Active" ? "Activo" : estado === "Withdrawn" ? "Retirado" : estado;
  return <Badge variant={variant}>{label}</Badge>;
}
