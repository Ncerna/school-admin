import { Badge } from "@/components/ui/badge";
import type { Estado } from "@/types";

export function StatusBadge({ estado }: { estado: Estado }) {
  return <Badge variant={estado === "Activo" ? "success" : "secondary"}>{estado}</Badge>;
}
