import { Badge } from "@/components/ui/badge";
import type { Status } from "@/types";

export function StatusBadge({ estado }: { estado: Status }) {
  return <Badge variant={estado === "Activo" ? "success" : "secondary"}>{estado}</Badge>;
}