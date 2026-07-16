import { Badge } from "@/components/ui/badge";

// Charge status badge variant mapping
function getChargeStatusVariant(status: string): "success" | "secondary" | "destructive" {
  if (status === "Paid") return "success";
  if (status === "Pending" || status === "Partial") return "secondary";
  return "destructive";
}

export function ChargeStatusBadge({ status }: { status: string }) {
  return <Badge variant={getChargeStatusVariant(status)}>{status}</Badge>;
}