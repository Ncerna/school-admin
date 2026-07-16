import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChargesPaymentPanel } from "@/components/payments/ChargesPaymentPanel";
import { ENDPOINTS } from "@/lib/endpoints";

export default function PaySuppliesPage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const id = Number(enrollmentId);

  return (
    <div>
      <PageHeader
        title="Pagar útiles"
        description={`Matrícula #${enrollmentId}`}
      />
      
      <ChargesPaymentPanel
        payableId={id}
        chargeTypeFilter="SUPPLIES"
        submitEndpoint={ENDPOINTS.paySupplies(id)}
      />
    </div>
  );
}